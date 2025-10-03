import type {
  JsonSchemaDefinition,
  Model,
  ModelProvider,
  ModelSettings,
  Tool,
} from "@openai/agents";
import { z } from "zod";

export const ModelReferenceSchema = z.union([
  z.string().min(1, "model name cannot be empty"),
  z.object({
    provider: z.string().min(1, "model provider cannot be empty"),
    name: z.string().min(1, "model name cannot be empty"),
    options: z.record(z.unknown()).optional(),
    settings: z.record(z.unknown()).optional(),
  }),
]);

export type ModelReference = z.infer<typeof ModelReferenceSchema>;

export const ToolDefinitionSchema = z.object({
  name: z.string().min(1, "tool name cannot be empty"),
  description: z.string().optional(),
  parameters: z.record(z.unknown()).optional(),
  strict: z.boolean().optional(),
  handler: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const AgentDefinitionSchema = z.object({
  name: z.string().optional(),
  instructions: z.string().optional(),
  handoffDescription: z.string().optional(),
  model: ModelReferenceSchema.optional(),
  modelSettings: z.record(z.unknown()).optional(),
  output: z.union([z.literal("text"), z.record(z.unknown())]).optional(),
  tools: z.array(ToolDefinitionSchema).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type AgentDefinition = z.infer<typeof AgentDefinitionSchema>;
export type ToolDefinition = z.infer<typeof ToolDefinitionSchema>;

export type ResolvedAgentDefinition = AgentDefinition & {
  name: string;
  instructions: string;
};

export interface WorkflowNode {
  id: string;
  label?: string;
  definition?: ResolvedAgentDefinition;
  source?: "inline" | "reference" | "config";
}

export interface WorkflowEdge {
  from: string;
  to: string;
  label?: string;
}

export interface WorkflowDefinition {
  id: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  metadata?: Record<string, unknown>;
}

export interface MarkdownWorkflowDocument {
  workflows: WorkflowDefinition[];
  jsonBlocks: Record<string, unknown>;
}

export interface ResolvedAgentConfig {
  name: string;
  instructions: string;
  handoffDescription: string;
  model: string | Model;
  modelSettings?: ModelSettings;
  tools: Tool[];
  outputType?: JsonSchemaDefinition | "text";
}

export interface AgentGraphNode {
  id: string;
  definition: ResolvedAgentDefinition;
  config: ResolvedAgentConfig;
}

export interface AgentWorkflowGraph {
  id: string;
  nodes: Map<string, AgentGraphNode>;
  edges: WorkflowEdge[];
  metadata?: Record<string, unknown>;
}

export interface ModelResolverMap {
  [provider: string]:
    | ModelProvider
    | ((name: string, definition: AgentDefinition) => Promise<Model | string>);
}

export interface AgentFactoryOptions {
  defaultModel?: string;
  modelResolvers?: ModelResolverMap;
  toolRegistry?: Record<string, Tool>;
}

export interface MarkdownWorkflowOptions {
  baseDir?: string;
}
