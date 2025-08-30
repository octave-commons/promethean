import type { World } from '@promethean/ds/ecs.js';
import type { defineAgentComponents } from '../components';

export function TurnDetectionSystem(w: World, C: ReturnType<typeof import('../components').defineAgentComponents>) {
    const { Turn, VAD, TranscriptFinal } = C as ReturnType<typeof defineAgentComponents>;
    const qVad = w.makeQuery({ all: [Turn, VAD] });
    const qFinal = w.makeQuery({
        changed: [TranscriptFinal],
        all: [Turn, TranscriptFinal],
    });

    // keep previous VAD.active per entity without writing the component
    const prevActive = new Map<number, boolean>();

    return function run(_dt: number) {
        for (const [e, get] of w.iter(qVad)) {
            const turn = get(Turn) ?? { id: 0 };
            const vad0 = get(VAD) ?? {
                active: false,
                lastTrueAt: 0,
                lastFalseAt: 0,
                attackMs: 120,
                releaseMs: 250,
                hangMs: 800,
                threshold: 0.5,
                _prevActive: false,
            };
            const prev = prevActive.get(e) ?? false;
            if (!prev && vad0.active) {
                w.set(e, Turn, { ...turn, id: turn.id + 1 });
            }
            prevActive.set(e, !!vad0.active);
        }

        for (const [e, get] of w.iter(qFinal)) {
            const turn = get(Turn) ?? { id: 0 };
            w.set(e, Turn, { ...turn, id: turn.id + 1 });
        }
    };
}
