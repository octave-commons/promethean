import type { World, Entity } from '@promethean/ds/ecs.js';
import type { defineAgentComponents } from '../components';

// If the user keeps speaking for at least this long while we're paused,
// escalate to a hard stop of the current utterance.
const STOP_AFTER_MS = 1000; // tune: 700–1200ms feels natural

type BargeState = { speakingSince: number | null; paused: boolean };

export function SpeechArbiterSystem(w: World, C: ReturnType<typeof import('../components').defineAgentComponents>) {
    const { Turn, PlaybackQ, AudioRef, Utterance, AudioRes, VAD, Policy } = C as ReturnType<
        typeof defineAgentComponents
    >;

    const qAgent = w.makeQuery({ all: [Turn, PlaybackQ, AudioRef, Policy] });
    const qVAD = w.makeQuery({ all: [VAD] });
    const qAllUtter = w.makeQuery({ all: [Utterance] });

    // per-agent transient state, no component needed
    const state = new Map<Entity, BargeState>();
    const getState = (agent: Entity): BargeState => {
        let s = state.get(agent);
        if (!s) {
            s = { speakingSince: null, paused: false };
            state.set(agent, s);
        }
        return s;
    };

    function userSpeaking(): boolean {
        for (const [, get] of w.iter(qVAD)) if (get(VAD)?.active) return true;
        return false;
    }

    return async function run(_dt: number) {
        for (const [agent, get] of w.iter(qAgent)) {
            const turnId = get(Turn)?.id ?? 0;
            const queue = get(PlaybackQ);
            const original = queue.items as number[];
            const player = get(AudioRef)?.player;
            const policy = get(Policy) ?? { defaultBargeIn: 'pause' as const };
            const bs = getState(agent);

            // purge stale/cancelled (treat prev buffer values as immutable)
            const filteredItems = original.filter((uEid: Entity) => {
                const u = w.get(uEid, Utterance);
                return u && (u.status === 'queued' || u.status === 'playing');
            });
            let items = filteredItems;
            // Fallback: include any queued utterances not yet reflected in PlaybackQ
            for (const [uEid] of w.iter(qAllUtter)) {
                if (items.includes(uEid)) continue;
                const u = w.get(uEid, Utterance);
                if (!u) continue;
                if (u.status === 'queued' && u.turnId >= turnId) items.push(uEid);
            }
            const sameLength = items.length === original.length;
            const sameOrder = sameLength && items.every((v, i) => v === original[i]);
            let queueChanged = !(sameLength && sameOrder);

            // no current item: clear paused state and pick next if any
            if (bs.paused || bs.speakingSince != null) {
                bs.paused = false;
                bs.speakingSince = null;
                state.set(agent, bs);
            }

            if (items.length) {
                console.log('speech arbiters system running', {
                    turnId,
                    queue,
                    original,
                    player,
                    policy,
                    bs,
                    filteredItems,
                    sameLength,
                    sameOrder,
                    queueChanged,
                });
                items = [...items].sort((a: Entity, b: Entity) => {
                    const ub = w.get(b, Utterance);
                    const ua = w.get(a, Utterance);
                    return (ub?.priority ?? 0) - (ua?.priority ?? 0);
                });
                let pickedIdx = -1,
                    picked: Entity | null = null;
                for (let i = 0; i < items.length; i++) {
                    const uEid = items[i];
                    const u = w.get(uEid, Utterance);
                    if (!u || u.status !== 'queued') continue;

                    pickedIdx = i;
                    picked = uEid;
                    break;
                }
                if (picked != null) {
                    // dequeue immutably
                    if (pickedIdx >= 0) {
                        items = items.filter((_: Entity, i: number) => i !== pickedIdx);
                        queueChanged = true;
                    }
                    const utt = w.get(picked, Utterance)!;
                    const token = utt.token;

                    // Mark as playing immediately to prevent re-pick next ticks
                    const nowPlaying: typeof utt = { ...utt, status: 'playing' };
                    w.set(picked, Utterance, nowPlaying);

                    // kick off resource creation in background; don't block the tick
                    Promise.resolve()
                        .then(() => w.get(picked, AudioRes)!.factory())
                        .then((res) => {
                            if (!res) return;
                            const latest = w.get(picked, Utterance);
                            // only proceed if this is still the same utterance and in playing state
                            if (!latest || latest.token !== token || latest.status !== 'playing') return;
                            try {
                                player.play(res);
                            } catch {}
                        })
                        .catch(() => {});

                    // reset barge transient state at start of playback
                    bs.paused = false;
                    bs.speakingSince = null;
                    state.set(agent, bs);

                    console.log('[arbiter] playing:', w.get(picked, Utterance)!.id);
                }
            }

            // write back only if queue actually changed; avoid clobbering
            // other writers (e.g., enqueueUtterance) in the same tick.
            if (queueChanged) w.set(agent, PlaybackQ, { items });
        }
    };
}
