import { z, ZodError } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
const OPENAPI_VERSION = '3.1.0';
const sanitizeOperationId = (value) => {
    const normalized = value.replace(/[^A-Za-z0-9_]+/g, '_');
    const trimmed = normalized.replace(/^_+/, '').replace(/_+$/, '');
    return trimmed.length > 0 ? trimmed : 'operation';
};
const clampText = (value, maxLength = 300) => {
    if (!value)
        return undefined;
    if (value.length <= maxLength)
        return value;
    const truncated = value.slice(0, maxLength).trimEnd();
    return `${truncated.replace(/[.!,;:?]*$/, '')}…`;
};
const formatList = (label, items) => {
    if (!items || items.length === 0)
        return undefined;
    const body = items.map((item) => `- ${item}`).join('\n');
    return `${label}:\n${body}`;
};
const formatExamples = (examples) => {
    if (!examples || examples.length === 0)
        return undefined;
    const rendered = examples
        .map((example, index) => {
        const header = example.comment
            ? `Example ${index + 1}: ${example.comment}`
            : `Example ${index + 1}`;
        const args = JSON.stringify(example.args, null, 2);
        return `${header}\n${args}`;
    })
        .join('\n\n');
    return rendered.length > 0 ? `Examples:\n${rendered}` : undefined;
};
const joinDescription = (parts) => {
    const filtered = parts.filter((part) => typeof part === 'string' && part.trim().length > 0);
    return filtered.length > 0 ? filtered.join('\n\n') : undefined;
};
const buildInfoDescription = (endpoint) => {
    const expectations = endpoint.meta?.expectations ?? {};
    return joinDescription([
        endpoint.meta?.description,
        formatList('Workflow', endpoint.meta?.workflow ?? []),
        formatList('Usage expectations', expectations.usage ?? []),
        formatList('Pitfalls', expectations.pitfalls ?? []),
        formatList('Prerequisites', expectations.prerequisites ?? []),
    ]);
};
const requestExamplesFromTool = (examples) => {
    if (!examples || examples.length === 0)
        return undefined;
    const entries = examples.map((example, index) => {
        const key = `example${index + 1}`;
        const value = {
            ...(example.comment ? { summary: example.comment } : {}),
            value: example.args,
        };
        return [key, value];
    });
    return Object.fromEntries(entries);
};
const responseExampleFromTool = (tool) => {
    const sample = tool.spec.outputSchema;
    if (!sample || typeof sample !== 'object')
        return undefined;
    return sample;
};
const createRequestSchema = (shape) => {
    const base = z.object(shape ?? {}).strict();
    const schema = zodToJsonSchema(base, { target: 'openApi3' });
    const { $schema: _ignored, ...rest } = schema;
    void _ignored;
    return rest;
};
const hasRequestFields = (shape) => !!shape && Object.keys(shape).length > 0;
const encodeToolSegment = (name) => encodeURIComponent(name);
const buildOperationDescription = (tool) => joinDescription([tool.spec.description, tool.spec.notes, formatExamples(tool.spec.examples)]);
export const toolToActionDefinition = (tool) => {
    const requestSchema = createRequestSchema(tool.spec.inputSchema);
    const requiresBody = hasRequestFields(tool.spec.inputSchema);
    const requestExamples = requestExamplesFromTool(tool.spec.examples);
    const successExample = responseExampleFromTool(tool);
    return {
        name: tool.spec.name,
        description: clampText(buildOperationDescription(tool)),
        stability: tool.spec.stability ?? 'experimental',
        since: tool.spec.since ?? null,
        requestSchema,
        requiresBody,
        ...(requestExamples ? { requestExamples } : {}),
        ...(successExample ? { successExample } : {}),
    };
};
const buildErrorSchema = () => ({
    type: 'object',
    required: ['error', 'message'],
    additionalProperties: true,
    properties: {
        error: { type: 'string' },
        message: { type: 'string' },
        details: { type: 'object', additionalProperties: true },
    },
});
const toActionSummary = (action) => ({
    name: action.name,
    description: action.description ?? '',
    stability: action.stability,
    since: action.since,
});
const listActionsPath = (actions) => ({
    get: {
        operationId: sanitizeOperationId('list_actions'),
        summary: 'List available MCP tools exposed as actions',
        description: 'Enumerate the MCP tools exposed through this endpoint for custom GPT actions.',
        responses: {
            '200': {
                description: 'Available MCP actions',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['actions'],
                            properties: {
                                actions: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        required: ['name', 'description'],
                                        properties: {
                                            name: { type: 'string' },
                                            description: { type: 'string' },
                                            stability: { type: 'string' },
                                            since: { type: ['string', 'null'] },
                                        },
                                        additionalProperties: false,
                                    },
                                },
                            },
                            additionalProperties: false,
                        },
                        example: {
                            actions: actions.map(toActionSummary),
                        },
                    },
                },
            },
        },
    },
});
const actionPathForDefinition = (action, tag) => {
    const requestSchema = action.requestSchema;
    const errorSchema = buildErrorSchema();
    const requestExamples = action.requestExamples;
    const successExample = action.successExample;
    const requiresBody = action.requiresBody;
    const description = clampText(action.description);
    const successSchema = {
        type: 'object',
        additionalProperties: true,
        properties: {
            result: {
                description: 'Normalized tool result payload. Primitive and array results are wrapped under this key.',
                nullable: true,
                anyOf: [
                    { type: 'null' },
                    { type: 'string' },
                    { type: 'number' },
                    { type: 'boolean' },
                    { type: 'array', items: {} },
                    { type: 'object', additionalProperties: true },
                ],
            },
        },
    };
    return {
        post: {
            operationId: sanitizeOperationId(`${action.name}_action`),
            summary: action.name,
            description,
            tags: [tag],
            requestBody: {
                required: requiresBody,
                content: {
                    'application/json': {
                        schema: requestSchema,
                        ...(requestExamples ? { examples: requestExamples } : {}),
                    },
                },
            },
            responses: {
                '200': {
                    description: 'Tool invocation succeeded',
                    content: {
                        'application/json': {
                            schema: successSchema,
                            ...(successExample ? { example: successExample } : {}),
                        },
                    },
                },
                '400': {
                    description: 'Invalid request payload',
                    content: {
                        'application/json': {
                            schema: errorSchema,
                        },
                    },
                },
                '500': {
                    description: 'Tool execution failed',
                    content: {
                        'application/json': {
                            schema: errorSchema,
                        },
                    },
                },
            },
            'x-promethean-tool': {
                name: action.name,
                stability: action.stability,
                since: action.since,
            },
        },
    };
};
export const createEndpointOpenApiDocument = (endpoint, actions, serverUrl) => {
    const title = endpoint.meta?.title ?? `Promethean MCP ${endpoint.path}`;
    const tag = endpoint.meta?.title ?? 'Promethean MCP';
    const infoDescription = buildInfoDescription(endpoint);
    const actionEntries = actions.map((action) => [
        `/actions/${encodeToolSegment(action.name)}`,
        actionPathForDefinition(action, tag),
    ]);
    const pathEntries = [
        ['/actions', listActionsPath(actions)],
        ...actionEntries,
    ];
    const paths = Object.fromEntries(pathEntries);
    return {
        openapi: OPENAPI_VERSION,
        info: {
            title,
            version: '1.0.0',
            ...(infoDescription ? { description: infoDescription } : {}),
        },
        servers: [{ url: serverUrl }],
        paths,
    };
};
export const encodeActionPathSegment = encodeToolSegment;
export const isZodValidationError = (error) => error instanceof ZodError;
//# sourceMappingURL=openapi.js.map