import test from "ava";
import { z } from "zod";

import type { EndpointDefinition } from "../core/resolve-config.js";
import type { ToolContext } from "../core/types.js";
import { validateConfig } from "../tools/validate-config.js";

type ValidateResult = Readonly<{
  ok: boolean;
  errors: readonly string[];
  warnings: readonly string[];
  summary: Readonly<{
    endpoints: number;
    errorCount: number;
    warningCount: number;
    workflowIssues: number;
  }>;
}>;

const ResultSchema = z.object({
  ok: z.boolean(),
  errors: z.array(z.string()),
  warnings: z.array(z.string()),
  summary: z.object({
    endpoints: z.number(),
    errorCount: z.number(),
    warningCount: z.number(),
    workflowIssues: z.number(),
  }),
}) satisfies z.ZodType<ValidateResult>;

type TestContext = ToolContext & {
  readonly __allEndpoints: readonly EndpointDefinition[];
  readonly __allToolIds: readonly string[];
};

const mkCtx = (
  endpoints: readonly EndpointDefinition[],
  allToolIds: readonly string[],
): TestContext => ({
  env: {},
  fetch: () => Promise.resolve({ ok: true } as Response),
  now: () => new Date(),
  __allEndpoints: endpoints,
  __allToolIds: allToolIds,
});

test("validate-config returns ok when workflows match exposed tools", async (t) => {
  const endpoints: EndpointDefinition[] = [
    {
      path: "/files",
      tools: ["files.search", "files.view-file"],
      includeHelp: true,
      meta: {
        title: "Filesystem",
        description: "Search and inspect workspace files.",
        workflow: ["files.search → files.view-file"],
      },
    },
  ];
  const ctx = mkCtx(endpoints, [
    "files.search",
    "files.view-file",
    "apply_patch",
    "mcp.help",
    "mcp.toolset",
    "mcp.endpoints",
  ]);
  const tool = validateConfig(ctx);
  const result = ResultSchema.parse(await tool.invoke(undefined));
  t.true(result.ok);
  t.deepEqual(result.errors, []);
  t.deepEqual(result.warnings, []);
  t.is(result.summary.workflowIssues, 0);
});

test("validate-config flags unknown workflow tool ids", async (t) => {
  const endpoints: EndpointDefinition[] = [
    {
      path: "/files",
      tools: ["files.view-file"],
      includeHelp: true,
      meta: {
        title: "Filesystem",
        description: "Read files.",
        workflow: ["files.view-file → files.apply"],
      },
    },
  ];
  const ctx = mkCtx(endpoints, ["files.view-file"]);
  const tool = validateConfig(ctx);
  const result = ResultSchema.parse(await tool.invoke(undefined));
  t.false(result.ok);
  t.true(result.errors.some((msg) => msg.includes("files.apply")), result.errors.join("\n"));
  t.is(result.summary.workflowIssues, 1);
});

test("validate-config detects workflow references missing from endpoint", async (t) => {
  const endpoints: EndpointDefinition[] = [
    {
      path: "/files",
      tools: ["files.view-file"],
      includeHelp: true,
      meta: {
        title: "Filesystem",
        description: "Read files.",
        workflow: ["Consult docs", "files.search"],
      },
    },
  ];
  const ctx = mkCtx(endpoints, ["files.view-file", "files.search"]);
  const tool = validateConfig(ctx);
  const result = ResultSchema.parse(await tool.invoke(undefined));
  t.false(result.ok);
  t.true(result.errors.some((msg) => msg.includes("files.search")), result.errors.join("\n"));
  t.true(result.warnings.some((msg) => msg.includes("does not reference any tool ids")));
  t.is(result.summary.workflowIssues, 2);
});
