import test from 'ava';
import { parseArgs, parseTsc, sanitizeBranch } from '../utils.js';

// Store original argv to restore after tests
const origArgv = process.argv.slice();

test.afterEach(() => {
  process.argv = origArgv.slice();
});

test('parseArgs overrides defaults with CLI values', (t) => {
  process.argv = ['node', 'test', '--foo', 'bar', '--flag'];
  const out = parseArgs({ '--foo': 'baz', '--flag': 'false' });
  t.is(out['--foo'], 'bar');
  t.is(out['--flag'], 'true');
});

test('parseTsc extracts diagnostics', (t) => {
  const sample = '/path/file.ts(10,20): error TS1234: Example message';
  const res = parseTsc(sample);
  t.deepEqual(res, [
    {
      file: '/path/file.ts',
      line: 10,
      col: 20,
      code: 'TS1234',
      message: 'Example message',
    },
  ]);
});

test('sanitizeBranch removes invalid characters', (t) => {
  const branch = sanitizeBranch('feat/Bad*Branch!?Name');
  t.is(branch, 'feat/Bad-Branch-Name');
});
