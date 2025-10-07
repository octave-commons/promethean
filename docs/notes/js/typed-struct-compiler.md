Typed struct compiler for zero-copy data layouts in JS/TS. Produces fixed-size, aligned binary layouts with fast pack/unpack via `DataView`, supports nested structs and fixed arrays, and emits flattened SoA column specs for worker snapshots.

Key features:

- Scalars: f32, f64, i8/u8, i16/u16, i32/u32, bool
- Arrays: fixed-length, any element type
- Structs: nested with proper per-field alignment
- Endianness: configurable (LE default)
- Helpers: `read`, `write`, `flattenColumns()`

Implementation: $[struct.ts|`shared/js/prom-lib/worker/zero/struct.ts`]$.

Usage outline:

```ts
import { S, compileStruct, type Infer } from "./struct";

const Position = S.struct({ x: S.f32(), y: S.f32() });
type Position = Infer<typeof Position>;

const Bullet = S.struct({ pos: Position, vel: Position, life: S.f32() });
const B = compileStruct(Bullet);

const buf = new ArrayBuffer(B.size);
const view = new DataView(buf);
B.write(view, { pos: { x: 1, y: 2 }, vel: { x: 0, y: 0 }, life: 3 });
const obj = B.read(view);
```

Related notes: $[index.md|unique/index]$

#tags: #js #binary #workers #soa
