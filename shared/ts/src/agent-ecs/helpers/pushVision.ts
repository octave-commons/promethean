import type { World, Entity } from "../../ds/ecs";
import { defineAgentComponents } from "../components";

export function pushVisionFrame(
  w: World,
  agent: Entity,
  ref: {
    type: "url" | "blob" | "attachment";
    url?: string;
    data?: string;
    id?: string;
    mime?: string;
  },
) {
  const { VisionFrame, VisionRing } = defineAgentComponents(w);
  const cmd = w.beginTick();
  const e = cmd.createEntity();
  const id =
    globalThis.crypto?.randomUUID?.() ?? `${Date.now()}.${Math.random()}`;
  cmd.add(e, VisionFrame, { id, ts: Date.now(), ref });
  cmd.flush();
  w.endTick();

  const ring = w.get(agent, VisionRing)!;
  ring.frames.push(e);
  if (ring.frames.length > ring.capacity) {
    ring.frames.splice(0, ring.frames.length - ring.capacity);
  }
  w.set(agent, VisionRing, ring);
}
