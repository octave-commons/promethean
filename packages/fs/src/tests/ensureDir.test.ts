import { promises as fs } from 'fs';
import * as path from 'path';
import { tmpdir } from 'os';

import test from 'ava';

import { ensureDir } from '../ensureDir.js';

test('ensureDir creates directory', async (t) => {
    const dir = path.join(tmpdir(), 'ensure-dir-test', Date.now().toString());
    await ensureDir(dir);
    const stat = await fs.stat(dir);
    t.true(stat.isDirectory());
});
