import * as path from "path";
import { unified } from "unified";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";
import { ensureDir } from "@promethean/fs";
export { sha1, cosine } from "@promethean/utils";

export { ensureDir };

export const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";

export function parseArgs(defaults: Record<string, string>) {
  const args = process.argv.slice(2);
  let result = { ...defaults };
  for (let index = 0; index < args.length; ) {
    const key = args[index] ?? "";
    if (!key.startsWith("--")) {
      index += 1;
      continue;
    }
    const candidate = args[index + 1];
    const value = candidate && !candidate.startsWith("--") ? candidate : "true";
    result = { ...result, [key]: value };
    index += candidate && !candidate.startsWith("--") ? 2 : 1;
  }
  return result;
}

export function relPath(fromRoot: string, fileAbs: string) {
  return path.relative(fromRoot, fileAbs).replace(/\\/g, "/");
}

// -------- markdown code extraction helpers

type FoundBlock = {
  lang?: string;
  startLine: number;
  endLine: number;
  value: string;
  beforeText: string;
  afterText: string;
  fenceInfo?: string; // raw info string after ```
  nearestTitle?: string; // heading text
};

export function extractCodeBlocksWithContext(md: string): FoundBlock[] {
  const ast = unified()
    .use(remarkParse as any)
    .parse(md) as any;
  const blocks: FoundBlock[] = [];
  let lastHeading: string | undefined;
  const lines = md.split("\n");
  const grab = (from: number, to: number) =>
    lines.slice(Math.max(0, from), Math.min(lines.length, to)).join("\n");

  visit(ast, (node: any) => {
    if (!node?.type) return;

    if (node.type === "heading") {
      const text = (node.children || [])
        .map(
          (c: any) =>
            c.value || c.children?.map((cc: any) => cc.value).join(" ") || "",
        )
        .join(" ")
        .trim();
      lastHeading = text || lastHeading;
    }

    if (node.type === "code" && node.position) {
      const { start, end } = node.position;
      const beforeText = grab(start.line - 6, start.line - 1); // 5 lines of lead-in context
      const afterText = grab(end.line, end.line + 5); // 5 lines of trailing context
      const block: FoundBlock = {
        startLine: start.line,
        endLine: end.line,
        value: node.value || "",
        beforeText,
        afterText,
        ...(node.lang ? { lang: node.lang } : {}),
        ...(node.meta ? { fenceInfo: node.meta } : {}),
        ...(lastHeading ? { nearestTitle: lastHeading } : {}),
      };
      blocks.push(block);
    }
  });

  return blocks;
}

// filename/path hint heuristics
export function detectFilenameHint(block: FoundBlock): string | undefined {
  // 1) Info string like: ```ts title="src/foo/bar.ts" or path=...
  const meta = block.fenceInfo || "";
  const m1 = meta.match(
    /(?:title|path|file|filepath|name)\s*=\s*"?([^"\s]+)"?/i,
  );
  if (m1) return m1[1];

  // 2) Single backticked path on the line before the fence (captured in beforeText tail)
  const beforeTail = (block.beforeText || "").split("\n").slice(-3).join(" ");
  const m2 = beforeTail.match(/`([^`\n]+?\.[a-z0-9]{1,6})`/i);
  if (m2) return m2[1];

  // 3) Title/heading looks like a path
  if (
    block.nearestTitle &&
    /[\/\\].+\.[a-z0-9]{1,6}$/i.test(block.nearestTitle)
  ) {
    return block.nearestTitle.trim();
  }

  // 4) First comment line in code contains path-like token
  const firstLine =
    (block.value || "").split("\n").find((l) => l.trim().length > 0) || "";
  const stripped = firstLine
    .replace(/^(\s*\/\/\s*|\s*#\s*|\s*;\s*|\s*--\s*|\s*\/\*|\s*<!--)/, "")
    .trim();
  const m4 = stripped.match(/([A-Za-z0-9_\-./\\]+?\.[a-z0-9]{1,6})/i);
  if (m4) return m4[1];

  return undefined;
}
