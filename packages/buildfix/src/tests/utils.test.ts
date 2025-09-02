import test from 'ava';
import { parseArgs, sanitizeBranch } from '../utils.js';

test('parseArgs uses defaults and CLI overrides', t => {
  const orig = process.argv.slice();
  process.argv = ['node','script','--foo','bar','--flag'];
  const args = parseArgs({ '--foo': 'baz', '--flag': 'no' });
  t.is(args['--foo'], 'bar');
  t.is(args['--flag'], 'true');
  process.argv = orig;
});

test('sanitizeBranch strips invalid characters', t => {
  t.is(sanitizeBranch('Feature: Fix//Bug!!'), 'Feature-Fix//Bug');
});
