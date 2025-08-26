import test from 'ava';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import { tmpdir } from 'node:os';
import { listDir, readFile, searchFiles } from '../fs/fileExplorer.js';

async function makeTmpDir(): Promise<string> {
    const dir = await fs.mkdtemp(path.join(tmpdir(), 'fe-'));
    await fs.writeFile(path.join(dir, 'alpha.txt'), 'hello');
    await fs.mkdir(path.join(dir, 'sub'));
    await fs.writeFile(path.join(dir, 'sub', 'beta.txt'), 'world');
    return dir;
}

test('listDir lists directory entries', async (t) => {
    const dir = await makeTmpDir();
    const items = await listDir(dir);
    t.is(items.length, 2);
    t.truthy(items.find((i) => i.name === 'alpha.txt' && i.type === 'file'));
    t.truthy(items.find((i) => i.name === 'sub' && i.type === 'dir'));
});

test('readFile reads file content and protects path traversal', async (t) => {
    const dir = await makeTmpDir();
    const content = await readFile(dir, 'alpha.txt');
    t.is(content, 'hello');
    await t.throwsAsync(() => readFile(dir, '../etc/passwd'));
});

test('searchFiles finds files by fuzzy name', async (t) => {
    const dir = await makeTmpDir();
    const results = await searchFiles(dir, 'alp');
    t.true(results.some((r) => r.relative === 'alpha.txt'));
});
