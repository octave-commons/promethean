import test from 'ava';
import { promises as fs } from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

import { errorStillPresent, buildAndJudge } from '../iter/eval.js';
import type { RawTscDiagnostic } from '../types.js';

test('errorStillPresent returns true when error matches', (t) => {
  const key = 'TS2322|/test/file.ts|10';

  const currentErrors: RawTscDiagnostic[] = [
    {
      file: '/test/file.ts',
      line: 10,
      col: 5,
      code: 'TS2322',
      message: "Type 'string' is not assignable to type 'number'",
    },
  ];

  t.true(errorStillPresent(currentErrors, key));
});

test('errorStillPresent returns false when error is resolved', (t) => {
  const key = 'TS2322|/test/file.ts|10';

  const currentErrors: RawTscDiagnostic[] = [
    {
      file: '/test/file.ts',
      line: 15,
      col: 8,
      code: 'TS2581',
      message: "Cannot find name 'console'",
    },
  ];

  t.false(errorStillPresent(currentErrors, key));
});

test('errorStillPresent returns false when no errors', (t) => {
  const key = 'TS2322|/test/file.ts|10';

  const currentErrors: RawTscDiagnostic[] = [];

  t.false(errorStillPresent(currentErrors, key));
});

test('errorStillPresent handles multiple errors correctly', (t) => {
  const key = 'TS2322|/test/file.ts|10';

  const currentErrors: RawTscDiagnostic[] = [
    {
      file: '/test/other.ts',
      line: 5,
      col: 2,
      code: 'TS2304',
      message: "Cannot find name 'undefinedVar'",
    },
    {
      file: '/test/file.ts',
      line: 10,
      col: 5,
      code: 'TS2322',
      message: "Type 'string' is not assignable to type 'number'",
    },
    {
      file: '/test/third.ts',
      line: 20,
      col: 10,
      code: 'TS2581',
      message: "Cannot find name 'process'",
    },
  ];

  t.true(errorStillPresent(currentErrors, key));
});

test('errorStillPresent matches by line tolerance', (t) => {
  const key = 'TS2322|/test/file.ts|10';

  const currentErrors: RawTscDiagnostic[] = [
    {
      file: '/test/file.ts',
      line: 12, // Within 2 lines tolerance
      col: 5,
      code: 'TS2322',
      message: "Type 'string' is not assignable to type 'number'",
    },
  ];

  t.true(errorStillPresent(currentErrors, key));
});

test('errorStillPresent rejects errors outside line tolerance', (t) => {
  const key = 'TS2322|/test/file.ts|10';

  const currentErrors: RawTscDiagnostic[] = [
    {
      file: '/test/file.ts',
      line: 15, // Outside 2 lines tolerance
      col: 5,
      code: 'TS2322',
      message: "Type 'string' is not assignable to type 'number'",
    },
  ];

  t.false(errorStillPresent(currentErrors, key));
});

test('errorStillPresent handles path resolution', (t) => {
  const key = 'TS2322|/test/../test/file.ts|10';

  const currentErrors: RawTscDiagnostic[] = [
    {
      file: '/test/file.ts', // Resolved path should match
      line: 10,
      col: 5,
      code: 'TS2322',
      message: "Type 'string' is not assignable to type 'number'",
    },
  ];

  t.true(errorStillPresent(currentErrors, key));
});

test('buildAndJudge runs TypeScript compilation', async (t) => {
  // Create a temporary TypeScript project
  const tempDir = path.join('/tmp', `buildfix-eval-test-${randomUUID()}`);
  await fs.mkdir(tempDir, { recursive: true });

  const tsconfigPath = path.join(tempDir, 'tsconfig.json');
  const testFilePath = path.join(tempDir, 'test.ts');

  // Create tsconfig.json
  await fs.writeFile(
    tsconfigPath,
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2020',
          strict: true,
        },
        include: ['*.ts'],
      },
      null,
      2,
    ),
  );

  // Create a TypeScript file with an error
  await fs.writeFile(testFilePath, 'const x: number = "hello";');

  const key = 'TS2322|' + testFilePath + '|1';

  const result = await buildAndJudge(tsconfigPath, key);

  t.true(result.present);
  t.true(result.r.diags.length > 0);

  // Find our specific error - compare resolved paths
  const ourError = result.r.diags.find(
    (d: RawTscDiagnostic) =>
      path.resolve(d.file) === path.resolve(testFilePath) && d.code === 'TS2322' && d.line === 1,
  );

  t.truthy(ourError);

  // Cleanup
  await fs.rm(tempDir, { recursive: true, force: true });
});

test('buildAndJudge handles successful compilation', async (t) => {
  // Create a temporary TypeScript project
  const tempDir = path.join('/tmp', `buildfix-eval-test-${randomUUID()}`);
  await fs.mkdir(tempDir, { recursive: true });

  const tsconfigPath = path.join(tempDir, 'tsconfig.json');
  const testFilePath = path.join(tempDir, 'test.ts');

  // Create tsconfig.json
  await fs.writeFile(
    tsconfigPath,
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2020',
          strict: true,
        },
        include: ['*.ts'],
      },
      null,
      2,
    ),
  );

  // Create a valid TypeScript file
  await fs.writeFile(testFilePath, 'const x: number = 42;');

  const key = 'TS2322|' + testFilePath + '|1';

  const result = await buildAndJudge(tsconfigPath, key);

  t.false(result.present); // Error should not be present
  t.true(result.r.diags.length === 0); // No diagnostics

  // Cleanup
  await fs.rm(tempDir, { recursive: true, force: true });
});

test('buildAndJudge handles missing tsconfig', async (t) => {
  const tempDir = path.join('/tmp', `buildfix-eval-test-${randomUUID()}`);
  await fs.mkdir(tempDir, { recursive: true });

  const nonExistentTsconfig = path.join(tempDir, 'tsconfig.json');
  const key = 'TS2322|/test/file.ts|1';

  await t.throwsAsync(() => buildAndJudge(nonExistentTsconfig, key), { message: /ENOENT/ });

  // Cleanup
  await fs.rm(tempDir, { recursive: true, force: true });
});

test('buildAndJudge returns correct error count', async (t) => {
  // Create a temporary TypeScript project
  const tempDir = path.join('/tmp', `buildfix-eval-test-${randomUUID()}`);
  await fs.mkdir(tempDir, { recursive: true });

  const tsconfigPath = path.join(tempDir, 'tsconfig.json');
  const testFilePath = path.join(tempDir, 'test.ts');

  // Create tsconfig.json
  await fs.writeFile(
    tsconfigPath,
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2020',
          strict: true,
        },
        include: ['*.ts'],
      },
      null,
      2,
    ),
  );

  // Create a TypeScript file with multiple errors
  await fs.writeFile(
    testFilePath,
    `
    const x: number = "hello";
    const y: string = 42;
    undefinedVar;
  `,
  );

  const key = 'TS2322|' + testFilePath + '|2';

  const result = await buildAndJudge(tsconfigPath, key);

  t.true(result.present);
  t.true(result.r.diags.length >= 3); // Should have at least 3 errors

  // Cleanup
  await fs.rm(tempDir, { recursive: true, force: true });
});
