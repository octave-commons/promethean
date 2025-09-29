import test from 'ava';

import { createAgentWorld } from './world.js';
import { VoiceSystem } from './systems/voice.js';

function makePlayer() {
    let subscribed: any = null;
    return {
        play: (_: any) => {},
        stop: () => {},
        pause: () => {},
        unpause: () => {},
        isPlaying: () => false,
        subscribe: (conn: any) => {
            subscribed = conn;
        },
        __subscribed: () => subscribed,
    } as any;
}

function makeBus() {
    const handlers = new Map<string, ((e: any) => void)[]>();
    return {
        publish(msg: any) {
            const hs = handlers.get(msg.topic) || [];
            hs.forEach((h) => h(msg));
        },
        subscribe(topic: string, h: any) {
            const hs = handlers.get(topic) || [];
            hs.push(h);
            handlers.set(topic, hs);
        },
    };
}

test('voice system joins and leaves', (t) => {
    const player = makePlayer();
    const { w, agent, C } = createAgentWorld(player);
    const bus = makeBus();
    let destroyed = false;
    VoiceSystem(w, agent, C, {
        bus,
        deps: {
            joinVoiceChannel: (_e: any) => ({
                subscribe: (_p: any) => {},
                destroy: () => {
                    destroyed = true;
                },
            }),
            createAudioResource: (s: any) => s,
            createAudioPlayer: () => player,
            tts: async (text: string) => ({ stream: text, cleanup: () => {} }),
        },
    });
    bus.publish({ topic: 'VOICE/JOIN_REQUESTED', guildId: 'g', voiceChannelId: 'c' });
    const vs = w.get(agent, C.VoiceState);
    t.truthy(vs?.connection);
    bus.publish({ topic: 'VOICE/LEAVE_REQUESTED', guildId: 'g' });
    const vs2 = w.get(agent, C.VoiceState);
    t.is(vs2?.connection, null);
    t.true(destroyed);
});

test('voice system queues tts requests', (t) => {
    const player = makePlayer();
    const { w, agent, C } = createAgentWorld(player);
    const bus = makeBus();
    VoiceSystem(w, agent, C, {
        bus,
        deps: {
            joinVoiceChannel: (_e: any) => ({}),
            createAudioResource: (s: any) => s,
            createAudioPlayer: () => player,
            tts: async (text: string) => ({ stream: text, cleanup: () => {} }),
        },
    });
    // set connection so tts can proceed
    w.set(agent, C.VoiceState, { connection: {} });
    bus.publish({ topic: 'VOICE/TTS_REQUESTED', message: 'hello', guildId: 'g' });
    const pq = w.get(agent, C.PlaybackQ)!;
    t.is(pq.items.length, 1);
});
