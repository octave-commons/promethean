#!/usr/bin/env node

import * as path from 'path';
import { promises as fs } from 'fs';
import { BuildFixBenchmark } from './packages/buildfix/src/benchmark/index.js';

async function testEndToEnd() {
  console.log('🔄 Running end-to-end test with gpt-oss:20b-cloud...\n');

  // Create a simple temporary fixture
  const tempDir = './e2e-test-temp';
  const fixtureDir = path.join(tempDir, 'fixture');

  await fs.mkdir(fixtureDir, { recursive: true });

  // Create test file with error
  const testCode = `
// ERROR: 'undefinedVar' is not defined
export function main() {
  return undefinedVar;
}
`;

  await fs.writeFile(path.join(fixtureDir, 'src.ts'), testCode.trim(), 'utf8');

  // Create package.json with ts-morph
  await fs.writeFile(
    path.join(fixtureDir, 'package.json'),
    JSON.stringify(
      {
        type: 'module',
        dependencies: { 'ts-morph': '^23.0.0' },
      },
      null,
      2,
    ),
    'utf8',
  );

  // Create tsconfig
  await fs.writeFile(
    path.join(fixtureDir, 'tsconfig.json'),
    JSON.stringify(
      {
        compilerOptions: {
          strict: true,
          noEmit: true,
          target: 'ES2020',
          module: 'ESNext',
          moduleResolution: 'node',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
        },
        include: ['*.ts'],
      },
      null,
      2,
    ),
    'utf8',
  );

  // Install ts-morph only if needed
  const nodeModulesPath = path.join(fixtureDir, 'node_modules');
  try {
    await fs.access(nodeModulesPath);
  } catch {
    console.log('📦 Installing ts-morph...');
    const { exec } = await import('child_process');
    await new Promise((resolve, reject) => {
      exec('npm install --no-audit --no-fund', { cwd: fixtureDir }, (error) => {
        if (error) reject(error);
        else resolve(undefined);
      });
    });
  }

  // Create fixture object
  const fixture = {
    name: 'fixture',
    description: 'Test undefined variable',
    files: { 'src.ts': testCode.trim() },
    errorPattern: ['TS2552'],
  };

  console.log('🎯 Running AI-powered fix...');

  try {
    const benchmark = new BuildFixBenchmark(tempDir);
    const result = await benchmark.runSingleBenchmark(fixture, {
      name: 'gpt-oss:20b-cloud',
      model: 'gpt-oss:20b-cloud',
    });

    const status = result.success ? '✅ SUCCESS' : '❌ FAILED';
    const errors = `${result.errorCountBefore}→${result.errorCountAfter}`;
    const plan = result.planGenerated ? '📋' : '❌';
    const resolved = result.errorsResolved ? '🎯' : '❌';

    console.log(`\n${status}: ${errors} ${plan} ${resolved} (${result.duration}ms)`);

    if (result.errorMessage) {
      console.log(`💭 ${result.errorMessage}`);
    }

    if (result.success) {
      console.log(`🎉 Plan: "${result.planTitle}"`);

      // Show the fixed code
      const fixedCode = await fs.readFile(path.join(fixtureDir, 'src.ts'), 'utf8');
      console.log('\n📝 Fixed code:');
      console.log(fixedCode);
    }

    // Cleanup
    await fs.rm(tempDir, { recursive: true, force: true });

    return result.success;
  } catch (error) {
    console.log(`❌ FAILED: ${error}`);
    await fs.rm(tempDir, { recursive: true, force: true });
    return false;
  }
}

testEndToEnd()
  .then((success) => {
    console.log(`\n🏁 End-to-end test ${success ? 'PASSED' : 'FAILED'}!`);
    process.exit(success ? 0 : 1);
  })
  .catch(console.error);
