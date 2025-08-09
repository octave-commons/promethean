import type { Patch } from "../../shared/js/prom-lib/ds/ecs.patches";

self.onmessage = (ev: MessageEvent) => {
  const input = ev.data as any;
  const POS = input.extra.POS as number;
  const VEL = input.extra.VEL as number;
  const pos = input.cols[POS] as { x: number; y: number }[];
  const vel = input.cols[VEL] as { x: number; y: number }[];
  const patches: Patch[] = [];
  for (let i = 0; i < input.eids.length; i++) {
    const p = pos[i],
      v = vel[i];
    if (!p || !v) continue;
    patches.push({
      kind: "set",
      eid: input.eids[i],
      cid: POS,
      value: { x: p.x + v.x * input.dt, y: p.y + v.y * input.dt },
    });
  }
  (self as any).postMessage(patches);
};
