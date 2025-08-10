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
  cmd.add(agent, C.Policy, { defaultBargeIn: "pause" });
  cmd.add(agent, C.AudioRef, { player: audioPlayer });
  cmd.flush();
  w.endTick();

  const systems = [
    VADUpdateSystem(w),
    TurnDetectionSystem(w),
    SpeechArbiterSystem(w),
    // TODO: add ContextAssembler, LLMRequest, TTSRequest, PlaybackLifecycle
  ];

  function tick(dtMs = 50) {
    systems.forEach((s) => s(dtMs));
  }

  return { w, agent, C, tick };
}
