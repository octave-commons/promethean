// @ts-nocheck
import { S, compileStruct } from "./struct";
import type { Infer } from "./struct";

describe("typed struct compiler", () => {
  const Position = S.struct({ x: S.f32(), y: S.f32() });
  type Position = Infer<typeof Position>;

  const Bullet = S.struct({ pos: Position, vel: Position, life: S.f32() });
  const B = compileStruct(Bullet);

  test("write/read nested structs", () => {
    const buf = new ArrayBuffer(B.size);
    const view = new DataView(buf);
    const obj = { pos: { x: 1, y: 2 }, vel: { x: 0, y: 0 }, life: 3 };
    B.write(view, obj);
    expect(B.read(view)).toEqual(obj);
  });

  test("flattenColumns and offsets", () => {
    expect(B.flattenColumns()).toEqual({
      pos_x: "f32",
      pos_y: "f32",
      vel_x: "f32",
      vel_y: "f32",
      life: "f32",
    });
    expect(B.fields.map((f) => ({ path: f.path, offset: f.offset }))).toEqual([
      { path: "pos.x", offset: 0 },
      { path: "pos.y", offset: 4 },
      { path: "vel.x", offset: 8 },
      { path: "vel.y", offset: 12 },
      { path: "life", offset: 16 },
    ]);
  });

  test("arrays", () => {
    const Pair = S.struct({ values: S.array(S.u16(), 2) });
    const P = compileStruct(Pair);
    const buf = new ArrayBuffer(P.size);
    const view = new DataView(buf);
    const obj = { values: [1, 2] };
    P.write(view, obj);
    expect(P.read(view)).toEqual(obj);
    expect(P.flattenColumns()).toEqual({
      values_0: "u16",
      values_1: "u16",
    });
  });
});
