#!/usr/bin/env node

import * as path from 'path';
import { promises as fs } from 'fs';
import { BuildFixBenchmark } from './packages/buildfix/src/benchmark/index.js';

async function testExactBenchmark() {
  console.log('🎯 Testing exact benchmark structure...\n');

  const tempDir = './exact-test-temp';

  // Create the exact same structure as the working simple benchmark
  const simpleFixtures = [
    {
      name: '01-undefined-var',
      description: 'Undefined variable error',
      files: {
        'src.ts': `
// ERROR: 'undefinedVar' is not defined
export function main() {
  return undefinedVar;
}
        `,
      },
      errorPattern: ['TS2552'],
    },
  ];

  // Create fixture directories exactly like run-simple.ts
  for (const fixture of simpleFixtures) {
    const fixtureDir = path.join(tempDir, 'fixtures', fixture.name);
    await fs.mkdir(fixtureDir, { recursive: true });

    // Create all files for the fixture
    for (const [filename, content] of Object.entries(fixture.files)) {
      await fs.writeFile(path.join(fixtureDir, filename), content.trim(), 'utf8');
    }

    // Create package.json with ts-morph dependency
    await fs.writeFile(
      path.join(fixtureDir, 'package.json'),
      JSON.stringify(
        {
          type: 'module',
          dependencies: {
            'ts-morph': '^23.0.0',
          },
        },
        null,
        2,
      ),
      'utf8',
    );

    // Create tsconfig exactly like run-simple.ts
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

    // Install dependencies
    console.log(`📦 Installing dependencies for ${fixture.name}...`);
    const { exec } = await import('child_process');
    await new Promise((resolve, reject) => {
      const proc = exec('npm install --no-audit --no-fund', { cwd: fixtureDir }, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
      proc.stdout?.pipe(process.stdout);
      proc.stderr?.pipe(process.stderr);
    });
  }

  console.log('\n🚀 Testing with exact benchmark setup...\n');

  const benchmark = new BuildFixBenchmark(tempDir);

  for (const fixture of simpleFixtures) {
    console.log(`📝 Testing fixture: ${fixture.name}`);

    try {
      const result = await benchmark.runSingleBenchmark(fixture, {
        name: 'gpt-oss:20b-cloud',
        model: 'gpt-oss:20b-cloud',
      });

      const status = result.success ? '✅ SUCCESS' : '❌ FAILED';
      const errors = `${result.errorCountBefore}→${result.errorCountAfter}`;
      const plan = result.planGenerated ? '📋' : '❌';
      const resolved = result.errorsResolved ? '🎯' : '❌';

      console.log(`  ${status}: ${errors} ${plan} ${resolved} (${result.duration}ms)`);

      if (result.errorMessage) {
        console.log(`    💭 ${result.errorMessage}`);
      }

      if (result.success) {
        console.log(`    🎉 Plan: "${result.planTitle}"`);

        // Show the fixed code
        const fixtureDir = path.join(tempDir, 'fixtures', fixture.name);
        const fixedCode = await fs.readFile(path.join(fixtureDir, 'src.ts'), 'utf8');
        console.log('\n📝 Fixed code:');
        console.log(fixedCode);
      }
    } catch (error) {
      console.log(`  ❌ FAILED: ${error}`);
    }
    console.log('');
  }

  // Cleanup
  await fs.rm(tempDir, { recursive: true, force: true });

  console.log('🏁 Exact benchmark test completed!');
}

testExactBenchmark().catch(console.error);
