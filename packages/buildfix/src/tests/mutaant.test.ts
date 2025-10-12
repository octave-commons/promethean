import test from 'ava';
import { promises as fs } from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

import { createMutaant, type MutaantOptions, type MutaantResult } from '../mutaant.js';

test('createMutaant generates mutations with default error codes', async (t) => {
  const sourceDir = path.join('/tmp', `mutaant-source-${randomUUID()}`);
  const targetDir = path.join('/tmp', `mutaant-target-${randomUUID()}`);

  // Create source directory with TypeScript files
  await fs.mkdir(sourceDir, { recursive: true });
  await fs.mkdir(path.join(sourceDir, 'src'), { recursive: true });

  // Create tsconfig.json
  await fs.writeFile(
    path.join(sourceDir, 'tsconfig.json'),
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2020',
          strict: true,
        },
        include: ['src/**/*'],
      },
      null,
      2,
    ),
  );

  // Create some TypeScript files
  await fs.writeFile(
    path.join(sourceDir, 'src', 'file1.ts'),
    `
    export function test1() {
      return 'hello';
    }
    
    export const value1 = 42;
  `,
  );

  await fs.writeFile(
    path.join(sourceDir, 'src', 'file2.ts'),
    `
    export function test2(param: string) {
      return param.length;
    }
    
    export class TestClass {
      method() {
        return true;
      }
    }
  `,
  );

  const options: MutaantOptions = {
    sourcePath: sourceDir,
    targetPath: targetDir,
    minMutants: 10,
    minInstances: 2,
    seed: 12345,
    errorCodes: ['TS2304', 'TS2322'],
  };

  const result: MutaantResult = await createMutaant(options);

  t.true(result.totalMutants >= 10);
  t.true(result.counts.get('TS2304')! >= 2);
  t.true(result.counts.get('TS2322')! >= 2);

  // Verify target directory exists and has files
  await fs.access(targetDir);
  await fs.access(path.join(targetDir, 'src', 'file1.ts'));
  await fs.access(path.join(targetDir, 'src', 'file2.ts'));

  // Check that mutations were added
  const mutatedContent1 = await fs.readFile(path.join(targetDir, 'src', 'file1.ts'), 'utf8');
  const mutatedContent2 = await fs.readFile(path.join(targetDir, 'src', 'file2.ts'), 'utf8');

  t.true(mutatedContent1.includes('__mutant_'));
  t.true(mutatedContent2.includes('__mutant_'));

  // Cleanup
  await fs.rm(sourceDir, { recursive: true, force: true });
  await fs.rm(targetDir, { recursive: true, force: true });
});

test('createMutaant throws error when target exists', async (t) => {
  const sourceDir = path.join('/tmp', `mutaant-source-${randomUUID()}`);
  const targetDir = path.join('/tmp', `mutaant-target-${randomUUID()}`);

  // Create source directory
  await fs.mkdir(sourceDir, { recursive: true });
  await fs.writeFile(path.join(sourceDir, 'tsconfig.json'), '{}');
  await fs.writeFile(path.join(sourceDir, 'test.ts'), 'const x = 1;');

  // Create target directory
  await fs.mkdir(targetDir, { recursive: true });

  const options: MutaantOptions = {
    sourcePath: sourceDir,
    targetPath: targetDir,
    minMutants: 5,
    minInstances: 1,
    seed: 12345,
    errorCodes: ['TS2304'],
  };

  await t.throwsAsync(() => createMutaant(options), { message: /Target directory already exists/ });

  // Cleanup
  await fs.rm(sourceDir, { recursive: true, force: true });
  await fs.rm(targetDir, { recursive: true, force: true });
});

test('createMutaant throws error when tsconfig not found', async (t) => {
  const sourceDir = path.join('/tmp', `mutaant-source-${randomUUID()}`);
  const targetDir = path.join('/tmp', `mutaant-target-${randomUUID()}`);

  // Create source directory without tsconfig.json
  await fs.mkdir(sourceDir, { recursive: true });
  await fs.writeFile(path.join(sourceDir, 'test.ts'), 'const x = 1;');

  const options: MutaantOptions = {
    sourcePath: sourceDir,
    targetPath: targetDir,
    minMutants: 5,
    minInstances: 1,
    seed: 12345,
    errorCodes: ['TS2304'],
  };

  await t.throwsAsync(() => createMutaant(options), { message: /tsconfig\.json not found/ });

  // Cleanup
  await fs.rm(sourceDir, { recursive: true, force: true });
});

test('createMutaant throws error when no TypeScript files found', async (t) => {
  const sourceDir = path.join('/tmp', `mutaant-source-${randomUUID()}`);
  const targetDir = path.join('/tmp', `mutaant-target-${randomUUID()}`);

  // Create source directory with only non-TypeScript files
  await fs.mkdir(sourceDir, { recursive: true });
  await fs.writeFile(path.join(sourceDir, 'tsconfig.json'), '{}');
  await fs.writeFile(path.join(sourceDir, 'test.js'), 'const x = 1;');
  await fs.writeFile(path.join(sourceDir, 'readme.md'), '# Test');

  const options: MutaantOptions = {
    sourcePath: sourceDir,
    targetPath: targetDir,
    minMutants: 5,
    minInstances: 1,
    seed: 12345,
    errorCodes: ['TS2304'],
  };

  await t.throwsAsync(() => createMutaant(options), {
    message: /No TypeScript source files found/,
  });

  // Cleanup
  await fs.rm(sourceDir, { recursive: true, force: true });
});

test('createMutaant uses custom tsconfig override', async (t) => {
  const sourceDir = path.join('/tmp', `mutaant-source-${randomUUID()}`);
  const targetDir = path.join('/tmp', `mutaant-target-${randomUUID()}`);
  const customTsconfig = path.join('/tmp', `custom-tsconfig-${randomUUID()}.json`);

  // Create source directory
  await fs.mkdir(sourceDir, { recursive: true });
  await fs.writeFile(path.join(sourceDir, 'test.ts'), 'const x = 1;');

  // Create custom tsconfig
  await fs.writeFile(
    customTsconfig,
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

  const options: MutaantOptions = {
    sourcePath: sourceDir,
    targetPath: targetDir,
    minMutants: 5,
    minInstances: 1,
    seed: 12345,
    errorCodes: ['TS2304'],
    tsconfigOverride: customTsconfig,
  };

  const result: MutaantResult = await createMutaant(options);

  t.true(result.totalMutants >= 5);

  // Cleanup
  await fs.rm(sourceDir, { recursive: true, force: true });
  await fs.rm(targetDir, { recursive: true, force: true });
  await fs.rm(customTsconfig, { force: true });
});

test('createMutaant handles empty error codes', async (t) => {
  const sourceDir = path.join('/tmp', `mutaant-source-${randomUUID()}`);
  const targetDir = path.join('/tmp', `mutaant-target-${randomUUID()}`);

  // Create source directory
  await fs.mkdir(sourceDir, { recursive: true });
  await fs.writeFile(path.join(sourceDir, 'tsconfig.json'), '{}');
  await fs.writeFile(path.join(sourceDir, 'test.ts'), 'const x = 1;');

  const options: MutaantOptions = {
    sourcePath: sourceDir,
    targetPath: targetDir,
    minMutants: 5,
    minInstances: 1,
    seed: 12345,
    errorCodes: [], // Empty array should default to TS2304
  };

  const result: MutaantResult = await createMutaant(options);

  t.true(result.totalMutants >= 5);
  t.true(result.counts.has('TS2304'));

  // Cleanup
  await fs.rm(sourceDir, { recursive: true, force: true });
  await fs.rm(targetDir, { recursive: true, force: true });
});

test('createMutaant generates different mutations for different error codes', async (t) => {
  const sourceDir = path.join('/tmp', `mutaant-source-${randomUUID()}`);
  const targetDir = path.join('/tmp', `mutaant-target-${randomUUID()}`);

  // Create source directory
  await fs.mkdir(sourceDir, { recursive: true });
  await fs.writeFile(path.join(sourceDir, 'tsconfig.json'), '{}');
  await fs.writeFile(path.join(sourceDir, 'test.ts'), 'const x = 1;');

  const options: MutaantOptions = {
    sourcePath: sourceDir,
    targetPath: targetDir,
    minMutants: 20,
    minInstances: 3,
    seed: 12345,
    errorCodes: ['TS2304', 'TS2322', 'TS2339', 'TS2345'],
  };

  const result: MutaantResult = await createMutaant(options);

  t.true(result.totalMutants >= 20);
  t.true(result.counts.get('TS2304')! >= 3);
  t.true(result.counts.get('TS2322')! >= 3);
  t.true(result.counts.get('TS2339')! >= 3);
  t.true(result.counts.get('TS2345')! >= 3);

  // Verify different mutation patterns
  const mutatedContent = await fs.readFile(path.join(targetDir, 'test.ts'), 'utf8');

  // Should contain different mutation patterns
  t.true(
    mutatedContent.includes('MissingIdentifier_') ||
      mutatedContent.includes('__mutant_assign_') ||
      mutatedContent.includes('__mutant_obj_') ||
      mutatedContent.includes('__mutant_arg_'),
  );

  // Cleanup
  await fs.rm(sourceDir, { recursive: true, force: true });
  await fs.rm(targetDir, { recursive: true, force: true });
});

test('createMutaant is deterministic with same seed', async (t) => {
  const sourceDir = path.join('/tmp', `mutaant-source-${randomUUID()}`);
  const targetDir1 = path.join('/tmp', `mutaant-target-${randomUUID()}`);
  const targetDir2 = path.join('/tmp', `mutaant-target-${randomUUID()}`);

  // Create source directory
  await fs.mkdir(sourceDir, { recursive: true });
  await fs.writeFile(path.join(sourceDir, 'tsconfig.json'), '{}');
  await fs.writeFile(path.join(sourceDir, 'test.ts'), 'const x = 1;');

  const options: MutaantOptions = {
    sourcePath: sourceDir,
    targetPath: targetDir1,
    minMutants: 10,
    minInstances: 2,
    seed: 12345, // Same seed
    errorCodes: ['TS2304'],
  };

  const options2: MutaantOptions = {
    sourcePath: sourceDir,
    targetPath: targetDir2,
    minMutants: 10,
    minInstances: 2,
    seed: 12345, // Same seed
    errorCodes: ['TS2304'],
  };

  const result1: MutaantResult = await createMutaant(options);
  const result2: MutaantResult = await createMutaant(options2);

  // Results should be identical with same seed
  t.is(result1.totalMutants, result2.totalMutants);
  t.is(result1.counts.get('TS2304'), result2.counts.get('TS2304'));

  // Content should be identical
  const content1 = await fs.readFile(path.join(targetDir1, 'test.ts'), 'utf8');
  const content2 = await fs.readFile(path.join(targetDir2, 'test.ts'), 'utf8');
  t.is(content1, content2);

  // Cleanup
  await fs.rm(sourceDir, { recursive: true, force: true });
  await fs.rm(targetDir1, { recursive: true, force: true });
  await fs.rm(targetDir2, { recursive: true, force: true });
});
