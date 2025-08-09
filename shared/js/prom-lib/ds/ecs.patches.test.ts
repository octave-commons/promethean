import { World } from "./ecs";
import { applyPatches, Patch } from "./ecs.patches";

describe("applyPatches", () => {
  test("applies add/set/remove/destroy", () => {
    const w = new World();
    const Pos = w.defineComponent<{ x: number }>({ name: "Pos" });
    const eid = w.addEntity();

    const patches: Patch[] = [
      { kind: "add", eid, cid: Pos.id, value: { x: 1 } },
      { kind: "set", eid, cid: Pos.id, value: { x: 2 } },
      { kind: "remove", eid, cid: Pos.id },
      { kind: "add", eid, cid: Pos.id, value: { x: 3 } },
      { kind: "destroy", eid },
    ];

    applyPatches(w, patches.slice(0, 2));
    expect(w.get(eid, Pos)).toEqual({ x: 2 });

    applyPatches(w, patches.slice(2, 4));
    expect(w.get(eid, Pos)).toEqual({ x: 3 });

    applyPatches(w, [patches[4]]);
    expect(w.get(eid, Pos)).toBeUndefined();
  });
});
