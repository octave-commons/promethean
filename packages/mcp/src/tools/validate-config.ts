import { z } from "zod";

import type { EndpointDefinition } from "../core/resolve-config.js";
import type { ToolContext, ToolFactory, ToolSpec } from "../core/types.js";

type ValidationSummary = Readonly<{
  endpoints: number;
  errorCount: number;
  warningCount: number;
  workflowIssues: number;
}>;

type ValidationOutcome = Readonly<{
  ok: boolean;
  errors: readonly string[];
  warnings: readonly string[];
  summary: ValidationSummary;
}>;

type ValidationContext = ToolContext & {
  readonly __allEndpoints?: readonly EndpointDefinition[];
  readonly __allToolIds?: readonly string[];
};

const OUTPUT_SCHEMA = {
  ok: z.boolean(),
  errors: z.array(z.string()),
  warnings: z.array(z.string()),
  summary: z.object({
    endpoints: z.number().int().nonnegative(),
    errorCount: z.number().int().nonnegative(),
    warningCount: z.number().int().nonnegative(),
    workflowIssues: z.number().int().nonnegative(),
  }),
} as const;

const META_TOOL_IDS = [
  "mcp.help",
  "mcp.toolset",
  "mcp.endpoints",
  "mcp.validate-config",
] as const;

const TOOL_ID_PATTERN = /\b[a-z][a-z0-9-]*[._][a-z0-9_.-]+\b/g;

const canonical = (value: string): string => value.trim().toLowerCase();

const unique = <T>(values: readonly T[]): readonly T[] =>
  values.filter((value, index, arr) => arr.indexOf(value) === index);

type StepToolRefs = Readonly<{
  known: readonly string[];
  unknown: readonly string[];
}>;

const extractToolRefs = (
  step: string,
  allTools: ReadonlyMap<string, string>,
): StepToolRefs => {
  const matches = step.match(TOOL_ID_PATTERN);
  if (!matches) return { known: [], unknown: [] };
  const normalized = matches
    .map((match) => canonical(match))
    .filter((match) => match.length > 0);
  const known = normalized.filter((key) => allTools.has(key));
  const unknown = normalized.filter((key) => !allTools.has(key));
  return {
    known: unique(known),
    unknown: unique(unknown),
  };
};

const toEndpointArray = (
  endpoints: unknown,
): readonly EndpointDefinition[] =>
  Array.isArray(endpoints)
    ? (endpoints as readonly EndpointDefinition[])
    : [];

const toToolIdArray = (tools: unknown): readonly string[] =>
  Array.isArray(tools) ? (tools as readonly string[]) : [];

const buildMetaToolIds = (): readonly string[] =>
  META_TOOL_IDS.map(canonical);

const inflateEndpointToolSet = (
  endpoint: EndpointDefinition,
  helperIds: readonly string[],
): ReadonlySet<string> =>
  new Set(
    [
      ...toToolIdArray(endpoint.tools).map(canonical),
      ...(endpoint.includeHelp !== false ? helperIds : []),
    ],
  );

const collectAllTools = (
  allToolIds: readonly string[],
): ReadonlyMap<string, string> =>
  new Map(allToolIds.map((id) => [canonical(id), id] as const));

const formatPrefix = (endpoint: EndpointDefinition): string =>
  `endpoint:\`${endpoint.path}\``;

type WorkflowLint = Readonly<{
  errors: readonly string[];
  warnings: readonly string[];
  workflowIssues: number;
}>;

const validateWorkflow = (
  endpoint: EndpointDefinition,
  resolvedTools: ReadonlySet<string>,
  allTools: ReadonlyMap<string, string>,
): WorkflowLint => {
  const workflow = Array.isArray(endpoint.meta?.workflow)
    ? endpoint.meta?.workflow ?? []
    : [];
  const prefix = formatPrefix(endpoint);
  return workflow.reduce<WorkflowLint>(
    (acc, step, index) => {
      if (typeof step !== "string" || step.trim().length === 0) {
        return {
          errors: acc.errors,
          warnings: acc.warnings.concat(
            `${prefix} meta.workflow[${index}] is empty or not a string`,
          ),
          workflowIssues: acc.workflowIssues + 1,
        };
      }
      const { known, unknown } = extractToolRefs(step, allTools);
      if (known.length === 0 && unknown.length === 0) {
        return {
          errors: acc.errors,
          warnings: acc.warnings.concat(
            `${prefix} meta.workflow[${index}] does not reference any tool ids`,
          ),
          workflowIssues: acc.workflowIssues + 1,
        };
      }
      const unknownErrors = unknown.map(
        (key) =>
          `${prefix} meta.workflow[${index}] references unknown tool id \`${key}\``,
      );
      const missingErrors = known
        .map((key) => {
          const toolId = allTools.get(key);
          return toolId && !resolvedTools.has(key)
            ? `${prefix} meta.workflow[${index}] references tool \`${toolId}\` not exposed by this endpoint`
            : null;
        })
        .filter((value): value is string => value !== null);
      const issueCount = unknownErrors.length + missingErrors.length;
      return {
        errors: acc.errors.concat(unknownErrors, missingErrors),
        warnings: acc.warnings,
        workflowIssues: acc.workflowIssues + issueCount,
      };
    },
    { errors: [], warnings: [], workflowIssues: 0 },
  );
};

type EndpointLint = Readonly<{
  errors: readonly string[];
  warnings: readonly string[];
  workflowIssues: number;
}>;

const lintEndpoint = (
  endpoint: EndpointDefinition,
  allTools: ReadonlyMap<string, string>,
  helperIds: readonly string[],
): EndpointLint => {
  const prefix = formatPrefix(endpoint);
  const declaredErrors = toToolIdArray(endpoint.tools)
    .map((toolId) => ({ toolId, key: canonical(toolId) }))
    .filter(({ key }) => !allTools.has(key))
    .map(({ toolId }) => `${prefix} unknown tool id: ${toolId}`);

  const meta = endpoint.meta ?? {};
  const metadataWarnings = [
    ...(meta.title ? [] : [`${prefix} meta.title is missing`]),
    ...(meta.description ? [] : [`${prefix} meta.description is missing`]),
  ];

  const resolvedTools = inflateEndpointToolSet(endpoint, helperIds);
  const workflowLint = validateWorkflow(endpoint, resolvedTools, allTools);

  return {
    errors: declaredErrors.concat(workflowLint.errors),
    warnings: metadataWarnings.concat(workflowLint.warnings),
    workflowIssues: workflowLint.workflowIssues,
  };
};

type AggregateLint = Readonly<{
  errors: readonly string[];
  warnings: readonly string[];
  workflowIssues: number;
}>;

const aggregateLint = (
  endpoints: readonly EndpointDefinition[],
  allTools: ReadonlyMap<string, string>,
  helperIds: readonly string[],
): AggregateLint =>
  endpoints.reduce<AggregateLint>(
    (acc, endpoint) => {
      const lint = lintEndpoint(endpoint, allTools, helperIds);
      return {
        errors: acc.errors.concat(lint.errors),
        warnings: acc.warnings.concat(lint.warnings),
        workflowIssues: acc.workflowIssues + lint.workflowIssues,
      };
    },
    { errors: [], warnings: [], workflowIssues: 0 },
  );

// Lints the currently loaded MCP configuration using context injected by index.ts
export const validateConfig: ToolFactory = (context) => {
  const spec = {
    name: "mcp.validate-config",
    description:
      "Validate endpoint/tool configuration and narrative metadata. Returns errors and warnings.",
    inputSchema: {},
    outputSchema: OUTPUT_SCHEMA,
    stability: "experimental",
    since: "0.1.0",
    examples: [
      {
        comment: "Check for drift between endpoint workflows and exposed tools",
        args: {},
      },
    ],
  } satisfies ToolSpec;

  const invoke = (): Promise<ValidationOutcome> => {
    const ctx = context as ValidationContext;
    const endpoints = toEndpointArray(ctx.__allEndpoints);
    const allTools = collectAllTools(toToolIdArray(ctx.__allToolIds));
    const helperIds = buildMetaToolIds();
    const lint = aggregateLint(endpoints, allTools, helperIds);

    const outcome: ValidationOutcome = {
      ok: lint.errors.length === 0,
      errors: lint.errors,
      warnings: lint.warnings,
      summary: {
        endpoints: endpoints.length,
        errorCount: lint.errors.length,
        warningCount: lint.warnings.length,
        workflowIssues: lint.workflowIssues,
      },
    };

    return Promise.resolve(outcome);
  };

  return { spec, invoke };
};

export default validateConfig;
