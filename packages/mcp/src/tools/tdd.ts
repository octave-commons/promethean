import { promises as fs } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { execFile, type ExecFileOptions, spawn } from "node:child_process";
import { promisify } from "node:util";

import { z } from "zod";
import type { ToolFactory, ToolSpec } from "../core/types.js";
import { minimatch } from "minimatch";
import fc from "fast-check";
import { Stryker } from "@stryker-mutator/core";

const execFileAsync = promisify(execFile);
const EXEC_OPTS: ExecFileOptions & { encoding: "utf8" } = {
  encoding: "utf8",
  timeout: 120_000,
  maxBuffer: 10 * 1024 * 1024,
};

function createWatch() {
  let proc: ReturnType<typeof spawn> | null = null;
  let buffer = "";
  let done: Promise<void> | null = null;

  return {
    start: (input: { files?: string[]; match?: string[] }) => {
      if (proc) throw new Error("watch already running");
      const { files, match } = input;
      const args = ["--yes", "ava", "--watch"] as string[];
      match?.forEach((m: string) => {
        args.push("--match", m);
      });
      if (files?.length) args.push(...files);
      buffer = "";
      proc = spawn("npx", args, { stdio: ["pipe", "pipe", "pipe"] });
      done = new Promise((resolve) => {
        proc!.once("exit", () => {
          proc = null;
          resolve();
        });
        proc!.once("error", (err) => {
          buffer += String(err);
          proc = null;
          resolve();
        });
      });
      proc.stdout?.on("data", (d) => {
        buffer += d.toString();
      });
      proc.stderr?.on("data", (d) => {
        buffer += d.toString();
      });
      return { started: true } as const;
    },
    getChanges: () => {
      if (!proc) throw new Error("watch not running");
      const out = buffer;
      buffer = "";
      return { output: out } as const;
    },
    stop: async () => {
      if (!proc) return { stopped: false } as const;
      proc.kill();
      await done;
      const out = buffer;
      buffer = "";
      return { stopped: true, output: out } as const;
    },
  };
}

const watch = createWatch();

export const tddScaffoldTest: ToolFactory = () => {
  const shape = {
    modulePath: z.string(),
    testName: z.string(),
    template: z.enum(["unit", "prop"]).optional(),
  } as const;
  const Schema = z.object(shape);
  const spec = {
    name: "tdd.scaffoldTest",
    description:
      "Create or append a test file next to a module (unit or property-test template).",
    inputSchema: shape,
    stability: "experimental",
    since: "0.1.0",
  } satisfies ToolSpec;
  const invoke = async (raw: unknown) => {
    const { modulePath, testName, template = "unit" } = Schema.parse(raw);
    const dir = path.dirname(modulePath);
    const base = path.basename(modulePath, path.extname(modulePath));
    const specPath = path.join(dir, `${base}.spec.ts`);

    const unit = `import test from "ava";

test("${testName}", t => {
  t.fail(); // TODO: implement
});
`;
    const prop = `import test from "ava";
import * as fc from "fast-check";

test("${testName}", t => {
  fc.assert(
    fc.property(fc.anything(), value => {
      // TODO: property under test
      t.pass();
    })
  );
});
`;
    const content = template === "prop" ? prop : unit;
    try {
      await fs.access(specPath);
      await fs.appendFile(specPath, `\n${content}`);
    } catch {
      await fs.writeFile(specPath, content);
    }
    return { specPath };
  };
  return { spec, invoke };
};

export const tddChangedFiles: ToolFactory = () => {
  const shape = {
    base: z.string().default("origin/main"),
    patterns: z.array(z.string()).default(["**/*.ts", "**/*.tsx"]),
  } as const;
  const Schema = z.object(shape);
  const spec = {
    name: "tdd.changedFiles",
    description:
      "List files changed vs a git base ref, filtered by glob patterns.",
    inputSchema: shape,
    stability: "experimental",
    since: "0.1.0",
  } satisfies ToolSpec;
  const invoke = async (raw: unknown) => {
    const { base, patterns } = Schema.parse(raw);
    const { stdout } = await execFileAsync(
      "git",
      ["diff", "--name-only", `${base}...HEAD`],
      EXEC_OPTS,
    );
    const files = stdout
      .split("\n")
      .filter(Boolean)
      .filter((f) => patterns.some((p) => minimatch(f, p)));
    return { files };
  };
  return { spec, invoke };
};

export const tddRunTests: ToolFactory = () => {
  const shape = {
    files: z.array(z.string()).optional(),
    match: z.array(z.string()).optional(),
    tap: z.boolean().optional(),
    watch: z.boolean().optional(),
  } as const;
  const Schema = z.object(shape);
  const spec = {
    name: "tdd.runTests",
    description:
      "Run AVA via npx with JSON (or TAP) output and return aggregated results. For long-running watchers, use tdd.startWatch/tdd.getWatchChanges instead.",
    inputSchema: shape,
    outputSchema: { passed: 0, failed: 0, durationMs: 0, failures: [] } as any,
    examples: [
      { args: {}, comment: "Run all tests with JSON output" },
      {
        args: { files: ["packages/mcp/dist/**/*.test.js"] },
        comment: "Target compiled MCP tests",
      },
      { args: { match: ["*schema*"] }, comment: "Filter by AVA title glob" },
    ],
    stability: "experimental",
    since: "0.1.0",
  } satisfies ToolSpec;
  const invoke = async (raw: unknown) => {
    const { files, match, tap, watch: w } = Schema.parse(raw);
    if (w) {
      throw new Error(
        "tdd.runTests does not support watch mode; use tdd.startWatch/tdd.getWatchChanges",
      );
    }
    const args = ["--yes", "ava", "--json"];
    if (tap) args.push("--tap");
    match?.forEach((m) => {
      args.push("--match", m);
    });
    if (files?.length) args.push(...files);
    const { stdout } = await execFileAsync("npx", args, EXEC_OPTS);
    const result = JSON.parse(stdout);
    return {
      passed: result.stats.passed,
      failed: result.stats.failed,
      durationMs: result.stats.duration,
      failures: result.failures?.map((f: { title: string; error: string }) => ({
        title: f.title,
        error: f.error,
      })),
    };
  };
  return { spec, invoke };
};

export const tddStartWatch: ToolFactory = () => {
  const shape = {
    files: z.array(z.string()).optional(),
    match: z.array(z.string()).optional(),
  } as const;
  const Schema = z.object(shape);
  const spec = {
    name: "tdd.startWatch",
    description:
      "Start an AVA --watch process and stream output via getWatchChanges.",
    inputSchema: shape,
    stability: "experimental",
    since: "0.1.0",
  } satisfies ToolSpec;
  const invoke = async (raw: unknown) => {
    return watch.start(Schema.parse(raw));
  };
  return { spec, invoke };
};

export const tddGetWatchChanges: ToolFactory = () => {
  const spec = {
    name: "tdd.getWatchChanges",
    description: "Get incremental stdout/stderr from the running watch.",
    inputSchema: {},
    stability: "experimental",
    since: "0.1.0",
  } satisfies ToolSpec;
  const invoke = async () => watch.getChanges();
  return { spec, invoke } as any;
};

export const tddStopWatch: ToolFactory = () => {
  const spec = {
    name: "tdd.stopWatch",
    description: "Stop the running watch process.",
    inputSchema: {},
    stability: "experimental",
    since: "0.1.0",
  } satisfies ToolSpec;
  const invoke = async () => watch.stop();
  return { spec, invoke } as any;
};

export const tddCoverage: ToolFactory = () => {
  const shape = {
    include: z.array(z.string()).optional(),
    thresholds: z
      .object({
        lines: z.number().optional(),
        branches: z.number().optional(),
        functions: z.number().optional(),
      })
      .optional(),
  } as const;
  const Schema = z.object(shape);
  const spec = {
    name: "tdd.coverage",
    description:
      "Run c8+AVA to produce coverage summary; enforce optional thresholds.",
    inputSchema: shape,
    stability: "experimental",
    since: "0.1.0",
  } satisfies ToolSpec;
  const invoke = async (raw: unknown) => {
    const { include, thresholds } = Schema.parse(raw);
    const args = [
      "--yes",
      "c8",
      "--reporter=json-summary",
      "ava",
      ...(include ?? []),
    ];
    await execFileAsync("npx", args, EXEC_OPTS);
    const summaryPath = path.join(
      process.cwd(),
      "coverage",
      "coverage-summary.json",
    );
    const summary = JSON.parse(await fs.readFile(summaryPath, "utf8")).total;
    const fail: string[] = [];
    if (thresholds?.lines && summary.lines.pct < thresholds.lines)
      fail.push(`lines ${summary.lines.pct}% < ${thresholds.lines}%`);
    if (thresholds?.branches && summary.branches.pct < thresholds.branches)
      fail.push(`branches ${summary.branches.pct}% < ${thresholds.branches}%`);
    if (thresholds?.functions && summary.functions.pct < thresholds.functions)
      fail.push(
        `functions ${summary.functions.pct}% < ${thresholds.functions}%`,
      );
    if (fail.length)
      throw new Error(`Coverage below threshold: ${fail.join(", ")}`);
    return { summary };
  };
  return { spec, invoke };
};

export const tddPropertyCheck: ToolFactory = () => {
  const shape = {
    propertyModule: z.string(),
    propertyExport: z.string(),
    runs: z.number().default(100),
  } as const;
  const Schema = z.object(shape);
  const spec = {
    name: "tdd.propertyCheck",
    description:
      "Dynamically import a module export that builds a fast-check property and assert it.",
    inputSchema: shape,
    stability: "experimental",
    since: "0.1.0",
  } satisfies ToolSpec;
  const invoke = async (raw: unknown) => {
    const { propertyModule, propertyExport, runs } = Schema.parse(raw);
    const mod = await import(pathToFileURL(propertyModule).href);
    const propertyFactory = (mod as any)[propertyExport];
    if (typeof propertyFactory !== "function")
      throw new Error(`Export "${propertyExport}" is not a function`);
    const property = propertyFactory(fc);
    await fc.assert(property, { numRuns: runs });
    return { ok: true };
  };
  return { spec, invoke };
};

export const tddMutationScore: ToolFactory = () => {
  const shape = {
    files: z.array(z.string()).optional(),
    minScore: z.number().default(60),
  } as const;
  const Schema = z.object(shape);
  const spec = {
    name: "tdd.mutationScore",
    description:
      "Run Stryker mutation testing and return the score (fail if below minScore).",
    inputSchema: shape,
    stability: "experimental",
    since: "0.1.0",
  } satisfies ToolSpec;
  const invoke = async (raw: unknown) => {
    const { files, minScore } = Schema.parse(raw);
    const stryker = new Stryker({
      mutate: files?.length ? files : undefined,
    } as any);
    const results: any[] = await (stryker as any).runMutationTest();
    const ignored = new Set(["ignored", "init"]);
    const success = new Set([
      "killed",
      "timedOut",
      "runtimeError",
      "compileError",
    ]);
    const considered = results.filter((r) => !ignored.has(r.status));
    const killed = considered.filter((r) => success.has(r.status)).length;
    const score =
      considered.length === 0 ? 0 : (killed / considered.length) * 100;
    if (score < minScore)
      throw new Error(
        `Mutation score ${score}% is below required ${minScore}%`,
      );
    return { score };
  };
  return { spec, invoke };
};
