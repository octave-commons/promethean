import test from 'ava';
import { parseArgs } from '../utils.js';

test('parseArgs merges defaults and argv', t => {
  const orig = process.argv.slice();
  process.argv = ['node', 'script', '--foo', 'bar', '--flag'];
  const res = parseArgs({ '--foo': 'baz', '--flag': 'no' });
  process.argv = orig;
  t.is(res['--foo'], 'bar');
  t.is(res['--flag'], 'true');
});
