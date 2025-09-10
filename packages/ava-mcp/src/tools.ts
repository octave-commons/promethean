import type { Server } from "@modelcontextprotocol/sdk/server";
import { z } from "zod";
import { promises as fs } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { execFile, type ExecFileOptions } from "node:child_process";
import { promisify } from "node:util";
import { minimatch } from "minimatch";
import fc from "fast-check";

const execFileAsync = promisify(execFile) as (
  file: string,
  args?: readonly string[],
  options?: ExecFileOptions & { encoding: "utf8" },
) => Promise<{ stdout: string; stderr: string }>;
const EXEC_OPTS: ExecFileOptions & { encoding: "utf8" } = {
  timeout: 120_000,
  maxBuffer: 10 * 1024 * 1024,
  encoding: "utf8",
};

async function resolveBaseRef(base: string): Promise<string> {
  const candidates = [base, "origin/main", "main"];
  for (const ref of candidates) {
    try {
      await execFileAsync("git", ["rev-parse", "--verify", ref], EXEC_OPTS);
      for (const args of [
        ["merge-base", "--fork-point", "HEAD", ref],
        ["merge-base", "HEAD", ref],
      ]) {
        try {
          const { stdout } = await execFileAsync("git", args, EXEC_OPTS);
          const mb = stdout.trim();
          if (mb) return mb;
        } catch {}
      }
      return ref;
    } catch {}
  }
  try {
    const { stdout } = await execFileAsync(
      "git",
      ["rev-list", "--max-parents=0", "HEAD"],
      EXEC_OPTS,
    );
    return stdout.trim();
  } catch {
    return "HEAD";
  }
}

export function registerTddTools(server: Server) {
  const s = server as any;
  // scaffoldTest
  s.registerTool(
    "tdd.scaffoldTest",
    {
      inputSchema: z.object({
        modulePath: z.string(),
        testName: z.string(),
        template: z.enum(["unit", "prop"]).optional(),
      }),
    },
    async (input: {
      modulePath: string;
      testName: string;
      template?: "unit" | "prop";
    }) => {
      const { modulePath, testName, template = "unit" } = input;
      const dir = path.dirname(modulePath);
      const base = path.basename(modulePath, path.extname(modulePath));
      const specPath = path.join(dir, `${base}.spec.ts`);

      const unit = `import test from "ava";

test(${JSON.stringify(testName)}, t => {
  t.fail(); // TODO: implement
});
`;

      const prop = `import test from "ava";
import fc from "fast-check";

test(${JSON.stringify(testName)}, t => {
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
    },
  );

  // changedFiles
  s.registerTool(
    "tdd.changedFiles",
    {
      inputSchema: z.object({
        base: z.string().default("origin/main"),
        patterns: z
          .array(z.string())
          .default([
            "**/*.ts",
            "**/*.tsx",
            "**/*.js",
            "**/*.jsx",
            "**/*.mjs",
            "**/*.cjs",
            "**/*.json",
            "**/*.css",
            "**/*.html",
          ]),
      }),
    },
    async (input: { base: string; patterns: string[] }) => {
      const { base, patterns } = input;
      let rangeBase = await resolveBaseRef(base);
      let stdout = "";
      try {
        const res = await execFileAsync(
          "git",
          ["diff", "--name-only", `${rangeBase}...HEAD`],
          EXEC_OPTS,
        );
        stdout = res.stdout;
      } catch (e) {
        console.warn("git diff failed", e);
      }
      const files = stdout
        .split("\n")
        .filter(Boolean)
        .filter((f) => patterns.some((p) => minimatch(f, p)));
      return { files };
    },
  );

  // runTests
  s.registerTool(
    "tdd.runTests",
    {
      inputSchema: z.object({
        files: z.array(z.string()).optional(),
        match: z.array(z.string()).optional(),
        watch: z.boolean().default(false),
        tap: z.boolean().default(false),
      }),
    },
    async (input: {
      files?: string[];
      match?: string[];
      watch: boolean;
      tap: boolean;
    }) => {
      const { files, match, watch, tap } = input;
      if (tap) throw new Error("tap reporter is not supported");
      if (watch) throw new Error("watch mode is not supported");
      const args = ["--yes", "ava", "--json"];
      match?.forEach((m: string) => args.push("--match", m));
      if (files?.length) args.push(...files);

      const { stdout } = await execFileAsync("npx", args, EXEC_OPTS);
      const result = JSON.parse(stdout);
      return {
        passed: result.stats.passed,
        failed: result.stats.failed,
        durationMs: result.stats.duration,
        failures: result.failures?.map((f: any) => ({
          title: f.title,
          error: f.error,
        })),
      };
    },
  );

  // coverage
  s.registerTool(
    "tdd.coverage",
    {
      inputSchema: z.object({
        include: z.array(z.string()).optional(),
        thresholds: z
          .object({
            lines: z.number().optional(),
            branches: z.number().optional(),
            functions: z.number().optional(),
          })
          .optional(),
      }),
    },
    async (input: {
      include?: string[];
      thresholds?: {
        lines?: number;
        branches?: number;
        functions?: number;
      };
    }) => {
      const { include, thresholds } = input;
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
      let summary;
      try {
        summary = JSON.parse(await fs.readFile(summaryPath, "utf8")).total;
      } catch {
        throw new Error(`Coverage summary not found at ${summaryPath}`);
      }

      const fail: string[] = [];
      if (thresholds?.lines && summary.lines.pct < thresholds.lines)
        fail.push(`lines ${summary.lines.pct}% < ${thresholds.lines}%`);
      if (thresholds?.branches && summary.branches.pct < thresholds.branches)
        fail.push(
          `branches ${summary.branches.pct}% < ${thresholds.branches}%`,
        );
      if (thresholds?.functions && summary.functions.pct < thresholds.functions)
        fail.push(
          `functions ${summary.functions.pct}% < ${thresholds.functions}%`,
        );

      if (fail.length) {
        throw new Error(`Coverage below threshold: ${fail.join(", ")}`);
      }
      return { summary };
    },
  );

  // propertyCheck
  s.registerTool(
    "tdd.propertyCheck",
    {
      inputSchema: z.object({
        propertyModule: z.string(),
        propertyExport: z.string(),
        runs: z.number().default(100),
      }),
    },
    async (input: {
      propertyModule: string;
      propertyExport: string;
      runs: number;
    }) => {
      const { propertyModule, propertyExport, runs } = input;
      const abs = path.isAbsolute(propertyModule)
        ? propertyModule
        : path.resolve(process.cwd(), propertyModule);
      const mod = await import(pathToFileURL(abs).href);
      const propertyFactory = (mod as any)[propertyExport];
      if (typeof propertyFactory !== "function") {
        throw new Error(`Export "${propertyExport}" is not a function`);
      }
      const property = propertyFactory(fc);
      await fc.assert(property, { numRuns: runs });
      return { ok: true };
    },
  );

  // mutationScore
  s.registerTool(
    "tdd.mutationScore",
    {
      inputSchema: z.object({
        files: z.array(z.string()).optional(),
        minScore: z.number().default(60),
      }),
    },
    async (input: { files?: string[]; minScore: number }) => {
      const { files, minScore } = input;
      const args = ["--yes", "stryker", "run"];
      if (files?.length) args.push("--mutate", files.join(","));

      const { stdout } = await execFileAsync("npx", args, EXEC_OPTS);
      const match = stdout.match(/Mutation score\s*:?\s*([\d.]+)%?/i);
      const score = match?.[1] ? parseFloat(match[1]) : 0;

      if (score < minScore) {
        throw new Error(
          `Mutation score ${score}% is below required ${minScore}%`,
        );
      }
      return { score };
    },
  );
}
