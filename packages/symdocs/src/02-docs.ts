/* eslint-disable */
import * as path from "path";
import { fileURLToPath } from "url";

import { z } from "zod";
import { ollamaJSON } from "@promethean/utils";
import { openLevelCache, type Cache } from "@promethean/level-cache";

import { parseArgs, sha1 } from "./utils.js";
import type { DocDraft, SymbolInfo } from "./types.js";

export type DocsOptions = {
  cache?: string;
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
  const state = { cur: 0 };
  const q: Array<() => void> = [];
  const take = () =>
    new Promise<void>((resolve) => {
      if (state.cur < max) {
        state.cur++;
        resolve();
      } else q.push(resolve);
    });
  const release = () => {
    state.cur--;
    const f = q.shift();
    if (f) f();
  };
  return { take, release };
}
type DraftWithCache = DocDraft & { _cacheKey?: string };

type GenerateCtx = {
  model: string;
  force: boolean;
  next: Record<string, DraftWithCache>;
  sem: ReturnType<typeof semaphore>;
  done: { value: number };
  total: number;
};

function buildPrompt(s: SymbolInfo): string {
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

  return `SYSTEM:\n${sys}\n\nUSER:\n${user}`;
}

function fallbackDraft(s: SymbolInfo): z.infer<typeof DraftSchema> {
  return {
    title: `${s.name} (${s.kind})`,
    summary: s.signature ? s.signature : `Auto-doc for ${s.kind} ${s.name}`,
    usage:
      s.kind === "function"
        ? `\n\`\`\`${s.lang}\n// Example\n${s.name}(...args)\n\`\`\`\n`
        : undefined,
    pitfalls: [],
  };
}

async function generateDoc(s: SymbolInfo, ctx: GenerateCtx): Promise<void> {
  const cacheKey =
    s.id + "::" + sha1([s.signature ?? "", s.jsdoc ?? "", s.snippet].join("|"));
  if (!ctx.force && ctx.next[s.id]?._cacheKey === cacheKey) {
    ctx.done.value++;
    return;
  }
  await ctx.sem.take();
  try {
    const prompt = buildPrompt(s);
    const raw = await ollamaJSON(ctx.model, prompt);
    const parsed = DraftSchema.safeParse(raw);
    const obj: z.infer<typeof DraftSchema> = parsed.success
      ? parsed.data
      : fallbackDraft(s);

    const draft: DraftWithCache = {
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
      _cacheKey: cacheKey,
    };
    ctx.next[s.id] = draft;
    ctx.done.value++;
    if (ctx.done.value % 20 === 0)
      console.log(`generated ${ctx.done.value}/${ctx.total}…`);
  } finally {
    ctx.sem.release();
  }
}

export async function runDocs(opts: DocsOptions = {}): Promise<void> {
  const cachePath = path.resolve(opts.cache ?? ".cache/symdocs.level");
  const model = String(opts.model ?? "qwen3:4b");
  const force = Boolean(opts.force ?? false);
  const conc = Math.max(1, opts.concurrency ?? 4);

  const db: Cache<unknown> = await openLevelCache({ path: cachePath });
  const symCache = db.withNamespace("symbols") as Cache<SymbolInfo>;
  const docCache = db.withNamespace("docs") as Cache<DraftWithCache>;

  const symbols: SymbolInfo[] = [];
  for await (const [, sym] of symCache.entries()) symbols.push(sym);

  const cache: Record<string, DraftWithCache> = Object.create(null);
  for await (const [id, draft] of docCache.entries()) {
    cache[id] = draft;
  }

  const sem = semaphore(conc);
  const next: Record<string, DraftWithCache> = { ...cache };
  const done = { value: 0 };

  await Promise.all(
    symbols.map((s) =>
      generateDoc(s, { model, force, next, sem, done, total: symbols.length }),
    ),
  );

  await Promise.all(
    Object.entries(next).map(([id, draft]) => docCache.set(id, draft)),
  );
  await db.close();
  console.log(
    `Docs generated for ${Object.keys(next).length} symbols → ${path.relative(
      process.cwd(),
      cachePath,
    )}`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = parseArgs({
    "--cache": ".cache/symdocs.level",
    "--model": "qwen3:4b",
    "--force": "false",
    "--concurrency": "4",
  });
  runDocs({
    cache: String(args["--cache"]),
    model: String(args["--model"]),
    force: String(args["--force"]) === "true",
    concurrency: parseInt(String(args["--concurrency"]), 10) || 4,
  }).catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  });
}
