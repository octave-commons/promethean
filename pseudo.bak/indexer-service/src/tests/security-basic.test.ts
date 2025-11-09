import test from 'ava';
import { validateSinglePath } from '../validation/validators-enhanced.js';

test.serial('validateSinglePath: should reject obvious traversal attacks', (t) => {
  const maliciousPaths = [
    '../../../etc/passwd',
    '..\\..\\windows\\system32',
    '/etc/shadow',
    'C:\\Windows\\System32',
  ];

  maliciousPaths.forEach((path) => {
    const result = validateSinglePath(path);
    t.false(result.success, `Path "${path}" should be rejected`);
  });
});

test.serial('validateSinglePath: should accept safe paths', (t) => {
  const safePaths = [
    'docs/readme.md',
    'src/components/Button.tsx',
    'package.json',
    'tests/unit/test.ts',
  ];

  safePaths.forEach((path) => {
    const result = validateSinglePath(path);
    t.true(result.success, `Path "${path}" should be accepted`);
  });
});
