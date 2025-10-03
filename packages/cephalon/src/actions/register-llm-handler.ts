import { enqueueUtterance } from "@promethean/agent-ecs/helpers/enqueueUtterance.js";

import type { RegisterLlmHandlerScope } from "./register-llm-handler.scope.js";

export default function run(scope: RegisterLlmHandlerScope) {
  scope.bus.subscribe("agent.llm.result", async (res: any) => {
    const world = scope.getAgentWorld();
    const session = scope.getVoiceSession();
    const text = res?.text ?? res?.reply ?? "";
    if (!text) return;

    // 1) Speak it (voice path)
    if (world && session) {
      const { w, agent, C } = world;
      enqueueUtterance(w, agent, C, {
        id: res.corrId ?? res.taskId ?? `${Date.now()}`,
        group: "agent-speech",
        priority: 1,
        bargeIn: "pause",
        factory: async () => session.makeResourceFromText(text),
      });
    }

    // 2) Mirror to ENSO chat if available
    try {
      const enso = scope.getEnsoChat?.();
      if (enso) await enso.sendText('agent', text);
    } catch (e) {
      console.warn('Failed to mirror reply to ENSO', e);
    }

    // 3) Persist agent message for context
    try {
      const ctx = scope.getContext?.();
      const coll = ctx?.getCollection?.('agent_messages');
      await coll?.insert?.({
        text,
        createdAt: Date.now(),
        metadata: { userName: 'Duck', isThought: false, type: 'text' },
      });
    } catch (e) {
      console.warn('Failed to persist agent message', e);
    }
  });
}
