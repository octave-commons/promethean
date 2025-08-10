import type { World, Entity } from "../../prom-lib/ds/ecs";
import { defineAgentComponents } from "../components";

export function SpeechArbiterSystem(w: World) {
  const { Turn, PlaybackQ, AudioRef, Utterance, AudioRes, VAD, Policy } =
    defineAgentComponents(w);
  const qAgent = w.makeQuery({ all: [Turn, PlaybackQ, AudioRef, Policy] });
  const qVAD = w.makeQuery({ all: [VAD] });

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

      // purge stale/cancelled
      queue.items = queue.items.filter((uEid: Entity) => {
        const u = w.get(uEid, Utterance);
        return (
          u &&
          u.turnId >= turnId &&
          (u.status === "queued" || u.status === "playing")
        );
      });

      // if currently playing, enforce barge-in
      const current = queue.items.find(
        (uEid) => w.get(uEid, Utterance)?.status === "playing",
      );
      if (current) {
        const u = w.get(current, Utterance)!;
        const active = userSpeaking();
        const bi = u.bargeIn ?? policy.defaultBargeIn;
        if (active) {
          if (bi === "pause") player.pause(true);
          else if (bi === "stop") {
            u.status = "cancelled";
            w.set(current, Utterance, u);
            try {
              player.stop(true);
            } catch {}
          } // duck handled externally if you implement a mixer
        } else {
          if (bi === "pause") player.unpause();
        }
        continue;
      }

      if (!player.isPlaying() && queue.items.length) {
        queue.items.sort(
          (a, b) =>
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
          player.play(res);
        }
      }
    }
  };
}
