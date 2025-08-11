import { World } from "../prom-lib/ds/ecs";
import { defineAgentComponents } from "./components";
import { VADUpdateSystem } from "./systems/vad";
import { TurnDetectionSystem } from "./systems/turn";
import { SpeechArbiterSystem } from "./systems/speechArbiter";

export function createAgentWorld(audioPlayer: any) {
  const w = new World();
  const C = defineAgentComponents(w);

  // create agent entity
  const cmd = w.beginTick();
  const agent = cmd.createEntity();
  cmd.add(agent, C.Turn);
  cmd.add(agent, C.PlaybackQ);
  cmd.add(agent, C.Policy, { defaultBargeIn: "pause" as const });
  cmd.add(agent, C.AudioRef, { player: audioPlayer });
  cmd.add(agent, C.RawVAD);
  cmd.add(agent, C.VAD);
  cmd.add(agent, C.TranscriptFinal);
  cmd.add(agent, C.VisionRing);
  cmd.flush();
  w.endTick();

  const systems: Array<(dtMs: number) => void | Promise<void>> = [
    VADUpdateSystem(w),
    TurnDetectionSystem(w),
    SpeechArbiterSystem(w),
  ];

  function tick(dtMs = 50) {
    for (const s of systems) s(dtMs);
  }

  function addSystem(s: (dtMs: number) => void | Promise<void>) {
    systems.push(s);
  }

  return { w, agent, C, tick, addSystem };
}
