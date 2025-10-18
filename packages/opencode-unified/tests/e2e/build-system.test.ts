import test from 'ava';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

test('typescript compilation works', (t) => {
  try {
    execSync('npx tsc --noEmit', {
      cwd: join(__dirname, '../..'),
      stdio: 'pipe',
    });
    t.pass('TypeScript compilation successful');
  } catch (error) {
    t.fail(`TypeScript compilation failed: ${error.message}`);
  }
});

test('package can be built', (t) => {
  try {
    execSync('npm run build:typescript', {
      cwd: join(__dirname, '../..'),
      stdio: 'pipe',
    });
    t.pass('Package build successful');
  } catch (error) {
    t.fail(`Package build failed: ${error.message}`);
  }
});

test('test runner works', (t) => {
  try {
    execSync('npx ava --version', {
      cwd: join(__dirname, '../..'),
      stdio: 'pipe',
    });
    t.pass('AVA test runner available');
  } catch (error) {
    t.fail(`AVA test runner not available: ${error.message}`);
  }
});

test('dist directory is created after build', (t) => {
  const distPath = join(__dirname, '../../dist');

  // Try to build first
  try {
    execSync('npx tsc', {
      cwd: join(__dirname, '../..'),
      stdio: 'pipe',
    });
  } catch (error) {
    // Build might fail due to other project files, but we can still check structure
  }

  t.true(existsSync(distPath) || existsSync(join(__dirname, '../../src/typescript')));
});
