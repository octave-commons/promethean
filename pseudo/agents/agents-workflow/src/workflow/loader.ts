import { readFile } from "node:fs/promises";
import path from "node:path";

import type {
  JsonSchemaDefinition,
  Model,
  ModelProvider,
  ModelSettings,
  Tool,
} from "@openai/agents";

import type {
  AgentDefinition,
  AgentGraphNode,
  AgentWorkflowGraph,
  AgentFactoryOptions,
  MarkdownWorkflowDocument,
  ResolvedAgentDefinition,
  WorkflowDefinition,
  WorkflowNode,
} from "./types.js";
import { AgentDefinitionSchema } from "./types.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mergeDefinitions(
  base: Partial<AgentDefinition>,
  update?: Partial<AgentDefinition>,
): Partial<AgentDefinition> {
  if (!update) return base;
  const merged: Partial<AgentDefinition> = { ...base, ...update };
  const mergeObjects = <T>(a?: T, b?: T): T | undefined => {
    if (!isRecord(a) && !isRecord(b)) return undefined;
    return { ...(isRecord(a) ? (a as object) : {}), ...(isRecord(b) ? (b as object) : {}) } as T;
  };
  const ms = mergeObjects(base.modelSettings, update.modelSettings);
  if (ms) merged.modelSettings = ms;
  const md = mergeObjects(base.metadata, update.metadata);
  if (md) merged.metadata = md;
  if (update.tools) merged.tools = update.tools;
  return merged;
}

async function loadReferencedDefinition(
  reference: string,
  baseDir: string,
): Promise<Partial<AgentDefinition>> {
  const relative = reference.replace(/^(?:ref|file):/iu, "").trim();
  if (!relative) {
    throw new Error("Reference path cannot be empty.");
  }
  const resolved = path.isAbsolute(relative)
    ? relative
    : path.join(baseDir, relative);
  const content = await readFile(resolved, "utf8");
  if (/\.jsonc?$/iu.test(relative)) {
    return JSON.parse(content) as Partial<AgentDefinition>;
  }
  return { instructions: content.trim() };
}

function parseInlineDefinition(label?: string): {
  definition?: Partial<AgentDefinition>;
  reference?: string;
  fallbackInstructions?: string;
} {
  if (!label) {
    return {};
  }
  const trimmed = label.trim();
  if (!trimmed) {
    return {};
  }
  const referenceMatch = trimmed.match(/^(ref|file):(.+)$/iu);
  if (referenceMatch) {
    return { reference: referenceMatch[0] };
  }
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed) as Partial<AgentDefinition>;
      return { definition: parsed };
    } catch (error) {
      throw new Error(
        `Failed to parse inline JSON for node: ${(error as Error).message}`,
      );
    }
  }
  return { fallbackInstructions: trimmed };
}

function gatherConfigDefinition(
  nodeId: string,
  jsonBlocks: Record<string, unknown>,
): Partial<AgentDefinition> | undefined {
  let definition: Partial<AgentDefinition> | undefined;
  for (const block of Object.values(jsonBlocks)) {
    if (!isRecord(block)) {
      continue;
    }
    if (isRecord(block.agents) && isRecord(block.agents[nodeId])) {
      definition = mergeDefinitions(
        definition ?? {},
        block.agents[nodeId] as Partial<AgentDefinition>,
      );
    }
    if (isRecord(block[nodeId])) {
      definition = mergeDefinitions(
        definition ?? {},
        block[nodeId] as Partial<AgentDefinition>,
      );
    }
  }
  return definition;
}

export type DefinitionResolutionOptions = {
  baseDir?: string;
}

async function resolveNodeDefinition(
  node: WorkflowNode,
  jsonBlocks: Record<string, unknown>,
  options: DefinitionResolutionOptions,
): Promise<{
  definition: ResolvedAgentDefinition;
  source: WorkflowNode["source"];
}> {
  const baseDir = options.baseDir ?? process.cwd();
  const inline = parseInlineDefinition(node.label);
  let definition: Partial<AgentDefinition> = inline.definition ?? {};
  let source: WorkflowNode["source"];

  if (inline.reference) {
    const referenced = await loadReferencedDefinition(
      inline.reference,
      baseDir,
    );
    definition = mergeDefinitions(definition, referenced);
    source = "reference";
  }

  const fromConfig = gatherConfigDefinition(node.id, jsonBlocks);
  if (fromConfig) {
    definition = mergeDefinitions(definition, fromConfig);
    if (!source) {
      source = "config";
    }
  }

  if (inline.fallbackInstructions && !definition.instructions) {
    definition.instructions = inline.fallbackInstructions;
    if (!source) {
      source = "inline";
    }
  }

  const validated = AgentDefinitionSchema.parse(definition);
  const instructions = validated.instructions ?? inline.fallbackInstructions;
  if (!instructions) {
    throw new Error(`Agent node "${node.id}" is missing instructions.`);
  }

  return {
    definition: {
      ...validated,
      instructions,
      name: validated.name ?? node.id,
    },
    source: source ?? (inline.definition ? "inline" : undefined),
  };
}

export async function resolveWorkflowDefinitions(
  document: MarkdownWorkflowDocument,
  options: DefinitionResolutionOptions = {},
): Promise<WorkflowDefinition[]> {
  const resolved: WorkflowDefinition[] = [];
  for (const workflow of document.workflows) {
    const nodes: WorkflowNode[] = [];
    for (const node of workflow.nodes) {
      const { definition, source } = await resolveNodeDefinition(
        node,
        document.jsonBlocks,
        options,
      );
      nodes.push({ ...node, definition, source });
    }
    resolved.push({ ...workflow, nodes });
  }
  return resolved;
}

async function resolveModel(
  nodeId: string,
  definition: AgentDefinition,
  options: AgentFactoryOptions,
): Promise<string | Model> {
  const reference = definition.model;
  if (!reference) {
    return options.defaultModel ?? "gpt-4.1-mini";
  }
  if (typeof reference === "string") {
    return reference;
  }
  const providerKey = reference.provider;
  const resolvers = options.modelResolvers ?? {};
  const resolver = resolvers[providerKey];
  if (!resolver) {
    if (providerKey === "openai") {
      return reference.name;
    }
    throw new Error(
      `No model resolver registered for provider "${providerKey}" (agent "${nodeId}").`,
    );
  }
  if (typeof (resolver as ModelProvider).getModel === "function") {
    return await (resolver as ModelProvider).getModel(reference.name);
  }
  return await (
    resolver as (
      name: string,
      definition: AgentDefinition,
    ) => Promise<Model | string>
  )(reference.name, definition);
}

function resolveTools(
  definition: AgentDefinition,
  options: AgentFactoryOptions,
): Tool[] {
  if (!definition.tools || definition.tools.length === 0) {
    return [];
  }
  const registry = options.toolRegistry ?? {};
  const tools: Tool[] = [];
  for (const toolDef of definition.tools) {
    if (!toolDef.handler) {
      continue;
    }
    const tool = registry[toolDef.handler];
    if (!tool) {
      throw new Error(`No tool registered for handler "${toolDef.handler}".`);
    }
    tools.push(tool);
  }
  return tools;
}

function mergeModelSettings(
  definition: AgentDefinition,
): ModelSettings | undefined {
  const explicit = definition.modelSettings;
  if (!definition.model || typeof definition.model === "string") {
    return explicit as ModelSettings | undefined;
  }
  const providerSettings = isRecord(definition.model.settings)
    ? (definition.model.settings)
    : undefined;
  if (!providerSettings && !explicit) {
    return undefined;
  }
  return {
    ...(providerSettings ?? {}),
    ...(explicit ?? {}),
  } as ModelSettings;
}

function resolveOutput(
  definition: AgentDefinition,
): JsonSchemaDefinition | "text" | undefined {
  if (!definition.output) {
    return undefined;
  }
  if (definition.output === "text") {
    return "text";
  }
  return definition.output as JsonSchemaDefinition;
}

export async function createAgentWorkflowGraph(
  workflow: WorkflowDefinition,
  options: AgentFactoryOptions = {},
): Promise<AgentWorkflowGraph> {
  const nodes = new Map<string, AgentGraphNode>();
  for (const node of workflow.nodes) {
    if (!node.definition) {
      throw new Error(
        `Workflow node "${node.id}" is missing a resolved agent definition.`,
      );
    }
    const definition = node.definition;
    const model = await resolveModel(node.id, definition, options);
    const modelSettings = mergeModelSettings(definition);
    const outputType = resolveOutput(definition);
    const config = {
      name: definition.name ?? node.id,
      instructions: definition.instructions,
      handoffDescription:
        definition.handoffDescription ?? definition.instructions,
      model,
      ...(modelSettings ? { modelSettings } : {}),
      tools: resolveTools(definition, options),
      ...(outputType ? { outputType } : {}),
    } satisfies AgentGraphNode["config"];
    nodes.set(node.id, {
      id: node.id,
      definition: {
        ...definition,
        name: definition.name ?? node.id,
        instructions: definition.instructions,
      },
      config,
    });
  }
  return {
    id: workflow.id,
    nodes,
    edges: workflow.edges,
    metadata: workflow.metadata,
  };
}
