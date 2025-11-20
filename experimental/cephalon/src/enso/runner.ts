import 'source-map-support/register.js';
import { createEnsoChatAgent } from '../enso/chat-agent.js';
import { LLMService } from '../llm-service.js';
import { defaultPrompt, defaultState, generatePrompt } from '../prompts.js';

const parseContextAnnotations = (input: string): { spoken: string; context: string[] } => {
  const patterns = [/(\([^)]*\))/g, /(\[[^]]*\])/g, /(\{[^}]*\})/g] as const;
  const raw = String(input ?? '');
  const context = patterns.flatMap((re) => Array.from(raw.matchAll(re)).map((m) => m[0].slice(1, -1).trim()));
  const spoken = patterns.reduce((acc, re) => acc.replace(re, '').trim(), raw).replace(/\s{2,}/g, ' ').trim();
  return { spoken, context };
};

async function main() {
  const ensoUrl = process.env.ENSO_WS_URL || 'ws://localhost:7770';
  const room = process.env.ENSO_CHAT_ROOM || process.env.ENSO_CHAT_CHANNEL || 'duck:chat';
  const privacy = (process.env.DUCK_PRIVACY_PROFILE as any) as 'pseudonymous' | 'ephemeral' | 'persistent' | undefined;
  const llm = new LLMService({ brokerUrl: process.env.BROKER_URL || 'ws://127.0.0.1:7000' });

  const enso = createEnsoChatAgent({ url: ensoUrl, room, privacyProfile: privacy });
  await enso.connect();
  console.log('[runner] connected to enso', ensoUrl, 'room', room);

  // proactive hello so we can see the duck talk
  try {
    const prompt = generatePrompt(defaultPrompt, { ...defaultState, userInput: 'Say "quack" and introduce yourself in one sentence.' });
    const reply = await llm.generate({ prompt, context: [] });
    const out = typeof reply === 'string' ? reply : typeof reply?.message === 'string' ? reply.message : String(reply ?? 'quack');
    await enso.sendText('agent', out);
    console.log('[runner] sent proactive greeting');
  } catch (err) {
    console.warn('[runner] failed to send proactive greeting', err);
  }

  enso.on('message', async (evt: any) => {
    try {
      console.log('[runner] received message', JSON.stringify(evt));
      const message = evt?.message;
      const text = Array.isArray(message?.parts) ? (message.parts.find((p: any) => p.kind === 'text')?.text || '') : '';
      if (!text) return;
      const { spoken } = parseContextAnnotations(text);
      const prompt = generatePrompt(defaultPrompt, { ...defaultState, userInput: spoken });
      const ctx: any[] = [];
      const reply = await llm.generate({ prompt, context: ctx });
      const out = typeof reply === 'string' ? reply : typeof reply?.message === 'string' ? reply.message : String(reply ?? '');
      await enso.sendText('agent', out);
    } catch (e) {
      console.warn('[runner] enso message handler failed', e);
    }
  });

  console.log('[runner] ready. send a message to the room to get a reply.');
}

main().catch((e) => {
  console.error('[runner] fatal', e);
  process.exit(1);
});
