import type {
  WorkflowDefinition,
  WorkflowEdge,
  WorkflowNode,
} from "./types.js";

const NODE_REGEX =
  /^(?<id>[A-Za-z0-9_]+)\s*(?:\((?<round>[^)]*)\)|\[(?<square>[^\]]*)\]|\{(?<curly>[^}]*)\}|"(?<quoted>[^"]*)"|\s+"(?<standalone>[^"]*)")?/;
const EDGE_REGEX =
  /^(?<from>[A-Za-z0-9_]+)\s*--[->]+\s*(?:\|(?<label>[^|]+)\|\s*)?(?<to>[A-Za-z0-9_]+)/;

const COMMENT_PREFIX = "%%";
const DIRECTIVE_REGEX = /^(?:graph|flowchart|classDef|linkStyle|style)\b/i;

function decodeLabel(raw: string | undefined): string | undefined {
  if (!raw) {
    return undefined;
  }
  const text = raw
    .replace(/&quot;/gu, '"')
    .replace(/\\n/gu, "\n")
    .replace(/\\"/gu, '"');
  const trimmed = text.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseNode(line: string): WorkflowNode | undefined {
  const trimmed = line.trim();
  if (
    !trimmed ||
    trimmed.startsWith(COMMENT_PREFIX) ||
    DIRECTIVE_REGEX.test(trimmed)
  ) {
    return undefined;
  }
  const match = trimmed.match(NODE_REGEX);
  if (!match || !match.groups || !match.groups.id) {
    return undefined;
  }
  const { id, round, square, curly, quoted, standalone } = match.groups;
  const rawLabel = round ?? square ?? curly ?? quoted ?? standalone;
  const label = decodeLabel(rawLabel);
  return { id, label };
}

function parseEdge(line: string): WorkflowEdge | undefined {
  const trimmed = line.trim();
  if (
    !trimmed ||
    trimmed.startsWith(COMMENT_PREFIX) ||
    DIRECTIVE_REGEX.test(trimmed)
  ) {
    return undefined;
  }
  const match = trimmed.match(EDGE_REGEX);
  if (!match || !match.groups || !match.groups.from || !match.groups.to) {
    return undefined;
  }
  const { from, to, label } = match.groups;
  return {
    from,
    to,
    label: label?.trim(),
  };
}

export function parseMermaidGraph(
  source: string,
  id = "workflow",
): WorkflowDefinition {
  const nodes = new Map<string, WorkflowNode>();
  const edges: WorkflowEdge[] = [];

  for (const rawLine of source.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith(COMMENT_PREFIX)) {
      continue;
    }
    const node = parseNode(line);
    if (node) {
      if (!nodes.has(node.id)) {
        nodes.set(node.id, node);
      } else if (node.label && !nodes.get(node.id)?.label) {
        nodes.set(node.id, node);
      }
    }
    const edge = parseEdge(line);
    if (edge) {
      edges.push(edge);
      if (!nodes.has(edge.from)) {
        nodes.set(edge.from, { id: edge.from });
      }
      if (!nodes.has(edge.to)) {
        nodes.set(edge.to, { id: edge.to });
      }
    }
  }

  return {
    id,
    nodes: Array.from(nodes.values()),
    edges,
  };
}
