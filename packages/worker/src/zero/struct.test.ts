// SPDX-License-Identifier: GPL-3.0-only
// @ts-nocheck
import test from 'ava';
import { S, compileStruct } from './struct';
import type { Infer } from './struct';

const Position = S.struct({ x: S.f32(), y: S.f32() });
type Position = Infer<typeof Position>;

const Bullet = S.struct({ pos: Position, vel: Position, life: S.f32() });
const B = compileStruct(Bullet);

test('struct: write/read nested structs', (t) => {
    const buf = new ArrayBuffer(B.size);
    const view = new DataView(buf);
    const obj = { pos: { x: 1, y: 2 }, vel: { x: 0, y: 0 }, life: 3 };
    B.write(view, obj);
    t.deepEqual(B.read(view), obj);
});

test('struct: flattenColumns and offsets', (t) => {
    t.deepEqual(B.flattenColumns(), {
        pos_x: 'f32',
        pos_y: 'f32',
        vel_x: 'f32',
        vel_y: 'f32',
        life: 'f32',
    });
    t.deepEqual(
        B.fields.map((f) => ({ path: f.path, offset: f.offset })),
        [
            { path: 'pos.x', offset: 0 },
            { path: 'pos.y', offset: 4 },
            { path: 'vel.x', offset: 8 },
            { path: 'vel.y', offset: 12 },
            { path: 'life', offset: 16 },
        ],
    );
});

test('struct: arrays', (t) => {
    const Pair = S.struct({ values: S.array(S.u16(), 2) });
    const P = compileStruct(Pair);
    const buf = new ArrayBuffer(P.size);
    const view = new DataView(buf);
    const obj = { values: [1, 2] };
    P.write(view, obj);
    t.deepEqual(P.read(view), obj);
    t.deepEqual(P.flattenColumns(), {
        values_0: 'u16',
        values_1: 'u16',
    });
});
