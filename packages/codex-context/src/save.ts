// SPDX-License-Identifier: GPL-3.0-only
import { mkdirp } from "mkdirp";
import fs from "fs/promises";
import path from "path";
import { format } from "date-fns";
import { createLogger } from "./logger.js";

type SaveArgs = {
  baseDir?: string;
  request: any;
  augmentedSystem: string;
  citations: Array<{ path: string; startLine?: number; endLine?: number }>;
  responseText: string;
  toolCalls?: any;
};

export async function persistArtifact(args: SaveArgs) {
  const log = createLogger("codex-context", { component: "persistence" });
  const baseDir =
    args.baseDir || path.join(process.cwd(), "docs", "codex-context");
  const dir = path.join(baseDir, "requests");
  await mkdirp(dir);
  const now = new Date();
  const ts = format(now, "yyyy.MM.dd.HH.mm.ss");
  const fp = path.join(dir, `${ts}.md`);
  const md = renderMarkdown(args, ts);
  await fs.writeFile(fp, md, "utf8");
  log.info("artifact.written", {
    file: fp,
    bytes: Buffer.byteLength(md, "utf8"),
  });
  await ensureIndex(baseDir);
  return fp;
}

function renderMarkdown(args: SaveArgs, ts: string) {
  const req = JSON.stringify(args.request, null, 2);
  const cites = args.citations
    .map(
      (c) =>
        `- [[${c.path}|${c.path}]]${
          c.startLine ? `:${c.startLine}-${c.endLine ?? c.startLine}` : ""
        }`,
    )
    .join("\n");
  const toolCalls = args.toolCalls
    ? `\n## Tool Calls\n\n\`\`\`json\n${JSON.stringify(
        args.toolCalls,
        null,
        2,
      )}\n\`\`\`\n`
    : "";
  return `# Codex Context Request ${ts}

## Request

\`\`\`json
${req}
\`\`\`

## Augmented System Prompt

\`\`\`
${args.augmentedSystem}
\`\`\`

## Citations

${cites || "(none)"}
${toolCalls}
## Response (excerpt)

\`\`\`
${args.responseText.slice(0, 4000)}
\`\`\`
`;
}

async function ensureIndex(baseDir: string) {
  const index = path.join(baseDir, "index.md");
  try {
    await fs.access(index);
  } catch {
    const content = `# Codex Context Artifacts\n\n- [[architecture/codex-context.md|Architecture Overview]]\n- Requests: see [[codex-context/requests|codex-context/requests]]\n`;
    await mkdirp(path.dirname(index));
    await fs.writeFile(index, content, "utf8");
    const log = createLogger("codex-context", { component: "persistence" });
    log.info("index.created", { file: index });
  }
}
