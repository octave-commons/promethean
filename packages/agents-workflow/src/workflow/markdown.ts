import { unified } from "unified";
import remarkParse from "remark-parse";

import { parseMermaidGraph } from "./mermaid.js";
import type {
  MarkdownWorkflowDocument,
  MarkdownWorkflowOptions,
} from "./types.js";

type HeadingNode = {
  type: string;
  children?: Array<{ value?: string }>;
};

type CodeNode = {
  type: "code";
  lang?: string;
  meta?: string | null;
  value: string;
};

type MarkdownNode =
  | HeadingNode
  | CodeNode
  | { type: string; [key: string]: unknown };

function headingText(node: HeadingNode): string {
  return (node.children ?? [])
    .map((child) => (typeof child.value === "string" ? child.value : ""))
    .join("")
    .trim();
}

function parseJson(value: string, label: string): unknown {
  const text = value.trim();
  if (!text) {
    return {};
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(
      `Failed to parse JSON block "${label}": ${(error as Error).message}`,
    );
  }
}

export function parseMarkdownWorkflows(
  content: string,
  _options: MarkdownWorkflowOptions = {},
): MarkdownWorkflowDocument {
  const tree = unified().use(remarkParse).parse(content) as {
    children?: MarkdownNode[];
  };
  const workflows = [] as MarkdownWorkflowDocument["workflows"];
  const jsonBlocks: Record<string, unknown> = {};

  let currentHeading: string | undefined;
  let workflowIndex = 0;
  let jsonIndex = 0;

  for (const node of tree.children ?? []) {
    if (node.type === "heading") {
      currentHeading = headingText(node as HeadingNode);
      continue;
    }
    if (node.type !== "code") {
      continue;
    }
    const code = node as CodeNode;
    const lang = code.lang?.toLowerCase();
    if (lang === "mermaid") {
      workflowIndex += 1;
      const id = (
        code.meta?.trim() ||
        currentHeading ||
        `workflow-${workflowIndex}`
      ).toString();
      const graph = parseMermaidGraph(code.value, id);
      graph.metadata = currentHeading ? { heading: currentHeading } : undefined;
      workflows.push(graph);
    } else if (
      lang &&
      (lang === "json" || lang === "jsonc" || lang === "application/json")
    ) {
      jsonIndex += 1;
      const key = code.meta?.trim() || `config-${jsonIndex}`;
      jsonBlocks[key] = parseJson(code.value, key);
    }
  }

  return { workflows, jsonBlocks };
}
