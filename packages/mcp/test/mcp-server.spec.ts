import test from 'ava';
import esmock from 'esmock';
import { z } from 'zod';

// Minimal Tool typings to keep this test self-contained
type ToolSpec = Readonly<{
  name: string;
  description: string;
  inputSchema?: Record<string, any>;
  outputSchema?: Record<string, any>;
}>;
type Tool = Readonly<{
  spec: ToolSpec;
  invoke: (args: unknown) => Promise<unknown>;
}>;

// Fake MCP server to capture registrations
class FakeMcpServer {
  public tools: Array<{
    name: string;
    def: any;
    handler: (args: unknown) => Promise<any>;
  }> = [];
  constructor(_: any) {}
  registerTool(name: string, def: any, handler: (args: unknown) => Promise<any>) {
    this.tools.push({ name, def, handler });
  }
}

// Load the module under test with the MCP SDK mocked
const loadCreateMcpServer = async () => {
  const mod = await esmock('../src/core/mcp-server.ts', {
    '@modelcontextprotocol/sdk/server/mcp.js': {
      McpServer: FakeMcpServer,
    },
  });
  return mod.createMcpServer as (tools: readonly Tool[]) => FakeMcpServer;
};

test('createMcpServer wraps ZodRawShape into Zod object for input/output schemas', async (t) => {
  const createMcpServer = await loadCreateMcpServer();

  const tool: Tool = {
    spec: {
      name: 'example_tool',
      description: 'demo',
      // Raw shapes (ZodRawShape)
      inputSchema: { q: z.string().min(1) },
      outputSchema: { ok: z.boolean() },
    },
    invoke: async (args) => {
      // Echo a structured object so we can assert structuredContent path
      return { ok: true, received: args };
    },
  };

  const server = createMcpServer([tool]);

  t.is(server.tools.length, 1);
  const { name, def, handler } = server.tools[0];

  t.is(name, 'example_tool');

  // Assert inputSchema is a ZodObject (i.e., wrapping occurred)
  t.truthy(def.inputSchema);
  t.is(typeof def.inputSchema.parse, 'function');
  t.notThrows(() => def.inputSchema.parse({ q: 'hello' }));
  t.throws(() => def.inputSchema.parse({ q: '' })); // fails min(1)

  // Assert outputSchema is also a ZodObject
  t.truthy(def.outputSchema);
  t.is(typeof def.outputSchema.parse, 'function');
  t.notThrows(() => def.outputSchema.parse({ ok: true }));
  t.throws(() => def.outputSchema.parse({ ok: 'nope' }));

  // The handler should return structuredContent when outputSchema exists
  const result = await handler({ q: 'hello' });
  t.true(Array.isArray(result.content));
  t.deepEqual(result.structuredContent, { ok: true, received: { q: 'hello' } });
});

test('createMcpServer tolerates tools without schemas', async (t) => {
  const createMcpServer = await loadCreateMcpServer();

  const toolNoSchemas: Tool = {
    spec: {
      name: 'no_schema_tool',
      description: 'no schemas',
    },
    invoke: async () => 'plain-text',
  };

  const server = createMcpServer([toolNoSchemas]);
  t.is(server.tools.length, 1);

  const { def, handler } = server.tools[0];
  t.is(def.inputSchema, undefined);
  t.is(def.outputSchema, undefined);

  const result = await handler({});
  // Should still return a valid content union with text
  t.true(Array.isArray(result.content));
  t.is(result.content[0]?.type, 'text');
  t.is(result.content[0]?.text, 'plain-text');
});