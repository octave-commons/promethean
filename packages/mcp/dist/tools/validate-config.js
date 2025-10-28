import { z } from 'zod';
const OUTPUT_SCHEMA = {
    ok: z.boolean(),
    errors: z.array(z.string()),
    warnings: z.array(z.string()),
    summary: z.object({
        endpoints: z.number().int().nonnegative(),
        errorCount: z.number().int().nonnegative(),
        warningCount: z.number().int().nonnegative(),
        workflowIssues: z.number().int().nonnegative(),
        proxies: z.object({
            inline: z.number().int().nonnegative(),
            config: z.number().int().nonnegative(),
            fallback: z.number().int().nonnegative(),
            active: z.number().int().nonnegative(),
        }),
    }),
};
const META_TOOL_IDS = ['mcp_help', 'mcp_toolset', 'mcp_endpoints', 'mcp_validate_config'];
const TOOL_ID_PATTERN = /\b[a-z][a-z0-9-]*[._][a-z0-9_.-]+\b/g;
const canonical = (value) => value.trim().toLowerCase();
const unique = (values) => values.filter((value, index, arr) => arr.indexOf(value) === index);
const extractToolRefs = (step, allTools) => {
    const matches = step.match(TOOL_ID_PATTERN);
    if (!matches)
        return { known: [], unknown: [] };
    const normalized = matches.map((match) => canonical(match)).filter((match) => match.length > 0);
    const known = normalized.filter((key) => allTools.has(key));
    const unknown = normalized.filter((key) => !allTools.has(key));
    return {
        known: unique(known),
        unknown: unique(unknown),
    };
};
const toEndpointArray = (endpoints) => Array.isArray(endpoints) ? endpoints : [];
const toToolIdArray = (tools) => Array.isArray(tools) ? tools : [];
const buildMetaToolIds = () => META_TOOL_IDS.map(canonical);
const inflateEndpointToolSet = (endpoint, helperIds) => new Set([
    ...toToolIdArray(endpoint.tools).map(canonical),
    ...(endpoint.includeHelp !== false ? helperIds : []),
]);
const collectAllTools = (allToolIds) => new Map(allToolIds.map((id) => [canonical(id), id]));
const formatPrefix = (endpoint) => `endpoint:\`${endpoint.path}\``;
const validateWorkflow = (endpoint, resolvedTools, allTools) => {
    const workflow = Array.isArray(endpoint.meta?.workflow) ? endpoint.meta?.workflow ?? [] : [];
    const prefix = formatPrefix(endpoint);
    return workflow.reduce((acc, step, index) => {
        if (typeof step !== 'string' || step.trim().length === 0) {
            return {
                errors: acc.errors,
                warnings: acc.warnings.concat(`${prefix} meta.workflow[${index}] is empty or not a string`),
                workflowIssues: acc.workflowIssues + 1,
            };
        }
        const { known, unknown } = extractToolRefs(step, allTools);
        if (known.length === 0 && unknown.length === 0) {
            return {
                errors: acc.errors,
                warnings: acc.warnings.concat(`${prefix} meta.workflow[${index}] does not reference any tool ids`),
                workflowIssues: acc.workflowIssues + 1,
            };
        }
        const unknownErrors = unknown.map((key) => `${prefix} meta.workflow[${index}] references unknown tool id \`${key}\``);
        const missingErrors = known
            .map((key) => {
            const toolId = allTools.get(key);
            return toolId && !resolvedTools.has(key)
                ? `${prefix} meta.workflow[${index}] references tool \`${toolId}\` not exposed by this endpoint`
                : null;
        })
            .filter((value) => value !== null);
        const issueCount = unknownErrors.length + missingErrors.length;
        return {
            errors: acc.errors.concat(unknownErrors, missingErrors),
            warnings: acc.warnings,
            workflowIssues: acc.workflowIssues + issueCount,
        };
    }, { errors: [], warnings: [], workflowIssues: 0 });
};
const lintEndpoint = (endpoint, allTools, helperIds) => {
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
const aggregateLint = (endpoints, allTools, helperIds) => endpoints.reduce((acc, endpoint) => {
    const lint = lintEndpoint(endpoint, allTools, helperIds);
    return {
        errors: acc.errors.concat(lint.errors),
        warnings: acc.warnings.concat(lint.warnings),
        workflowIssues: acc.workflowIssues + lint.workflowIssues,
    };
}, { errors: [], warnings: [], workflowIssues: 0 });
const count = (value) => value?.length ?? 0;
const proxySummaryFrom = (ctx) => {
    const sources = ctx.__proxySources;
    const inline = count(sources?.inline);
    const config = count(sources?.config);
    const fallback = count(sources?.fallback);
    return {
        inline,
        config,
        fallback,
        active: inline > 0 ? inline : config > 0 ? config : fallback,
    };
};
// Lints the currently loaded MCP configuration using context injected by index.ts
export const validateConfig = (context) => {
    const spec = {
        name: 'mcp_validate_config',
        description: 'Validate endpoint/tool configuration and narrative metadata. Returns errors and warnings.',
        inputSchema: {},
        outputSchema: OUTPUT_SCHEMA,
        stability: 'experimental',
        since: '0.1.0',
        examples: [
            {
                comment: 'Check for drift between endpoint workflows and exposed tools',
                args: {},
            },
        ],
    };
    const invoke = () => {
        const ctx = context;
        const endpoints = toEndpointArray(ctx.__allEndpoints);
        const allTools = collectAllTools(toToolIdArray(ctx.__allToolIds));
        const helperIds = buildMetaToolIds();
        const lint = aggregateLint(endpoints, allTools, helperIds);
        const outcome = {
            ok: lint.errors.length === 0,
            errors: lint.errors,
            warnings: lint.warnings,
            summary: {
                endpoints: endpoints.length,
                errorCount: lint.errors.length,
                warningCount: lint.warnings.length,
                workflowIssues: lint.workflowIssues,
                proxies: proxySummaryFrom(ctx),
            },
        };
        return Promise.resolve(outcome);
    };
    return { spec, invoke };
};
export default validateConfig;
//# sourceMappingURL=validate-config.js.map