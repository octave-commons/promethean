import test from 'ava';
import * as fs from 'fs/promises';
import * as path from 'path';
import YAML from 'yaml';
import { runPipeline } from '../dist/runner.js';

async function withTmp(fn) {
  const dir = path.join(process.cwd(), 'test-tmp', String(Date.now()) + '-' + Math.random().toString(36).slice(2));
  await fs.mkdir(dir, { recursive: true });
  try { await fn(dir); } finally { await fs.rm(dir, { recursive: true, force: true }); }
}

test.serial('runPipeline executes steps and caches on second run', async t => {
  await withTmp(async dir => {
    const prevCwd = process.cwd();
    process.chdir(dir);
    try {
      const cfg = {
        pipelines: [
          {
            name: 'demo',
            steps: [
              {
                id: 'make', cwd: '.', deps: [],
                inputs: [], outputs: ['out.txt'], cache: 'content',
                shell: 'echo hello > out.txt'
              },
              {
                id: 'cat', cwd: '.', deps: ['make'],
                inputs: ['out.txt'], outputs: ['out2.txt'], cache: 'content',
                shell: 'cat out.txt > out2.txt'
              }
            ]
          }
        ]
      };
      const pipelinesPath = path.join(dir, 'pipelines.yaml');
      await fs.writeFile(pipelinesPath, YAML.stringify(cfg), 'utf8');

      const res1 = await runPipeline(pipelinesPath, 'demo', { concurrency: 2, reportDir: undefined, contentHash: true });
      t.truthy(await fs.readFile(path.join(dir, 'out.txt'), 'utf8'));
      t.truthy(await fs.readFile(path.join(dir, 'out2.txt'), 'utf8'));
      t.is(res1.filter(r => r.skipped).length, 0, 'first run should not skip');

      const res2 = await runPipeline(pipelinesPath, 'demo', { concurrency: 2, reportDir: undefined, contentHash: true });
      t.true(res2.every(r => r.skipped), 'second run should skip all steps');

      // touch input to invalidate
      await fs.writeFile(path.join(dir, 'out.txt'), 'changed\n', 'utf8');
      const res3 = await runPipeline(pipelinesPath, 'demo', { concurrency: 2, reportDir: undefined, contentHash: true });
      t.true(res3.some(r => !r.skipped), 'after change, at least one step should rerun');
    } finally {
      process.chdir(prevCwd);
    }
  });
});
