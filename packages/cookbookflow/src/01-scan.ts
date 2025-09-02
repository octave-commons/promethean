/* eslint-disable no-console */
import { globby } from "globby";
import * as path from "path";
import { promises as fs } from "fs";
import { parseArgs, writeJSON, sha1 } from "./utils.js";
import type { CodeBlock, ScanOutput } from "./types.js";

const args = parseArgs({
  "--roots": "docs examples packages",
  "--out": ".cache/cookbook/blocks.json",
  "--max-context": "12"
} as const);

function* mdCodeBlocks(md: string): Generator<{lang:string, code:string, header:string}> {
    const fence = /```(\w+)?[^\n]*\n([\s\S]*?)```/g;
    let m; while ( (m = fence.exec(md)) ) {
      const before = md.slice(0, m.index);
      const header = (before.match(/(?:^|\n)#{1,6}\s+[^\n]+$/m)?.[0] ?? "").trim();
      yield { lang: (m[1] || "").toLowerCase(), code: m[2] ?? "", header };
    }
}

async function main() {
  const roots = args["--roots"].split(/\s+/).filter(Boolean);
  const files = await globby([
    ...roots.map(r => `${r.replace(/\\/g,"/")}/**/*.{md,mdx}`),
    "examples/**/*.{ts,tsx,js,jsx,sh,bash}"
  ], { dot: false });

  const maxCtx = Number(args["--max-context"]);
  const blocks: CodeBlock[] = [];

  for (const f of files) {
    const raw = await fs.readFile(f, "utf-8");
    if (/\.(md|mdx)$/i.test(f)) {
      for (const b of mdCodeBlocks(raw)) {
        const ctxLines = b.code.split("\n").slice(0, maxCtx).join("\n");
        blocks.push({ id: sha1(f + "|" + b.lang + "|" + b.code.slice(0,128)), source: "doc", file: f, lang: b.lang || "text", code: b.code, context: b.header + "\n" + ctxLines });
      }
    } else {
      const lang = /\.(sh|bash)$/i.test(f) ? "bash" : /\.(ts|tsx)$/i.test(f) ? "ts" : /\.(js|jsx)$/i.test(f) ? "js" : "text";
      blocks.push({ id: sha1(f), source: "example", file: f, lang, code: raw, context: path.basename(f) });
    }
  }

  const out: ScanOutput = { createdAt: new Date().toISOString(), blocks };
  await writeJSON(path.resolve(args["--out"]), out);
  console.log(`cookbook: scanned ${blocks.length} block(s) → ${args["--out"]}`);
}
main().catch(e => { console.error(e); process.exit(1); });
