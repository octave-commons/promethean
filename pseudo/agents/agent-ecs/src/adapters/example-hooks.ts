import type { AgentWorld } from '../types.js';
import { enqueueUtterance } from '../helpers/enqueueUtterance.js';

type AdapterDeps = {
    readonly tts: { synth: (text: string) => Promise<unknown> };
};

type AdapterHooks = {
    readonly onRawLevel: (level: number) => void;
    readonly onFinalTranscript: (text: string) => void;
    readonly speak: (text: string) => void;
};

export function wireAdapters(world: AgentWorld, deps: AdapterDeps): AdapterHooks {
    const { w, agent, C } = world;

    return {
        onRawLevel(level: number) {
            const rv0 = w.get(agent, C.RawVAD) ?? { level: 0, ts: 0 };
            w.set(agent, C.RawVAD, { ...rv0, level, ts: Date.now() });
        },
        onFinalTranscript(text: string) {
            const tf0 = w.get(agent, C.TranscriptFinal) ?? { text: '', ts: 0 };
            w.set(agent, C.TranscriptFinal, { ...tf0, text, ts: Date.now() });
        },
        speak(text: string) {
            enqueueUtterance(w, agent, C, {
                group: 'agent-speech',
                priority: 1,
                bargeIn: 'pause',
                factory: async () => deps.tts.synth(text),
            });
        },
    };
}
