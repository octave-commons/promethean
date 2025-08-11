import type { World, Entity } from "../../prom-lib/ds/ecs";
import { defineAgentComponents } from "../components";

// If the user keeps speaking for at least this long while we're paused,
// escalate to a hard stop of the current utterance.
const STOP_AFTER_MS = 1000; // tune: 700–1200ms feels natural

type BargeState = { speakingSince: number | null; paused: boolean };

export function SpeechArbiterSystem(w: World) {
  const { Turn, PlaybackQ, AudioRef, Utterance, AudioRes, VAD, Policy } =
    defineAgentComponents(w);

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
    for (const [, get] of w.iter(qVAD)) if (get(VAD).active) return true;
    return false;
  }

  return async function run(_dt: number) {
    for (const [agent, get] of w.iter(qAgent)) {
      const turnId = get(Turn).id;
      const queue = get(PlaybackQ);
      const player = get(AudioRef).player;
      const policy = get(Policy);
      const bs = getState(agent);

      // purge stale/cancelled
      queue.items = queue.items.filter((uEid: Entity) => {
        const u = w.get(uEid, Utterance);
        return (
          u &&
          u.turnId >= turnId &&
          (u.status === "queued" || u.status === "playing")
        );
      });

      // if currently playing, enforce barge-in with pause→stop escalation
      const current = queue.items.find(
        (uEid: Entity) => w.get(uEid, Utterance)?.status === "playing",
      );

      if (current) {
        const u = w.get(current, Utterance)!;
        const active = userSpeaking();
        const bi = u.bargeIn ?? policy.defaultBargeIn; // "pause" | "stop" | "duck" | "none"

        const hardStop = () => {
          u.status = "cancelled";
          w.set(current, Utterance, u);
          try {
            player.stop(true);
          } catch {}
          bs.speakingSince = null;
          bs.paused = false;
        };

        if (active) {
          const now = Date.now();
          if (bi === "stop") {
            hardStop();
          } else if (bi === "pause") {
            // pause immediately, then escalate to stop if speech continues
            if (!bs.paused) {
              try {
                player.pause(true);
              } catch {}
              bs.paused = true;
              bs.speakingSince = now;
            } else if (
              bs.speakingSince != null &&
              now - bs.speakingSince >= STOP_AFTER_MS
            ) {
              hardStop();
            }
          }
          // NOTE: "duck" should be handled by external mixer (set volume),
          // and "none" means ignore speech while playing.
        } else {
          // no user speech; resume if we were paused
          if (bi === "pause" && bs.paused) {
            try {
              player.unpause();
            } catch {}
            bs.paused = false;
          }
          bs.speakingSince = null;
        }

        state.set(agent, bs);
        continue; // don't pick a new item while we're dealing with current
      }

      // no current item: clear paused state and pick next if any
      if (bs.paused || bs.speakingSince != null) {
        bs.paused = false;
        bs.speakingSince = null;
        state.set(agent, bs);
      }

      if (!player.isPlaying() && queue.items.length) {
        queue.items.sort(
          (a: Entity, b: Entity) =>
            w.get(b, Utterance)!.priority - w.get(a, Utterance)!.priority,
        );
        let pickedIdx = -1,
          picked: Entity | null = null;
        for (let i = 0; i < queue.items.length; i++) {
          const uEid = queue.items[i];
          const u = w.get(uEid, Utterance)!;
          if (u.turnId < turnId || u.status !== "queued") continue;
          pickedIdx = i;
          picked = uEid;
          break;
        }
        if (picked != null) {
          if (pickedIdx >= 0) queue.items.splice(pickedIdx, 1);
          const utt = w.get(picked, Utterance)!;
          const res = await w
            .get(picked, AudioRes)!
            .factory()
            .catch(() => null);

          // race cancel guard
          const latest = w.get(picked, Utterance);
          if (!latest || latest.token !== utt.token || !res) continue;

          utt.status = "playing";
          w.set(picked, Utterance, utt);

          // reset barge transient state at start of playback
          bs.paused = false;
          bs.speakingSince = null;
          state.set(agent, bs);

          player.play(res);
        }
      }
    }
  };
}
