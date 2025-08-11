import type { World, Entity } from "../../prom-lib/ds/ecs";
import { defineAgentComponents } from "../components";

export function enqueueUtterance(
  w: World,
  agent: Entity,
  opts: {
    id?: string;
    priority?: number;
    group?: string;
    bargeIn?: "none" | "duck" | "pause" | "stop";
    factory: () => Promise<any>;
  },
) {
  const { Turn, PlaybackQ, Utterance, AudioRes, Policy } =
    defineAgentComponents(w);
  const turnId = w.get(agent, Turn)!.id;
  const pq = w.get(agent, PlaybackQ)!;
  const defaultBarge = w.get(agent, Policy)!.defaultBargeIn;

  if (opts.group) {
    for (const uEid of pq.items) {
      const u = w.get(uEid, Utterance)!;
      if (
        u.group === opts.group &&
        u.status === "queued" &&
        u.priority <= (opts.priority ?? 1)
      ) {
        u.status = "cancelled";
        w.set(uEid, Utterance, u);
      }
    }
  }

  const cmd = w.beginTick();
  const e = cmd.createEntity();
  const utt = {
    id: opts.id ?? globalThis.crypto?.randomUUID?.() ?? String(Math.random()),
    turnId,
    priority: opts.priority ?? 1,
    bargeIn: opts.bargeIn ?? defaultBarge,
    status: "queued" as const,
    token: Math.floor(Math.random() * 1e9),
  } as {
    id: string;
    turnId: number;
    priority: number;
    group?: string;
    bargeIn: "none" | "duck" | "pause" | "stop";
    status: "queued";
    token: number;
  };
  if (opts.group !== undefined) utt.group = opts.group;
  cmd.add(e, Utterance, utt);
  cmd.add(e, AudioRes, { factory: opts.factory });
  cmd.flush();
  w.endTick();

  pq.items.push(e);
}
