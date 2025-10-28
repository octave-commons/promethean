import { promises as fs } from 'fs';
import * as path from 'path';
import { tmpdir } from 'os';

import test from 'ava';

import { streamTreeConcurrent } from '../streamTreeGeneratorsConcurrent.js';

test('streamTreeConcurrent traverses directory and ends', async (t) => {
    const dir = await fs.mkdtemp(path.join(tmpdir(), 'stream-tree-'));
    try {
        const file = path.join(dir, 'a.txt');
        await fs.writeFile(file, 'data');

        const events: string[] = [];
        for await (const ev of streamTreeConcurrent(dir)) {
            events.push(ev.type);
        }

        t.deepEqual(events, ['enter', 'exit', 'node']);
    } finally {
        await fs.rm(dir, { recursive: true, force: true });
    }
});
