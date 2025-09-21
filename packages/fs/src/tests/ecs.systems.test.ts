import test from 'ava';
import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import * as path from 'path';

import { World } from '@promethean/ds/ecs.js';

import { defineFsComponents, DirectorySnapshotSystem, WriteBufferSystem } from '../ecs/index.js';
import type { WriteBufferState } from '../ecs/index.js';

async function runSystems(world: any, systems: Array<(dt: number) => void | Promise<void>>) {
    const cmd = world.beginTick();
    for (const system of systems) await system(0);
    cmd.flush();
    world.endTick();
}

test('DirectorySnapshotSystem captures content changes', async (t) => {
    const dir = await fs.mkdtemp(path.join(tmpdir(), 'fs-ecs-'));
    const world = new World();
    const C = defineFsComponents(world);

    const cmd = world.beginTick();
    const entity = cmd.createEntity();
    cmd.add(entity, C.DirectoryIntent, {
        path: dir,
        capture: { contents: true, suffixes: ['.txt'] },
    });
    cmd.flush();
    world.endTick();

    const snapshotSystem = DirectorySnapshotSystem(world, C);

    await runSystems(world, [snapshotSystem]);

    let snapshot = world.get(entity, C.DirectorySnapshot);
    t.truthy(snapshot);
    t.is(snapshot?.version, 1);
    t.deepEqual(snapshot?.files, {});

    await fs.writeFile(path.join(dir, 'note.txt'), 'hello world', 'utf8');
    await runSystems(world, [snapshotSystem]);
    snapshot = world.get(entity, C.DirectorySnapshot);
    t.is(snapshot?.version, 2);
    t.is(snapshot?.files['note.txt'], 'hello world');

    await fs.writeFile(path.join(dir, 'note.txt'), 'changed', 'utf8');
    await runSystems(world, [snapshotSystem]);
    snapshot = world.get(entity, C.DirectorySnapshot);
    t.is(snapshot?.version, 3);
    t.is(snapshot?.files['note.txt'], 'changed');

    await fs.rm(path.join(dir, 'note.txt'));
    await runSystems(world, [snapshotSystem]);
    snapshot = world.get(entity, C.DirectorySnapshot);
    t.is(snapshot?.version, 4);
    t.false(Object.prototype.hasOwnProperty.call(snapshot?.files ?? {}, 'note.txt'));
});

test('WriteBufferSystem flushes staged operations', async (t) => {
    const dir = await fs.mkdtemp(path.join(tmpdir(), 'fs-ecs-'));
    const world = new World();
    const C = defineFsComponents(world);

    const cmd = world.beginTick();
    const entity = cmd.createEntity();
    cmd.add(entity, C.WriteBuffer, { ensure: [], writes: [], deletes: [] });
    cmd.flush();
    world.endTick();

    const writeSystem = WriteBufferSystem(world, C);

    const stage = (partial: Partial<WriteBufferState>) => {
        const current = world.get(entity, C.WriteBuffer) ?? {
            ensure: [],
            writes: [],
            deletes: [],
            lastFlush: undefined,
        };
        world.set(entity, C.WriteBuffer, {
            ensure: partial.ensure ?? current.ensure,
            writes: partial.writes ?? current.writes,
            deletes: partial.deletes ?? current.deletes,
            lastFlush: current.lastFlush,
        });
    };

    stage({
        ensure: [dir],
        writes: [{ path: path.join(dir, 'hello.txt'), data: 'hello', encoding: 'utf8' }],
        deletes: [],
    });
    await runSystems(world, [writeSystem]);
    let buffer = world.get(entity, C.WriteBuffer);
    t.truthy(buffer?.lastFlush);
    t.is(buffer?.lastFlush?.wrote, 1);
    t.is(buffer?.lastFlush?.ensured, 1);
    t.is(buffer?.writes.length, 0);
    t.is(await fs.readFile(path.join(dir, 'hello.txt'), 'utf8'), 'hello');

    stage({
        ensure: [],
        writes: [],
        deletes: [{ path: path.join(dir, 'hello.txt'), recursive: false }],
    });
    await runSystems(world, [writeSystem]);
    buffer = world.get(entity, C.WriteBuffer);
    t.is(buffer?.lastFlush?.deleted, 1);
    await t.throwsAsync(() => fs.access(path.join(dir, 'hello.txt')));
});
