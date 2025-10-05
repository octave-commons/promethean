import { z, type ZodRawShape, ZodError } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

import type { EndpointDefinition } from './resolve-config.js';
import type { Tool, ToolExample } from './types.js';

const OPENAPI_VERSION = '3.1.0' as const;

const sanitizeOperationId = (value: string): string => {
  const normalized = value.replace(/[^A-Za-z0-9_]+/g, '_');
  const trimmed = normalized.replace(/^_+/, '').replace(/_+$/, '');
  return trimmed.length > 0 ? trimmed : 'operation';
};


const clampText = (value: string | undefined, maxLength = 300): string | undefined => {
  if (!value) return undefined;
  if (value.length <= maxLength) return value;
  const truncated = value.slice(0, maxLength).trimEnd();
  return `${truncated.replace(/[.!,;:?]*$/, '')}…`;
};



const formatList = (label: string, items: readonly string[] | undefined): string | undefined => {
  if (!items || items.length === 0) return undefined;
  const body = items.map((item) => `- ${item}`).join('\n');
  return `${label}:\n${body}`;
};

const formatExamples = (examples: readonly ToolExample[] | undefined): string | undefined => {
  if (!examples || examples.length === 0) return undefined;
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

const joinDescription = (parts: readonly (string | undefined)[]): string | undefined => {
  const filtered = parts.filter(
    (part): part is string => typeof part === 'string' && part.trim().length > 0,
  );
  return filtered.length > 0 ? filtered.join('\n\n') : undefined;
};

const buildInfoDescription = (endpoint: EndpointDefinition): string | undefined => {
  const expectations = endpoint.meta?.expectations ?? {};
  return joinDescription([
    endpoint.meta?.description,
    formatList('Workflow', endpoint.meta?.workflow ?? []),
    formatList('Usage expectations', expectations.usage ?? []),
    formatList('Pitfalls', expectations.pitfalls ?? []),
    formatList('Prerequisites', expectations.prerequisites ?? []),
  ]);
};

type ExampleCollection = Readonly<
  Record<string, Readonly<{ summary?: string; value: Readonly<Record<string, unknown>> }>>
>;


export type ActionDefinition = Readonly<{
  name: string;
  description?: string;
  stability: string;
  since: string | null;
  requestSchema: Readonly<Record<string, unknown>>;
  requiresBody: boolean;
  requestExamples?: ExampleCollection;
  successExample?: Readonly<Record<string, unknown>>;
}>;



const requestExamplesFromTool = (
  examples: readonly ToolExample[] | undefined,
): ExampleCollection | undefined => {
  if (!examples || examples.length === 0) return undefined;
  const entries = examples.map((example, index) => {
    const key = `example${index + 1}`;
    const value = {
      ...(example.comment ? { summary: example.comment } : {}),
      value: example.args,
    } as const;
    return [key, value] as const;
  });
  return Object.fromEntries(entries) as ExampleCollection;
};

const responseExampleFromTool = (tool: Tool): Readonly<Record<string, unknown>> | undefined => {
  const sample = tool.spec.outputSchema;
  if (!sample || typeof sample !== 'object') return undefined;
  return sample as Readonly<Record<string, unknown>>;
};

const createRequestSchema = (shape: ZodRawShape | undefined): Record<string, unknown> => {
  const base = z.object(shape ?? {}).strict();
  const schema = zodToJsonSchema(base, { target: 'openApi3' });
  const { $schema: _ignored, ...rest } = schema as Record<string, unknown>;
  void _ignored;
  return rest;
};

const hasRequestFields = (shape: ZodRawShape | undefined): boolean =>
  !!shape && Object.keys(shape).length > 0;

const encodeToolSegment = (name: string): string => encodeURIComponent(name);

const buildOperationDescription = (tool: Tool): string | undefined =>
  joinDescription([tool.spec.description, tool.spec.notes, formatExamples(tool.spec.examples)]);


export const toolToActionDefinition = (tool: Tool): ActionDefinition => {
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
  } satisfies ActionDefinition;
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

type PathItemObject = Readonly<Record<string, unknown>>;

export type OpenApiDocument = Readonly<{
  openapi: typeof OPENAPI_VERSION;
  info: Readonly<{ title: string; version: string; description?: string }>;
  servers: readonly Readonly<{ url: string }>[];
  paths: Readonly<Record<string, PathItemObject>>;
  components?: Readonly<{ schemas?: Record<string, unknown> }>;
}>;


const toActionSummary = (action: ActionDefinition) => ({
  name: action.name,
  description: action.description ?? '',
  stability: action.stability,
  since: action.since,
});

const listActionsPath = (actions: readonly ActionDefinition[]): PathItemObject => ({

const listActionsPath = (tools: readonly Tool[]): PathItemObject => ({

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

              actions: tools.map((tool) => ({
                name: tool.spec.name,
                description: tool.spec.description,
                stability: tool.spec.stability ?? 'experimental',
                since: tool.spec.since ?? null,
              })),

            },
          },
        },
      },
    },
  },
});


const actionPathForDefinition = (action: ActionDefinition, tag: string): PathItemObject => {
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
        description:
          'Normalized tool result payload. Primitive and array results are wrapped under this key.',
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
  } as const;

  return {
    post: {
      operationId: sanitizeOperationId(`${action.name}_action`),
      summary: action.name,
      description,

const actionPathForTool = (tool: Tool, tag: string): PathItemObject => {
  const requestSchema = createRequestSchema(tool.spec.inputSchema);
  const errorSchema = buildErrorSchema();
  const requestExamples = requestExamplesFromTool(tool.spec.examples);
  const successExample = responseExampleFromTool(tool);
  const requiresBody = hasRequestFields(tool.spec.inputSchema);

  return {
    post: {
      operationId: sanitizeOperationId(`${tool.spec.name}_action`),
      summary: tool.spec.name,
      description: buildOperationDescription(tool),

      tags: [tag],
      ...(requiresBody
        ? {
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: requestSchema,
                  ...(requestExamples ? { examples: requestExamples } : {}),
                },
              },
            },
          }
        : {
            requestBody: {
              required: false,
              content: {
                'application/json': {
                  schema: requestSchema,
                  ...(requestExamples ? { examples: requestExamples } : {}),
                },
              },
            },
          }),
      responses: {
        '200': {
          description: 'Tool invocation succeeded',
          content: {
            'application/json': {

              schema: successSchema,

              schema: { type: 'object', additionalProperties: true },

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

        name: tool.spec.name,
        stability: tool.spec.stability ?? 'experimental',
        since: tool.spec.since ?? null,

      },
    },
  } satisfies PathItemObject;
};

export const createEndpointOpenApiDocument = (
  endpoint: EndpointDefinition,

  actions: readonly ActionDefinition[],
  serverUrl: string,

  tools: readonly Tool[],
  basePath: string,

): OpenApiDocument => {
  const title = endpoint.meta?.title ?? `Promethean MCP ${endpoint.path}`;
  const tag = endpoint.meta?.title ?? 'Promethean MCP';
  const infoDescription = buildInfoDescription(endpoint);


  const actionEntries: ReadonlyArray<readonly [string, PathItemObject]> = actions.map((action) => [
    `/actions/${encodeToolSegment(action.name)}`,
    actionPathForDefinition(action, tag),
  ]);

  const pathEntries: ReadonlyArray<readonly [string, PathItemObject]> = [
    ['/actions', listActionsPath(actions)],

  const actionEntries: ReadonlyArray<readonly [string, PathItemObject]> = tools.map((tool) => [
    `/actions/${encodeToolSegment(tool.spec.name)}`,
    actionPathForTool(tool, tag),
  ]);

  const pathEntries: ReadonlyArray<readonly [string, PathItemObject]> = [
    ['/actions', listActionsPath(tools)],

    ...actionEntries,
  ];

  const paths = Object.fromEntries(pathEntries) as Readonly<Record<string, PathItemObject>>;

  return {
    openapi: OPENAPI_VERSION,
    info: {
      title,
      version: '1.0.0',
      ...(infoDescription ? { description: infoDescription } : {}),
    },

    servers: [{ url: serverUrl }],

    servers: [{ url: basePath }],

    paths,
  };
};

export const encodeActionPathSegment = encodeToolSegment;

export const isZodValidationError = (error: unknown): error is ZodError =>
  error instanceof ZodError;
