import test from 'ava';
import { z } from 'zod';

import type { EndpointDefinition } from '../core/resolve-config.js';
import type { ToolContext } from '../core/types.js';
import { validateConfig } from '../tools/validate-config.js';

type ValidateResult = Readonly<{
  ok: boolean;
  errors: readonly string[];
  warnings: readonly string[];
  summary: Readonly<{
    endpoints: number;
    errorCount: number;
    warningCount: number;
    workflowIssues: number;
    proxies: Readonly<{
      inline: number;
      config: number;
      fallback: number;
      active: number;
    }>;
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
    proxies: z.object({
      inline: z.number(),
      config: z.number(),
      fallback: z.number(),
      active: z.number(),
    }),
  }),
}) satisfies z.ZodType<ValidateResult>;

type TestContext = ToolContext & {
  readonly __allEndpoints: readonly EndpointDefinition[];
  readonly __allToolIds: readonly string[];
  readonly __proxySources: Readonly<{
    inline: readonly any[];
    config: readonly any[];
    fallback: readonly any[];
  }>;
};

const mkCtx = (
  endpoints: readonly EndpointDefinition[],
  allToolIds: readonly string[],
  proxySources: TestContext['__proxySources'] = { inline: [], config: [], fallback: [] },
): TestContext => ({
  env: {},
  fetch: () => Promise.resolve({ ok: true } as Response),
  now: () => new Date(),
  __allEndpoints: endpoints,
  __allToolIds: allToolIds,
  __proxySources: proxySources,
});

test('validate-config returns ok when workflows match exposed tools', async (t) => {
  const endpoints: EndpointDefinition[] = [
    {
      path: '/files',
      tools: ['files.search', 'files.view-file'],
      includeHelp: true,
      meta: {
        title: 'Filesystem',
        description: 'Search and inspect workspace files.',
        workflow: ['files.search → files.view-file'],
      },
    },
  ];
  const ctx = mkCtx(endpoints, [
    'files.search',
    'files.view-file',
    'apply_patch',
    'mcp.help',
    'mcp.toolset',
    'mcp.endpoints',
  ]);
  const tool = validateConfig(ctx);
  const result = ResultSchema.parse(await tool.invoke(undefined));
  t.true(result.ok);
  t.deepEqual(result.errors, []);
  t.deepEqual(result.warnings, []);
  t.is(result.summary.workflowIssues, 0);
  t.deepEqual(result.summary.proxies, {
    inline: 0,
    config: 0,
    fallback: 0,
    active: 0,
  });
});

test('validate-config summary reports proxy sources', async (t) => {
  const ctx = mkCtx([], [], {
    inline: [
      {
        name: 'inline',
        command: 'cmd',
        args: [],
        env: {},
        httpPath: '/inline',
      },
    ],
    config: [],
    fallback: [
      {
        name: 'fallback',
        command: 'cmd',
        args: [],
        env: {},
        httpPath: '/fallback',
      },
    ],
  });
  const tool = validateConfig(ctx);
  const result = ResultSchema.parse(await tool.invoke(undefined));
  t.is(result.summary.proxies.inline, 1);
  t.is(result.summary.proxies.config, 0);
  t.is(result.summary.proxies.fallback, 1);
  t.is(result.summary.proxies.active, 1);
});

test('validate-config flags unknown workflow tool ids', async (t) => {
  const endpoints: EndpointDefinition[] = [
    {
      path: '/files',
      tools: ['files.view-file'],
      includeHelp: true,
      meta: {
        title: 'Filesystem',
        description: 'Read files.',
        workflow: ['files.view-file → files.apply'],
      },
    },
  ];
  const ctx = mkCtx(endpoints, ['files.view-file']);
  const tool = validateConfig(ctx);
  const result = ResultSchema.parse(await tool.invoke(undefined));
  t.false(result.ok);
  t.true(
    result.errors.some((msg) => msg.includes('files.apply')),
    result.errors.join('\n'),
  );
  t.is(result.summary.workflowIssues, 1);
});

test('validate-config detects workflow references missing from endpoint', async (t) => {
  const endpoints: EndpointDefinition[] = [
    {
      path: '/files',
      tools: ['files.view-file'],
      includeHelp: true,
      meta: {
        title: 'Filesystem',
        description: 'Read files.',
        workflow: ['Consult docs', 'files.search'],
      },
    },
  ];
  const ctx = mkCtx(endpoints, ['files.view-file', 'files.search']);
  const tool = validateConfig(ctx);
  const result = ResultSchema.parse(await tool.invoke(undefined));
  t.false(result.ok);
  t.true(
    result.errors.some((msg) => msg.includes('files.search')),
    result.errors.join('\n'),
  );
  t.true(result.warnings.some((msg) => msg.includes('does not reference any tool ids')));
  t.is(result.summary.workflowIssues, 2);
});
