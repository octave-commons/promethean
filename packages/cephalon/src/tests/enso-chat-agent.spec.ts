import test from 'ava';
import { once } from 'node:events';
import { createEnsoChatAgent } from '../enso/chat-agent.js';

// smoke test: local loop, send & receive a chat message
// uses connectLocal when no URL is provided

test('EnsoChatAgent local echo', async (t) => {
  const agent = createEnsoChatAgent({ room: 'duck:test' });
  await agent.connect();

  const p = once(agent as any, 'message');
  await agent.sendText('human', 'ping');
  const [evt] = (await Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 2000))])) as any;

  t.truthy(evt?.type === 'message');
  t.is(evt.message.parts[0].kind, 'text');
  t.is(evt.message.parts[0].text, 'ping');

  await agent.dispose();
});
