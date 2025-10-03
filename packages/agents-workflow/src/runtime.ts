import type {
  AgentWorkflowGraph,
  AgentFactoryOptions,
  MarkdownWorkflowDocument,
  MarkdownWorkflowOptions,
} from "./workflow/types.js";
import { parseMarkdownWorkflows } from "./workflow/markdown.js";
import {
  createAgentWorkflowGraph,
  resolveWorkflowDefinitions,
  type DefinitionResolutionOptions,
} from "./workflow/loader.js";

export interface WorkflowRuntimeOptions
  extends MarkdownWorkflowOptions,
    DefinitionResolutionOptions,
    AgentFactoryOptions {}

export async function loadAgentWorkflowsFromMarkdown(
  content: string,
  options: WorkflowRuntimeOptions = {},
): Promise<{
  document: MarkdownWorkflowDocument;
  graphs: AgentWorkflowGraph[];
}> {
  const document = parseMarkdownWorkflows(content, options);
  const workflows = await resolveWorkflowDefinitions(document, options);
  const graphs: AgentWorkflowGraph[] = [];
  for (const workflow of workflows) {
    const graph = await createAgentWorkflowGraph(workflow, options);
    graphs.push(graph);
  }
  return { document, graphs };
}
