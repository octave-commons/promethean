#!/usr/bin/env node
/**
 * @license GPL-3.0-only
 * lint-taskgen: Analyze ESLint JSON, emit buckets, and optionally write Kanban tasks.
 * Node >= 20, Native ESM.
 */
import { spawn } from "node:child_process";
import path from "node:path";
import { randomBytes } from "node:crypto";
import {
  writeFile,
  readFile,
  mkdir,
  access,
  appendFile,
} from "node:fs/promises";
import process from "node:process";

type Msg = {
  ruleId: string | null;
  line: number;
  column?: number;
  message?: string;
  severity?: 1 | 2;
};
type Res = { filePath: string; messages: Msg[] };

const env = (k: string, d = "") => process.env[k] ?? d;
const args = new Map(
  process.argv.slice(2).map((s) => {
    const [k, v] = s.startsWith("--") ? s.slice(2).split("=") : [s, "true"];
    return [k, v ?? "true"];
  }),
);
const BOOL = (k: string) => args.get(k) === "true";
const STR = (k: string, d = "") => args.get(k) ?? d;
const INT = (k: string, d = 0) => Number(args.get(k) ?? d);

const USE_AFFECTED =
  BOOL("affected") || Boolean(env("NX_BASE") && env("NX_HEAD"));
const EMIT_KANBAN = BOOL("emit-kanban");
const TASKS_DIR = STR("tasks-dir", "docs/agile/tasks");
const LIMIT = INT("limit", 0);
const SCOPE = STR("scope", "");
const UPDATE = BOOL("update");
const MIN_HITS = INT("min-hits", 0);
const TOP_N = INT("top", 0);

const run = (cmd: readonly string[]): Promise<string> =>
  new Promise((resolve, reject) => {
    const [bin, ...rest] = cmd;
    const child = spawn(bin, rest, { stdio: ["ignore", "pipe", "pipe"] });
    const stdoutChunks: string[] = [];
    const stderrChunks: string[] = [];
    child.stdout.on("data", (d) => {
      stdoutChunks.push(String(d));
    });
    child.stderr.on("data", (d) => {
      stderrChunks.push(String(d));
    });
    child.on("close", (code) => {
      const out = stdoutChunks.join("");
      const err = stderrChunks.join("");
      const trimmed = out.trim();
      const isJsonLike = trimmed.startsWith("{") || trimmed.startsWith("[");
      if (isJsonLike) {
        resolve(out);
        return;
      }
      if (code === 0) {
        resolve(out);
        return;
      }
      reject(new Error(err || `exit ${code}`));
    });
  });

const detectScope = (fp: string) => {
  const rel = path.relative(process.cwd(), fp).replaceAll("\\", "/");
  const m = rel.match(/^(packages|apps)\/([^/]+)/);
  return m ? `${m[1]}:${m[2]}` : "root";
};

async function runESLintJson(): Promise<Res[]> {
  const cmd = USE_AFFECTED
    ? [
        "pnpm",
        "exec",
        "nx",
        "affected",
        "--target=lint",
        "--plain",
        "--",
        "-f",
        "json",
      ]
    : ["pnpm", "exec", "eslint", ".", "-f", "json"];
  const raw = await run(cmd);
  const s = raw.trim();
  const jsonStr = s.startsWith("{") ? `[${s}]` : s;
  return JSON.parse(jsonStr) as Res[];
}

function buildBuckets(results: Res[]) {
  const entries = results.flatMap((r) =>
    r.messages
      .filter((m) => m.ruleId)
      .map((m) => ({
        file: r.filePath,
        ruleId: String(m.ruleId),
        line: m.line,
      })),
  );
  const map = new Map<
    string,
    {
      ruleId: string;
      scope: string;
      count: number;
      files: Set<string>;
      examples: string[];
    }
  >();
  for (const e of entries) {
    const scope = detectScope(e.file);
    const key = `${e.ruleId}|${scope}`;
    const hit = map.get(key) ?? {
      ruleId: e.ruleId,
      scope,
      count: 0,
      files: new Set(),
      examples: [],
    };
    hit.count += 1;
    hit.files.add(e.file);
    if (hit.examples.length < 10) {
      hit.examples.push(
        `${path.relative(process.cwd(), e.file).replaceAll("\\", "/")}:${
          e.line
        }`,
      );
    }
    map.set(key, hit);
  }
  const sortedBuckets = Array.from(map.values())
    .map((b) => ({
      ruleId: b.ruleId,
      scope: b.scope,
      count: b.count,
      files: Array.from(b.files).length,
      examples: b.examples,
    }))
    .sort((a, b) => b.count - a.count);
  const filteredBuckets =
    MIN_HITS > 0
      ? sortedBuckets.filter((b) => b.count >= MIN_HITS)
      : sortedBuckets;
  const limitedBuckets =
    TOP_N > 0 ? filteredBuckets.slice(0, TOP_N) : filteredBuckets;
  const summary = {
    totalMessages: entries.length,
    bucketCount: limitedBuckets.length,
  };
  return { summary, buckets: limitedBuckets } as const;
}

// --- Kanban emission (idempotent by slug; optional update) ---
const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
const NOW_ISO = () => new Date().toISOString();
const fm = (obj: Record<string, unknown>) => {
  const lines = Object.entries(obj).map(([k, v]) => {
    if (k === "labels" && Array.isArray(v))
      return `${k}: [${(v as string[]).join(", ")}]`;
    return `${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`;
  });
  return ["---", ...lines, "---", ""].join("\n");
};

async function fileExists(p: string) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

function mergeExamples(existing: string, incoming: string[]): string {
  const seen = new Set(existing.split("\n").filter(Boolean));
  for (const ex of incoming) {
    if (seen.size >= 20) break;
    if (!seen.has(ex)) seen.add(ex);
  }
  return Array.from(seen).join("\n");
}

async function updateTaskFile(file: string, count: number, examples: string[]) {
  const src = await readFile(file, "utf8");
  const marker = "**Latest snapshot**";
  const snapshot = [
    `${marker} (${NOW_ISO()})`,
    "",
    `Hits: **${count}**`,
    "",
    "**Examples (merged)**",
    "```",
    mergeExamples(src, examples),
    "```",
    "",
  ].join("\n");
  const append = `\n${snapshot}\n`;
  if (src.includes(marker)) {
    await appendFile(file, append, "utf8");
  } else {
    await appendFile(file, append, "utf8");
  }
}

async function emitKanbanTasks(
  buckets: ReadonlyArray<{
    ruleId: string;
    scope: string;
    count: number;
    examples: string[];
  }>,
) {
  await mkdir(TASKS_DIR, { recursive: true });
  const { created, updated } = await buckets.reduce(
    async (accPromise, bucket) => {
      const acc = await accPromise;
      if (SCOPE && bucket.scope !== SCOPE) return acc;
      const title = `[Lint] ${bucket.ruleId} in ${bucket.scope}`;
      const slug = slugify(title);
      const file = path.join(TASKS_DIR, `${slug}.md`);
      const exists = await fileExists(file);
      if (exists && UPDATE) {
        await updateTaskFile(file, bucket.count, bucket.examples);
        return { ...acc, updated: acc.updated + 1 };
      }
      if (exists) return acc;
      if (LIMIT && acc.created >= LIMIT) return acc;
      const body = [
        `This task tracks remediation for **${bucket.ruleId}** across **${bucket.scope}**.`,
        "",
        "**Examples (seed)**",
        "```",
        ...(bucket.examples || []),
        "```",
        "",
        "**Plan**",
        "- Identify safe autofixes / codemods",
        "- Apply fixes incrementally (small PRs)",
        "- Add tests where behavior changes",
        "- Flip rule to error when < 10 hits",
        "",
      ].join("\n");
      const front = fm({
        uuid: `${randomBytes(8).toString("hex")}${Date.now()}`,
        title,
        status: "Todo",
        priority: "P3",
        labels: ["lint", bucket.ruleId, bucket.scope],
        created_at: NOW_ISO(),
        estimates: { complexity: null, scale: null, time_to_completion: null },
      });
      await writeFile(file, `${front}${body}\n`, "utf8");
      return { ...acc, created: acc.created + 1 };
    },
    Promise.resolve({ created: 0, updated: 0 }),
  );
  console.log(
    `kanban: created ${created} tasks, updated ${updated}, dir ${TASKS_DIR}`,
  );
}

const main = async () => {
  const results = await runESLintJson();
  const { summary, buckets } = buildBuckets(results);
  await writeFile(
    "eslint-taskgen-summary.json",
    JSON.stringify({ summary, buckets }, null, 2),
  );
  console.log(
    "Wrote eslint-taskgen-summary.json with",
    buckets.length,
    "buckets",
  );
  if (EMIT_KANBAN) {
    await emitKanbanTasks(buckets);
  }
};

void main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
