import { unified } from 'unified';
import remarkParse from 'remark-parse';

import { parseMermaidGraph } from './mermaid.js';
import type {
  MarkdownWorkflowDocument,
  MarkdownWorkflowOptions,
  WorkflowDefinition,
} from './types.js';

type HeadingNode = { children?: Array<{ value?: string }> };
type CodeNode = {
  lang?: string | null;
  meta?: string | null;
  value?: string;
  [key: string]: unknown;
};
type MarkdownNode = (HeadingNode | CodeNode) & { type: string };
type MarkdownTree = { children?: MarkdownNode[] };

const headingText = (node: HeadingNode): string =>
  (node.children ?? [])
    .map((child) => (typeof child.value === 'string' ? child.value : ''))
    .join('')
    .trim();

function isMermaidLang(lang?: string | null): boolean {
  return lang === 'mermaid';
}

function isJsonLang(lang?: string | null): boolean {
  return ['json', 'jsonc', 'application/json'].includes(lang ?? '');
}

function processMermaidNode(
  code: CodeNode,
  currentHeading: string | undefined,
  index: number,
): WorkflowDefinition {
  const id = (code.meta?.trim() || currentHeading || `workflow-${index}`).toString();
  const graph = parseMermaidGraph(code.value ?? '', id);
  graph.metadata = currentHeading ? { heading: currentHeading } : undefined;
  return graph;
}

function parseJson(value: string, label: string): unknown {
  const text = value.trim();
  if (!text) {
    return {};
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`Failed to parse JSON block "${label}": ${(error as Error).message}`);
  }
}

export function parseMarkdownWorkflows(
  content: string,
  _options: MarkdownWorkflowOptions = {},
): MarkdownWorkflowDocument {
  const parsed = unified().use(remarkParse).parse(content);
  const tree = parsed as unknown as MarkdownTree;
  const workflows: WorkflowDefinition[] = [];
  const jsonBlocks: Record<string, unknown> = {};

  let currentHeading: string | undefined;
  let workflowIndex = 0;
  let jsonIndex = 0;

  for (const node of tree.children ?? []) {
    if (node.type === 'heading') {
      currentHeading = headingText(node as HeadingNode);
      continue;
    }
    if (node.type !== 'code') {
      continue;
    }
    const code = node as CodeNode;
    const lang = typeof code.lang === 'string' ? code.lang.toLowerCase() : undefined;
    if (isMermaidLang(lang)) {
      workflowIndex += 1;
      workflows.push(processMermaidNode(code, currentHeading, workflowIndex));
    } else if (isJsonLang(lang)) {
      jsonIndex += 1;
      const key = code.meta?.trim() || `config-${jsonIndex}`;
      jsonBlocks[key] = parseJson(code.value ?? '', key);
    }
  }

  return { workflows, jsonBlocks };
}
