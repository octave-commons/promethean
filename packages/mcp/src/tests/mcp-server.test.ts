import test from 'ava';
import esmock from 'esmock';
import { z } from 'zod';

import type { Tool } from '../core/types.js';

test('createMcpServer returns structured content when tool declares output schema', async (t) => {
  type Handler = (args: unknown) => Promise<unknown>;
  const registrations: Array<{ name: string; handler: Handler }> = [];

  class FakeMcpServer {
    public constructor(_info: unknown) {}

    registerTool(name: string, _def: unknown, handler: Handler): void {
      registrations.push({ name, handler });
    }
  }

  const modulePath = new URL('../core/mcp-server.js', import.meta.url).pathname;
  const { createMcpServer } = await esmock<typeof import('../core/mcp-server.js')>(modulePath, {
    '@modelcontextprotocol/sdk/server/mcp.js': { McpServer: FakeMcpServer },
  });

  const OutputSchema = z.object({ status: z.number() }).strict();

  const tool: Tool = {
    spec: {
      name: 'structured_tool',
      description: 'Returns a structured payload.',
      outputSchema: OutputSchema.shape,
    },
    invoke: async () => ({ status: 200 }),
  };

  createMcpServer([tool]);

  t.is(registrations.length, 1);
  t.is(registrations[0]?.name, tool.spec.name);

  const payload = await registrations[0]!.handler({});
  t.deepEqual(payload, {
    structuredContent: { status: 200 },
    content: [{ type: 'text', text: '{\n  "status": 200\n}' }],
  });
});

test('createMcpServer falls back to text content when tool omits output schema', async (t) => {
  type Handler = (args: unknown) => Promise<unknown>;
  const registrations: Array<{ handler: Handler }> = [];

  class FakeMcpServer {
    public constructor(_info: unknown) {}

    registerTool(_name: string, _def: unknown, handler: Handler): void {
      registrations.push({ handler });
    }
  }

  const modulePath = new URL('../core/mcp-server.js', import.meta.url).pathname;
  const { createMcpServer } = await esmock<typeof import('../core/mcp-server.js')>(modulePath, {
    '@modelcontextprotocol/sdk/server/mcp.js': { McpServer: FakeMcpServer },
  });

  const tool: Tool = {
    spec: {
      name: 'text_tool',
      description: 'Returns plain text.',
    },
    invoke: async () => 'hello world',
  };

  createMcpServer([tool]);

  t.is(registrations.length, 1);
  const payload = await registrations[0]!.handler({});
  t.deepEqual(payload, {
    content: [{ type: 'text', text: 'hello world' }],
  });
});

test('createMcpServer returns structured content even when tool result is undefined', async (t) => {
  type Handler = (args: unknown) => Promise<unknown>;
  const registrations: Array<{ name: string; handler: Handler }> = [];

  class FakeMcpServer {
    public constructor(_info: unknown) {}

    registerTool(name: string, _def: unknown, handler: Handler): void {
      registrations.push({ name, handler });
    }
  }

  const modulePath = new URL('../core/mcp-server.js', import.meta.url).pathname;
  const { createMcpServer } = await esmock<typeof import('../core/mcp-server.js')>(modulePath, {
    '@modelcontextprotocol/sdk/server/mcp.js': { McpServer: FakeMcpServer },
  });

  const OutputSchema = z.object({ status: z.number() }).strict();

  const tool: Tool = {
    spec: {
      name: 'structured_tool_undefined_result',
      description: 'Returns undefined but declares output schema.',
      outputSchema: OutputSchema.shape,
    },
    invoke: async () => undefined,
  };

  createMcpServer([tool]);

  t.is(registrations.length, 1);
  t.is(registrations[0]?.name, tool.spec.name);

  const payload = await registrations[0]!.handler({});
  t.deepEqual(payload, {
    structuredContent: null,
    content: [{ type: 'text', text: 'undefined' }],
  });
});

test('createMcpServer preserves structured content for falsy primitives', async (t) => {
  type Handler = (args: unknown) => Promise<unknown>;
  const registrations: Array<{ handler: Handler }> = [];

  class FakeMcpServer {
    public constructor(_info: unknown) {}

    registerTool(_name: string, _def: unknown, handler: Handler): void {
      registrations.push({ handler });
    }
  }

  const modulePath = new URL('../core/mcp-server.js', import.meta.url).pathname;
  const { createMcpServer } = await esmock<typeof import('../core/mcp-server.js')>(modulePath, {
    '@modelcontextprotocol/sdk/server/mcp.js': { McpServer: FakeMcpServer },
  });

  const OutputSchema = z.object({ ok: z.boolean() }).strict();

  const tool: Tool = {
    spec: {
      name: 'structured_tool_false_result',
      description: 'Returns false but declares output schema.',
      outputSchema: OutputSchema.shape,
    },
    invoke: async () => false,
  };

  createMcpServer([tool]);

  t.is(registrations.length, 1);

  const payload = await registrations[0]!.handler({});
  t.deepEqual(payload, {
    structuredContent: false,
    content: [{ type: 'text', text: 'false' }],
  });
});
