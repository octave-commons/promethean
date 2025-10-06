import test from 'ava';
import { randomUUID } from 'node:crypto';
import { createEnsoChatAgent } from '../enso/chat-agent.js';
import { ToolRegistry } from '@promethean/enso-protocol';

test('duck native tools: ping round-trip', async (t) => {
  const agent = createEnsoChatAgent({ room: 'duck:test:tools' });
  await agent.connect();

  const client: any = (agent as any).client;
  const tools = new ToolRegistry();
  const call = {
    provider: 'native' as const,
    serverId: 'cephalon-duck',
    name: 'duck.ping',
    args: { echo: 'hello' },
    callId: randomUUID(),
  };

  const resultPromise = new Promise<any>((resolve, reject) => {
    const to = setTimeout(() => reject(new Error('timeout')), 30000);
    client.on('event:tool.result', (env: any) => {
      if (env.payload?.callId === call.callId) {
        clearTimeout(to);
        resolve(env.payload);
      }
    });
  });

  client.send(tools.callEnvelope(call));
  const result = await resultPromise;
  t.true(result.ok);
  t.is(result.callId, call.callId);
  t.is(result.result.echo, 'hello');
  await agent.dispose();
});
