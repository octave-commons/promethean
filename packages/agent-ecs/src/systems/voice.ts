// loose typing to avoid cross-package type coupling
import type { defineAgentComponents } from '../components.js';
import { enqueueUtterance } from '../helpers/enqueueUtterance.js';

type Deps = {
    joinVoiceChannel: (opts: any) => any;
    createAudioResource: (stream: any) => any;
    createAudioPlayer: () => any;
    tts: (text: string) => Promise<{ stream: any; cleanup: () => void }>;
};

type Bus = {
    subscribe: (topic: string, handler: (e: any) => void) => void;
    publish: (msg: any) => void;
};

type VoiceSystemOptions = {
    bus: Bus;
    deps: Deps;
};

export function VoiceSystem(
    w: any,
    agent: any,
    C: ReturnType<typeof defineAgentComponents>,
    { bus, deps }: VoiceSystemOptions,
) {
    const { VoiceState, AudioRef } = C;

    bus.subscribe('VOICE/JOIN_REQUESTED', async (e: any) => {
        const current = w.get(agent, VoiceState);
        if (current?.connection) return;
        const connection = deps.joinVoiceChannel(e);
        const player = w.get(agent, AudioRef)?.player;
        try {
            connection.subscribe(player);
        } catch {}
        w.set(agent, VoiceState, { connection });
        bus.publish({ topic: 'VOICE/JOINED', guildId: e.guildId, voiceChannelId: e.voiceChannelId });
    });

    bus.subscribe('VOICE/LEAVE_REQUESTED', async (e: any) => {
        const state = w.get(agent, VoiceState);
        try {
            state?.connection?.destroy?.();
        } catch {}
        w.set(agent, VoiceState, { connection: null });
        bus.publish({ topic: 'VOICE/LEFT', guildId: e.guildId });
    });

    bus.subscribe('VOICE/TTS_REQUESTED', async (e: any) => {
        const state = w.get(agent, VoiceState);
        if (!state?.connection) return;
        enqueueUtterance(w, agent, C, {
            id: `${Date.now()}`,
            group: 'agent-speech',
            factory: async () => {
                const { stream } = await deps.tts(e.message);
                const res = deps.createAudioResource(stream);
                // cleanup after playback via player events if needed
                return res;
            },
        });
    });
}
