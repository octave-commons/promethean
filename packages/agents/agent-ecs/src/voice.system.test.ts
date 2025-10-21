import test from 'ava';

import type { AudioPlayer } from './types.js';
import { createAgentWorld } from './world.js';
import { VoiceSystem } from './systems/voice.js';

type TestBus = {
    publish: (msg: { topic: string } & Record<string, unknown>) => void;
    subscribe: <T>(topic: string, handler: (event: T) => void) => void;
};

const makePlayer = (): AudioPlayer => ({
    play: () => {},
    stop: () => {},
    pause: () => {},
    unpause: () => {},
    isPlaying: () => false,
});

const makeBus = (): TestBus => {
    const handlers = new Map<string, ReadonlyArray<(event: unknown) => void>>();
    return {
        publish(msg) {
            const hs = handlers.get(msg.topic) ?? [];
            hs.forEach((handler) => handler(msg));
        },
        subscribe(topic, handler) {
            const hs = handlers.get(topic) ?? [];
            handlers.set(topic, [...hs, handler as (event: unknown) => void]);
        },
    };
};

test('voice system joins and leaves', (t) => {
    const player = makePlayer();
    const { w, agent, C } = createAgentWorld(player);
    const bus = makeBus();
    VoiceSystem({
        world: w,
        agent,
        components: C,
        bus,
        deps: {
            joinVoiceChannel: () => ({
                subscribe: () => {},
                destroy: () => {},
            }),
            createAudioResource: (s: unknown) => s,
            tts: async (text: string) => ({ stream: text, cleanup: () => {} }),
        },
    });
    bus.publish({ topic: 'VOICE/JOIN_REQUESTED', guildId: 'g', voiceChannelId: 'c' });
    const vs = w.get(agent, C.VoiceState);
    t.truthy(vs?.connection);
    bus.publish({ topic: 'VOICE/LEAVE_REQUESTED', guildId: 'g' });
    const vs2 = w.get(agent, C.VoiceState);
    t.is(vs2?.connection, null);
});

test('voice system queues tts requests', (t) => {
    const player = makePlayer();
    const { w, agent, C } = createAgentWorld(player);
    const bus = makeBus();
    VoiceSystem({
        world: w,
        agent,
        components: C,
        bus,
        deps: {
            joinVoiceChannel: () => ({}),
            createAudioResource: (s: unknown) => s,
            tts: async (text: string) => ({ stream: text, cleanup: () => {} }),
        },
    });
    // set connection so tts can proceed
    w.set(agent, C.VoiceState, { connection: {} });
    bus.publish({ topic: 'VOICE/TTS_REQUESTED', message: 'hello', guildId: 'g' });
    const pq = w.get(agent, C.PlaybackQ)!;
    t.is(pq.items.length, 1);
});
