import type { World, Entity } from '../../ds/ecs';
import type { defineAgentComponents } from '../components';

// If the user keeps speaking for at least this long while we're paused,
// escalate to a hard stop of the current utterance.
const STOP_AFTER_MS = 1000; // tune: 700–1200ms feels natural

type BargeState = { speakingSince: number | null; paused: boolean };

export function SpeechArbiterSystem(
  w: World,
  C: ReturnType<typeof import('../components').defineAgentComponents>,
) {
  const { Turn, PlaybackQ, AudioRef, Utterance, AudioRes, VAD, Policy } = C as ReturnType<
    typeof defineAgentComponents
  >;

  const qAgent = w.makeQuery({ all: [Turn, PlaybackQ, AudioRef, Policy] });
  const qVAD = w.makeQuery({ all: [VAD] });

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
      const queue = get(PlaybackQ) ?? { items: [] as number[] };
      const original = queue.items as number[];
      const player = get(AudioRef)?.player ?? {
        play() {},
        stop() {},
        pause() {},
        unpause() {},
        isPlaying: () => false,
      };
      const policy = get(Policy) ?? { defaultBargeIn: 'pause' as const };
      const bs = getState(agent);

      // purge stale/cancelled (treat prev buffer values as immutable)
      const filteredItems = original.filter((uEid: Entity) => {
        const u = w.get(uEid, Utterance);
        return u && (u.status === 'queued' || u.status === 'playing');
      });
      let items = filteredItems;
      const sameLength = items.length === original.length;
      const sameOrder = sameLength && items.every((v, i) => v === original[i]);
      let queueChanged = !(sameLength && sameOrder);

      // if currently playing, enforce barge-in with pause→stop escalation
      // Note: since we dequeue the picked item, the playing utterance
      // may no longer be present in items; if you want barge-in, track
      // now-playing separately (future improvement).
      const current = undefined as unknown as Entity | undefined;

      if (current !== undefined && current !== null) {
        const u = w.get(current, Utterance)!;
        const active = userSpeaking();
        const bi = u.bargeIn ?? policy.defaultBargeIn; // "pause" | "stop" | "duck" | "none"

        const hardStop = () => {
          const cancelled: typeof u = { ...u, status: 'cancelled' };
          w.set(current, Utterance, cancelled);
          try {
            player.stop(true);
          } catch {}
          bs.speakingSince = null;
          bs.paused = false;
        };

        if (active) {
          const now = Date.now();
          if (bi === 'stop') {
            hardStop();
          } else if (bi === 'pause') {
            // pause immediately, then escalate to stop if speech continues
            if (!bs.paused) {
              try {
                player.pause(true);
              } catch {}
              bs.paused = true;
              bs.speakingSince = now;
            } else if (bs.speakingSince != null && now - bs.speakingSince >= STOP_AFTER_MS) {
              hardStop();
            }
          }
          // NOTE: "duck" should be handled by external mixer (set volume),
          // and "none" means ignore speech while playing.
        } else {
          // no user speech; resume if we were paused
          if (bi === 'pause' && bs.paused) {
            try {
              player.unpause();
            } catch {}
            bs.paused = false;
          }
          bs.speakingSince = null;
        }

        state.set(agent, bs);
        // persist the filtered queue for next frame
        w.set(agent, PlaybackQ, { items });
        continue; // don't pick a new item while we're dealing with current
      }

      // no current item: clear paused state and pick next if any
      if (bs.paused || bs.speakingSince != null) {
        bs.paused = false;
        bs.speakingSince = null;
        state.set(agent, bs);
      }

      if (items.length) {
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

          // kick off resource creation in background; don't block the tick
          Promise.resolve()
            .then(() => w.get(picked, AudioRes)!.factory())
            .then((res) => {
              if (!res) return;
              const latest = w.get(picked, Utterance);
              if (!latest || latest.token !== token) return;
              try {
                player.play(res);
              } catch {}
            })
            .catch(() => {});

          const nowPlaying: typeof utt = { ...utt, status: 'playing' };
          w.set(picked, Utterance, nowPlaying);

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
