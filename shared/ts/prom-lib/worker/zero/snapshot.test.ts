import { buildSnapshot, commitSnapshot } from "./snapshot";
import { markChanged } from "./layout";
import type { World, ComponentType } from "../../ds/ecs";

describe("snapshot build/commit", () => {
  class MockWorld implements World {
    comps = new Map<number, Map<number, any>>();
    makeQuery(spec: any) {
      return spec;
    }
    *iter(_query: any) {
      for (const eid of this.comps.keys()) yield [eid] as [number];
    }
    get(eid: number, type: ComponentType<any>) {
      return this.comps.get(eid)?.get(type.id);
    }
    set(eid: number, type: ComponentType<any>, value: any) {
      let m = this.comps.get(eid);
      if (!m) {
        m = new Map();
        this.comps.set(eid, m);
      }
      m.set(type.id, value);
    }
    isAlive(eid: number) {
      return this.comps.has(eid);
    }
  }

  const Pos: ComponentType<{ x: number; y: number }> = { id: 1 };
  const Vel: ComponentType<{ x: number; y: number }> = { id: 2 };

  const world = new MockWorld();
  world.set(1, Pos, { x: 0, y: 0 });
  world.set(1, Vel, { x: 1, y: 2 });

  const spec = {
    layouts: [
      { cid: Pos.id, fields: { x: "f32", y: "f32" } as const },
      { cid: Vel.id, fields: { x: "f32", y: "f32" } as const },
    ],
    types: { [Pos.id]: Pos, [Vel.id]: Vel },
  };

  test("build and commit snapshot", () => {
    const q = world.makeQuery({ all: [Pos, Vel] });
    const { snap } = buildSnapshot(world, spec, q);
    expect(snap.rows).toBe(1);
    expect(snap.eids[0]).toBe(1);
    const px = snap.comps[Pos.id].fields["x"] as Float32Array;
    expect(px[0]).toBe(0);
    // simulate worker mutation
    px[0] = 5;
    markChanged(snap.comps[Pos.id].changed, 0);
    commitSnapshot(world, spec, snap);
    const pos = world.get(1, Pos);
    expect(pos.x).toBe(5);
  });
});
