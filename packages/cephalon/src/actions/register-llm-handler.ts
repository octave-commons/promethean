import { enqueueUtterance } from "@promethean/agent-ecs/helpers/enqueueUtterance.js";
import type { RegisterLlmHandlerScope } from "./register-llm-handler.scope.js";

export default function run(scope: RegisterLlmHandlerScope) {
  scope.bus.subscribe("agent.llm.result", (res: any) => {
    const world = scope.getAgentWorld();
    const session = scope.getVoiceSession();
    if (!world || !session) return;
    const { w, agent, C } = world;
    const text = res?.text ?? res?.reply ?? "";
    if (!text) return;
    enqueueUtterance(w, agent, C, {
      id: res.corrId ?? res.taskId ?? `${Date.now()}`,
      group: "agent-speech",
      priority: 1,
      bargeIn: "pause",
      factory: async () => session.makeResourceFromText(text),
    });
  });
}
