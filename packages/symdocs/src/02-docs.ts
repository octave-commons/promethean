import { promises as fs } from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

import { z } from "zod";
import { ollamaJSON } from "@promethean/utils";

import { parseArgs, sha1 } from "./utils.js";
import type { DocDraft, DocMap, ScanResult } from "./types.js";

export type DocsOptions = {
  scan?: string;
  out?: string;
  model?: string;
  force?: boolean;
  concurrency?: number;
};

const DraftSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  usage: z.string().optional(),
  details: z.string().optional(),
  pitfalls: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  mermaid: z.string().optional(),
});

function semaphore(max: number) {
  let cur = 0;
  const q: Array<() => void> = [];
  const take = () =>
    new Promise<void>((res) => {
      if (cur < max) {
        cur++;
        res();
      } else q.push(res);
    });
  const release = () => {
    cur--;
    const f = q.shift();
    if (f) f();
  };
  return { take, release };
}

export async function runDocs(opts: DocsOptions = {}) {
  const scanPath = path.resolve(opts.scan ?? ".cache/symdocs/symbols.json");
  const outPath = path.resolve(opts.out ?? ".cache/symdocs/docs.json");
  const model = String(opts.model ?? "qwen3:4b");
  const force = Boolean(opts.force ?? false);
  const conc = Math.max(1, opts.concurrency ?? 4);

  const { symbols }: ScanResult = JSON.parse(
    await fs.readFile(scanPath, "utf-8"),
  );
  const cache: DocMap = (await readJSON(outPath)) ?? {};

  const sem = semaphore(conc);
  const next: DocMap = { ...cache };
  let done = 0;

  await Promise.all(
    symbols.map(async (s) => {
      const cacheKey =
        s.id +
        "::" +
        sha1([s.signature ?? "", s.jsdoc ?? "", s.snippet].join("|"));
      if (!force && next[s.id] && (next[s.id] as any)._cacheKey === cacheKey) {
        done++;
        return;
      }

      await sem.take();
      try {
        const sys = [
          "You are a senior library author generating concise, practical docs.",
          "Return ONLY JSON with keys: title, summary, usage?, details?, pitfalls?, tags?, mermaid?",
          "summary: 1-2 sentences tops. usage: one code fence. pitfalls: 0-5 bullets. tags: 3-10.",
          "mermaid (optional): small diagram if helpful (class/sequence/flow); omit if unsure.",
        ].join("\n");

        const user = [
          `SYMBOL`,
          `- name: ${s.name}`,
          `- kind: ${s.kind}`,
          `- exported: ${s.exported}`,
          s.signature ? `- signature: ${s.signature}` : "",
          `- file: ${s.fileRel}:${s.startLine}-${s.endLine}`,
          s.jsdoc ? `- jsdoc:\n${s.jsdoc}` : "- jsdoc: (none)",
          `- snippet:\n${s.snippet}`,
        ]
          .filter(Boolean)
          .join("\n");

        const prompt = `SYSTEM:\n${sys}\n\nUSER:\n${user}`;
        let obj = await ollamaJSON(model, prompt);
        const parsed = DraftSchema.safeParse(obj);
        if (!parsed.success) {
          // Minimal fallback
          obj = {
            title: `${s.name} (${s.kind})`,
            summary: s.signature
              ? s.signature
              : `Auto-doc for ${s.kind} ${s.name}`,
            usage:
              s.kind === "function"
                ? `\n\`\`\`${s.lang}\n// Example\n${s.name}(...args)\n\`\`\`\n`
                : undefined,
            pitfalls: [],
          };
        }

        const draft: DocDraft = {
          id: s.id,
          name: s.name,
          kind: s.kind,
          title: obj.title,
          summary: obj.summary,
          usage: obj.usage,
          details: obj.details,
          pitfalls: obj.pitfalls,
          tags: obj.tags,
          mermaid: obj.mermaid,
        };
        (draft as any)._cacheKey = cacheKey; // non-persisted? we’ll persist but ignore when writing md
        next[s.id] = draft;
        done++;
        if (done % 20 === 0)
          console.log(`generated ${done}/${symbols.length}…`);
      } finally {
        sem.release();
      }
    }),
  );

  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(next, null, 2), "utf-8");
  console.log(
    `Docs generated for ${Object.keys(next).length} symbols → ${path.relative(
      process.cwd(),
      outPath,
    )}`,
  );
}

async function readJSON(p: string): Promise<any | undefined> {
  try {
    return JSON.parse(await fs.readFile(p, "utf-8"));
  } catch {
    return undefined;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = parseArgs({
    "--scan": ".cache/symdocs/symbols.json",
    "--out": ".cache/symdocs/docs.json",
    "--model": "qwen3:4b",
    "--force": "false",
    "--concurrency": "4",
  });
  runDocs({
    scan: String(args["--scan"]),
    out: String(args["--out"]),
    model: String(args["--model"]),
    force: String(args["--force"]) === "true",
    concurrency: parseInt(String(args["--concurrency"]), 10) || 4,
  }).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
