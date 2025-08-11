import type { World } from "../../prom-lib/ds/ecs";
import { defineAgentComponents } from "../components";

export function TurnDetectionSystem(w: World) {
  const { Turn, VAD, TranscriptFinal } = defineAgentComponents(w);
  const qVad = w.makeQuery({ all: [Turn, VAD] });
  const qFinal = w.makeQuery({
    changed: [TranscriptFinal],
    all: [Turn, TranscriptFinal],
  });

  return function run(_dt: number) {
    for (const [e, get] of w.iter(qVad)) {
      const turn = get(Turn);
      const vad = get(VAD);
      const prev = !!vad._prevActive;
      if (!prev && vad.active) {
        turn.id++;
        w.set(e, Turn, turn);
      }
      vad._prevActive = vad.active;
      w.set(e, VAD, vad);
    }

    for (const [e, get] of w.iter(qFinal)) {
      const turn = get(Turn);
      turn.id++;
      w.set(e, Turn, turn);
    }
  };
}
