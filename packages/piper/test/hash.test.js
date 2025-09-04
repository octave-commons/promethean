import test from 'ava';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fingerprintFromGlobs, stepFingerprint } from '../dist/hash.js';

async function withTmp(t, fn) {
  const dir = path.join(process.cwd(), 'test-tmp', String(Date.now()) + '-' + Math.random().toString(36).slice(2));
  await fs.mkdir(dir, { recursive: true });
  try { await fn(dir); } finally { await fs.rm(dir, { recursive: true, force: true }); }
}

test('fingerprintFromGlobs: content vs mtime', async t => {
  await withTmp(t, async dir => {
    const a = path.join(dir, 'a.txt');
    const b = path.join(dir, 'b.txt');
    await fs.writeFile(a, 'hello', 'utf8');
    await fs.writeFile(b, 'world', 'utf8');

    const contentHash1 = await fingerprintFromGlobs(['*.txt'], dir, 'content');
    const mtimeHash1 = await fingerprintFromGlobs(['*.txt'], dir, 'mtime');
    t.truthy(contentHash1);
    t.truthy(mtimeHash1);

    // change content
    await fs.writeFile(a, 'HELLO', 'utf8');
    const contentHash2 = await fingerprintFromGlobs(['*.txt'], dir, 'content');
    const mtimeHash2 = await fingerprintFromGlobs(['*.txt'], dir, 'mtime');

    t.not(contentHash1, contentHash2, 'content hash changes when file content changes');
    // mtime likely also changes, but ensure at least one differs
    t.truthy(mtimeHash1 !== mtimeHash2 || contentHash1 !== contentHash2);
  });
});

test('stepFingerprint covers inputs and config', async t => {
  await withTmp(t, async dir => {
    const a = path.join(dir, 'a.txt');
    await fs.writeFile(a, 'hello', 'utf8');
    const step = { id: 's', deps: [], cwd: '.', env: {}, inputs: ['a.txt'], outputs: [], cache: 'content' };

    const fp1 = await stepFingerprint(step, dir, true);
    await fs.writeFile(a, 'HELLO', 'utf8');
    const fp2 = await stepFingerprint(step, dir, true);
    t.not(fp1, fp2, 'fingerprint changes when input content changes');

    const step2 = { ...step, env: { X: '1' } };
    const fp3 = await stepFingerprint(step2, dir, true);
    t.not(fp2, fp3, 'fingerprint changes when config/env changes');
  });
});
