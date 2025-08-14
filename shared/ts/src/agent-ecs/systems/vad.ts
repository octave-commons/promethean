import type { World } from "../../ds/ecs";
import { defineAgentComponents } from "../components";

export function VADUpdateSystem(w: World) {
  const { RawVAD, VAD } = defineAgentComponents(w);
  const q = w.makeQuery({ all: [RawVAD, VAD] });

  return function run(_dt: number) {
    for (const [e, get] of w.iter(q)) {
      const raw = get(RawVAD);
      const vad = get(VAD);
      const now = Date.now();

      const rawActive = raw.level >= vad.threshold;
      if (rawActive) {
        if (!vad.active && now - vad.lastFalseAt >= vad.attackMs)
          vad.active = true;
        vad.lastTrueAt = now;
      } else {
        if (vad.active && now - vad.lastTrueAt >= vad.releaseMs)
          vad.active = false;
        vad.lastFalseAt = now;
      }
      if (vad.active && now - vad.lastTrueAt > vad.hangMs) {
        vad.active = false;
        vad.lastFalseAt = now;
      }

      w.set(e, VAD, vad);
    }
  };
}
