import test from 'ava';
import { mkdtemp, readFile, rm, writeFile } from 'fs/promises';
import * as path from 'path';
import { tmpdir } from 'os';

import { World } from '@promethean/ds';

import {
    initFsEcs,
    type DirectorySnapshotState,
    type DirectoryWriteBufferState,
    type DirectoryWriteOperation,
} from '../ecs.js';

async function withTempDir(run: (dir: string) => Promise<void>) {
    const dir = await mkdtemp(path.join(tmpdir(), 'fs-ecs-'));
    try {
        await run(dir);
    } finally {
        await rm(dir, { recursive: true, force: true });
    }
}

function makeRunner(world: World, system: (dt: number) => Promise<void>) {
    return async () => {
        world.beginTick();
        await system(0);
        world.endTick();
    };
}

test('directory scanner captures contents and updates version on change', async (t) => {
    await withTempDir(async (dir) => {
        const file = path.join(dir, 'a.txt');
        await writeFile(file, 'hello', 'utf8');

        const world = new World();
        const { components, systems } = initFsEcs(world);
        const { DirectoryIntent, DirectorySnapshot, DirectoryWriteBuffer } = components;
        const scan = makeRunner(world, systems.scan);
        const write = makeRunner(world, systems.write);

        const entity = world.createEntity();
        world.addComponent(entity, DirectoryIntent, {
            root: dir,
            mode: 'tree',
            loadContent: { extensions: ['.txt'], encoding: 'utf8' },
        });
        world.addComponent(entity, DirectoryWriteBuffer, { operations: [] });

        await scan();
        const snapshot1 = world.get(entity, DirectorySnapshot) as DirectorySnapshotState;
        t.truthy(snapshot1);
        t.is(snapshot1.version, 1);
        t.is(snapshot1.contents?.['a.txt']?.data, 'hello');

        await scan();
        const snapshot2 = world.get(entity, DirectorySnapshot) as DirectorySnapshotState;
        t.is(snapshot2.version, 1);

        const bufferBefore = world.get(entity, DirectoryWriteBuffer) as DirectoryWriteBufferState;
        const nextOps: DirectoryWriteOperation[] = [
            ...bufferBefore.operations,
            { kind: 'write', relative: 'a.txt', content: 'world', encoding: 'utf8' },
        ];
        world.set(entity, DirectoryWriteBuffer, { ...bufferBefore, operations: nextOps });

        await write();
        t.is(await readFile(file, 'utf8'), 'world');

        await scan();
        const snapshot3 = world.get(entity, DirectorySnapshot) as DirectorySnapshotState;
        t.is(snapshot3.version, 2);
        t.is(snapshot3.contents?.['a.txt']?.data, 'world');
    });
});

test('writer applies mkdir and remove operations', async (t) => {
    await withTempDir(async (dir) => {
        const world = new World();
        const { components, systems } = initFsEcs(world);
        const { DirectoryIntent, DirectoryWriteBuffer } = components;
        const write = makeRunner(world, systems.write);

        const entity = world.createEntity();
        world.addComponent(entity, DirectoryIntent, {
            root: dir,
            mode: 'flat',
        });
        world.addComponent(entity, DirectoryWriteBuffer, { operations: [] });

        const buffer0 = world.get(entity, DirectoryWriteBuffer) as DirectoryWriteBufferState;
        const createOps: DirectoryWriteOperation[] = [
            ...buffer0.operations,
            { kind: 'mkdir', relative: 'nested' },
            { kind: 'write', relative: 'nested/file.txt', content: 'data', encoding: 'utf8' },
        ];
        world.set(entity, DirectoryWriteBuffer, { ...buffer0, operations: createOps });
        await write();

        const created = await readFile(path.join(dir, 'nested/file.txt'), 'utf8').catch(() => null);
        t.is(created, 'data');

        const buffer1 = world.get(entity, DirectoryWriteBuffer) as DirectoryWriteBufferState;
        const removeOps: DirectoryWriteOperation[] = [
            ...buffer1.operations,
            { kind: 'remove', relative: 'nested', recursive: true },
        ];
        world.set(entity, DirectoryWriteBuffer, { ...buffer1, operations: removeOps });
        await write();

        const removed = await readFile(path.join(dir, 'nested/file.txt'), 'utf8').catch(() => null);
        t.is(removed, null);
    });
});
