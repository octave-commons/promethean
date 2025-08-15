import type { AgentBus } from "../bus";
import type { LlmRequest } from "../../contracts/agent-bus";

export function OrchestratorSystem(
  w: any,
  bus: AgentBus,
  C: any,
  getContext: (
    text: string,
  ) => Promise<
    Array<{ role: "user" | "assistant" | "system"; content: string }>
  >,
  systemPrompt: () => string,
) {
  const { Turn, TranscriptFinal, VisionRing, VisionFrame } = C;

  const q = w.makeQuery({
    changed: [TranscriptFinal],
    all: [Turn, TranscriptFinal, VisionRing],
  });

  return async function run() {
    for (const [agent, get] of w.iter(q)) {
      const tf = get(TranscriptFinal);
      console.log("something?", tf);
      if (!tf.text) continue;
      const turnId = get(Turn).id;
      const ring = get(VisionRing);
      const frames = ring.frames
        .slice(-4)
        .map((eid: number) => w.get(eid, VisionFrame)!.ref);
      const context = await getContext(tf.text);
      const msg: LlmRequest = {
        topic: "agent.llm.request",
        corrId: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`,
        turnId,
        ts: Date.now(),
        prompt: systemPrompt(),
        context,
        images: frames,
      };
      bus.publish(msg);
      tf.text = "";
      w.set(agent, TranscriptFinal, tf);
    }
  };
}
