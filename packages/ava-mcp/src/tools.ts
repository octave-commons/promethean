import type { Server } from "@modelcontextprotocol/sdk/server";
import { z } from "zod";
import { promises as fs } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { minimatch } from "minimatch";
import fc from "fast-check";
import { Stryker } from "@stryker-mutator/core";

const execFileAsync = promisify(execFile);

export function registerTddTools(server: Server) {
  // biome-ignore lint/suspicious/noExplicitAny: server typing is dynamic
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
    },
  );

  // changedFiles
  s.registerTool(
    "tdd.changedFiles",
    {
      inputSchema: z.object({
        base: z.string().default("origin/main"),
        patterns: z.array(z.string()).default(["**/*.ts", "**/*.tsx"]),
      }),
    },
    async (input: { base: string; patterns: string[] }) => {
      const { base, patterns } = input;
      const { stdout } = await execFileAsync("git", [
        "diff",
        "--name-only",
        `${base}...HEAD`,
      ]);
      const files = stdout
        .split("\n")
        .filter(Boolean)
        .filter((f) => patterns.some((p: string) => minimatch(f, p)));
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
      const args = ["--yes", "ava", "--json"];
      if (tap) args.push("--tap");
      if (watch) args.push("--watch");
      for (const m of match ?? []) args.push("--match", m);
      if (files?.length) args.push(...files);

      const { stdout } = await execFileAsync("npx", args);
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
      await execFileAsync("npx", args);

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
      const mod = await import(pathToFileURL(propertyModule).href);
      // biome-ignore lint/suspicious/noExplicitAny: dynamic import
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
      const stryker = new Stryker({
        mutate: files?.length ? files : undefined,
      });
      // biome-ignore lint/suspicious/noExplicitAny: stryker result typing
      const results: any[] = await stryker.runMutationTest();
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

      if (score < minScore) {
        throw new Error(
          `Mutation score ${score}% is below required ${minScore}%`,
        );
      }
      return { score };
    },
  );
}
