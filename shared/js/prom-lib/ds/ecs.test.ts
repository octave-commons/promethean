import { World } from "./ecs";

describe("ecs", () => {
  test("creates entity and iterates components", () => {
    const world = new World();
    const Pos = world.defineComponent<{ x: number; y: number }>({
      name: "Position",
    });
    const Vel = world.defineComponent<{ x: number; y: number }>({
      name: "Velocity",
    });
    const e = world.createEntity();
    world.addComponent(e, Pos, { x: 1, y: 2 });
    world.addComponent(e, Vel, { x: 3, y: 4 });
    const q = world.makeQuery({ all: [Pos, Vel] });
    const res = [...world.iter(q, Pos, Vel)];
    expect(res).toHaveLength(1);
    const [ent, , pos, vel] = res[0];
    expect(ent).toBe(e);
    expect(pos).toEqual({ x: 1, y: 2 });
    expect(vel).toEqual({ x: 3, y: 4 });
  });
});
