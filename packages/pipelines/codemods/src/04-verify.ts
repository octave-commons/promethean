import { promises as fs } from "fs";
import * as path from "path";
import { exec } from "child_process";

const args = parseArgs({
  "--stage": "after", // "baseline" | "after" | any label you like
  "--out": "docs/agile/tasks/codemods", // markdown reports
  "--cache": ".cache/codemods/verify", // json snapshots
  "--include-run-summary": ".cache/codemods/run-apply.json", // optional; produced by 03-run.ts (see patch below)
  "--tsc": "npx tsc -p tsconfig.json --noEmit",
  "--build": "", // e.g. "pnpm -w -r build"
  "--test": "pnpm -w -r test", // tweak to your runner; empty string skips
  "--timeout": "0", // ms; 0 = no timeout
});

type StepResult = {
  name: string;
  cmd: string;
  exitCode: number | null;
  durationMs: number;
  stdout: string;
  stderr: string;
};

type Snapshot = {
  stage: string;
  startedAt: string;
  endedAt: string;
  steps: StepResult[];
  runSummary?: {
    changedByCodemod?: Record<string, string[]>; // codemodId -> [files]
  };
};

function parseArgs<T extends Record<string, string>>(defaults: T): T {
  const out = { ...defaults };
  const a = process.argv.slice(2);
  for (let i = 0; i < a.length; i++) {
    const k = a[i];
    if (!k?.startsWith("--")) continue;
    const next = a[i + 1];
    const v = next && !next.startsWith("--") ? (i++, next) : "true";
    out[k as keyof T] = v as T[keyof T];
  }
  return out;
}

async function runCmd(
  name: string,
  cmd: string,
  timeoutMs: number,
): Promise<StepResult> {
  const started = Date.now();
  const res: StepResult = {
    name,
    cmd,
    exitCode: null,
    durationMs: 0,
    stdout: "",
    stderr: "",
  };
  if (!cmd.trim()) return { ...res, durationMs: 0, exitCode: 0 };
  return new Promise((resolve) => {
    (exec as any)(
      cmd,
      {
        maxBuffer: 1024 * 1024 * 64,
        timeout: timeoutMs > 0 ? timeoutMs : undefined,
      } as any,
      (err: any, stdout: string, stderr: string) => {
        const ended = Date.now();
        resolve({
          name,
          cmd,
          exitCode: err ? (typeof err.code === "number" ? err.code : 1) : 0,
          durationMs: ended - started,
          stdout: String(stdout ?? ""),
          stderr: String(stderr ?? ""),
        });
      },
    );
  });
}

function mdEscape(s: string) {
  return s.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function readMaybe(p: string) {
  try {
    return await fs.readFile(p, "utf-8");
  } catch {
    return undefined;
  }
}

async function main() {
  const STAGE = args["--stage"];
  const OUT_DIR = path.resolve(args["--out"]);
  const CACHE_DIR = path.resolve(args["--cache"]);
  const SUMMARY_PATH = path.resolve(args["--include-run-summary"]);
  const TIMEOUT = Number(args["--timeout"]) || 0;

  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.mkdir(CACHE_DIR, { recursive: true });

  // optional: bring in changed files from 03-run (json)
  let runSummary: Snapshot["runSummary"] | undefined = undefined;
  try {
    const raw = await readMaybe(SUMMARY_PATH);
    if (raw) runSummary = JSON.parse(raw);
  } catch {
    /* ignore */
  }

  const steps: StepResult[] = [];
  const startedAt = new Date().toISOString();

  steps.push(await runCmd("tsc", args["--tsc"], TIMEOUT));
  if (args["--build"].trim())
    steps.push(await runCmd("build", args["--build"], TIMEOUT));
  if (args["--test"].trim())
    steps.push(await runCmd("test", args["--test"], TIMEOUT));

  const endedAt = new Date().toISOString();
  const snap: Snapshot = { stage: STAGE, startedAt, endedAt, steps, ...(runSummary ? { runSummary } : {}) };

  // write cache
  const cacheFile = path.join(CACHE_DIR, `${STAGE}.json`);
  await fs.writeFile(cacheFile, JSON.stringify(snap, null, 2), "utf-8");

  // write stage report
  const report = renderStageMarkdown(snap);
  await fs.writeFile(path.join(OUT_DIR, `verify-${STAGE}.md`), report, "utf-8");

  // if baseline exists and this is a comparison stage, emit VERIFY.md
  const baselineFile = path.join(CACHE_DIR, `baseline.json`);
  const baseRaw = await readMaybe(baselineFile);
  if (baseRaw && STAGE !== "baseline") {
    const base: Snapshot = JSON.parse(baseRaw);
    const delta = renderDeltaMarkdown(base, snap);
    await fs.writeFile(path.join(OUT_DIR, `VERIFY.md`), delta, "utf-8");
  }

  // pretty console
  const summaryLine = steps
    .map(
      (s) => `${s.name}:${s.exitCode === 0 ? "OK" : "FAIL"}(${s.durationMs}ms)`,
    )
    .join("  ");
  const failed = steps.filter((s) => s.exitCode !== 0).map((s) => s.name);
  console.log(
    `verify[${STAGE}] — ${summaryLine} ${
      failed.length ? ` ❌ ${failed.join(",")}` : " ✅"
    }`,
  );
}

function renderStageMarkdown(s: Snapshot): string {
  const lines: string[] = [
    `# Verification — ${s.stage}`,
    "",
    `Started: ${s.startedAt}`,
    `Ended:   ${s.endedAt}`,
    "",
    "## Results",
    "",
    "| Step | Exit | Duration (ms) |",
    "|---|:---:|---:|",
    ...s.steps.map(
      (st) => `| ${st.name} | ${st.exitCode ?? "_"} | ${st.durationMs} |`,
    ),
    "",
  ];

  if (s.runSummary?.changedByCodemod) {
    const all = s.runSummary.changedByCodemod;
    lines.push("## Files changed by codemod run", "");
    for (const [id, files] of Object.entries(all)) {
      lines.push(
        `- **${id}** (${files.length})`,
        ...files.map((f) => `  - \`${f}\``),
        "",
      );
    }
  }

  for (const st of s.steps) {
    lines.push(
      `### ${st.name}`,
      "",
      `**Command:** \`${mdEscape(st.cmd)}\`  `,
      `**Exit:** ${st.exitCode}  `,
      `**Duration:** ${st.durationMs} ms`,
      "",
      "<details><summary>stdout</summary>",
      "",
      "```text",
      st.stdout.trimEnd(),
      "```",
      "",
      "</details>",
      "",
      "<details><summary>stderr</summary>",
      "",
      "```text",
      st.stderr.trimEnd(),
      "```",
      "",
      "</details>",
      "",
    );
  }
  return lines.join("\n");
}

function renderDeltaMarkdown(base: Snapshot, cur: Snapshot): string {
  const lines: string[] = [
    "# Verification delta",
    "",
    `Baseline: **${base.stage}** (${base.startedAt})`,
    `Current:  **${cur.stage}** (${cur.startedAt})`,
    "",
    "## Step status comparison",
    "",
    "| Step | Baseline | Current |",
    "|---|:---:|:---:|",
    ...mergeByName(base.steps, cur.steps).map(
      ([b, c]) =>
        `| ${b?.name ?? c?.name ?? "?"} | ${fmtExit(b?.exitCode)} | ${fmtExit(
          c?.exitCode,
        )} |`,
    ),
    "",
    "## Duration change (ms)",
    "",
    "| Step | Baseline | Current | Δ |",
    "|---|---:|---:|---:|",
    ...mergeByName(base.steps, cur.steps).map(([b, c]) => {
      const bd = b?.durationMs ?? 0,
        cd = c?.durationMs ?? 0;
      const d = cd - bd;
      return `| ${b?.name ?? c?.name ?? "?"} | ${bd} | ${cd} | ${d} |`;
    }),
    "",
  ];

  return lines.join("\n");
}

function mergeByName(a: StepResult[], b: StepResult[]) {
  const names = new Set<string>([
    ...a.map((s) => s.name),
    ...b.map((s) => s.name),
  ]);
  const out: Array<[StepResult | undefined, StepResult | undefined]> = [];
  for (const n of Array.from(names)) {
    out.push([a.find((s) => s.name === n), b.find((s) => s.name === n)]);
  }
  return out;
}
function fmtExit(x?: number | null) {
  return x === 0 ? "OK" : x == null ? "_" : `FAIL(${x})`;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
