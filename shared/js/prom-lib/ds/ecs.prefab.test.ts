import { World } from "./ecs";
import { makeBlueprint, spawn } from "./ecs.prefab";

describe("prefab", () => {
  test("spawns entities from blueprint with overrides", () => {
    const world = new World();
    const Pos = world.defineComponent<{ x: number }>({ name: "Pos" });
    const Vel = world.defineComponent<{ v: number }>({ name: "Vel" });

    const bp = makeBlueprint("Mover", [
      { c: Pos, v: (i: number) => ({ x: i }) },
      { c: Vel, v: { v: 0 } },
    ]);

    const ids = spawn(world, bp, 2, { [Vel.id]: { v: 5 } });
    expect(ids).toHaveLength(2);

    const q = world.makeQuery({ all: [Pos, Vel] });
    const res = [...world.iter(q, Pos, Vel)];
    expect(res).toHaveLength(2);
    res.forEach(([e, , pos, vel], i) => {
      expect(ids).toContain(e);
      expect(pos).toEqual({ x: i });
      expect(vel).toEqual({ v: 5 });
    });
  });
});
