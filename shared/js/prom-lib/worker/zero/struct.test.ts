import { S, compileStruct, Infer } from "./struct";

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

  test("flattenColumns", () => {
    expect(B.flattenColumns()).toEqual([
      { path: "pos.x", offset: 0, type: "f32" },
      { path: "pos.y", offset: 4, type: "f32" },
      { path: "vel.x", offset: 8, type: "f32" },
      { path: "vel.y", offset: 12, type: "f32" },
      { path: "life", offset: 16, type: "f32" },
    ]);
  });

  test("arrays", () => {
    const Pair = S.struct({ values: S.array(2, S.u16()) });
    const P = compileStruct(Pair);
    const buf = new ArrayBuffer(P.size);
    const view = new DataView(buf);
    const obj = { values: [1, 2] };
    P.write(view, obj);
    expect(P.read(view)).toEqual(obj);
    expect(P.flattenColumns()).toEqual([
      { path: "values.0", offset: 0, type: "u16" },
      { path: "values.1", offset: 2, type: "u16" },
    ]);
  });
});
