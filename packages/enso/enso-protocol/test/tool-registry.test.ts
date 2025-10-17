import test from 'ava';
import { ToolRegistry } from '../src/tools.js';
import type { ToolCall, ToolProvider } from '../src/types/tools.js';

const provider: ToolProvider = 'duck';

const registry = new ToolRegistry();
registry.register(provider, {
  name: 'echo',
  handler: (args) => ({ args }),
  timeoutMs: 50,
});

registry.register(provider, {
  name: 'sleep',
  handler: async (ms: any) => {
    await new Promise((r) => setTimeout(r, Number(ms || 0)));
    return 'done';
  },
  timeoutMs: 10,
});

function mkCall(name: string, args: unknown, ttlMs?: number): ToolCall {
  return {
    callId: 't1',
    provider,
    name,
    args,
    ...(ttlMs ? { ttlMs } : {}),
  };
}

// advertisement should reflect registered tools

test('advertisement includes tools', (t) => {
  const ad = registry.advertisement(provider);
  t.truthy(ad.tools.find((t2) => t2.name === 'echo'));
  t.truthy(ad.tools.find((t2) => t2.name === 'sleep'));
});

// successful invoke

test('invoke returns ok result', async (t) => {
  const res = await registry.invoke(mkCall('echo', { a: 1 }));
  t.true(res.ok);
  t.deepEqual((res as any).result, { args: { a: 1 } });
});

// timeout enforced

test('invoke enforces timeout', async (t) => {
  const res = await registry.invoke(mkCall('sleep', 100, 5));
  t.false(res.ok);
  t.is(res.error, 'timeout');
});

// unknown tool

test('unknown tool result', async (t) => {
  const res = await registry.invoke(mkCall('nope', {}));
  t.false(res.ok);
  t.regex(res.error || '', /unknown tool/);
});
