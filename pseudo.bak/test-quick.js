#!/usr/bin/env node

import * as path from 'path';
import { promises as fs } from 'fs';
import { BuildFixBenchmark } from './packages/buildfix/src/benchmark/index.js';

async function runQuickTest() {
  const simpleFixtures = [
    {
      name: '01-undefined-var',
      description: 'Undefined variable error',
      files: {
        'src.ts': `
// ERROR: 'undefinedVar' is not defined
// ERROR_CODE: TS2304
export function main() {
  return undefinedVar;
}
      `,
      },
      errorPattern: ['TS2304'],
    },
    {
      name: '03-optional-param',
      description: 'Required parameter missing',
      files: {
        'src.ts': `
// ERROR: Expected 1 arguments, but got 0
// ERROR_CODE: TS2554
function greet(name: string) {
  return \`Hello, \${name}!\`;
}

// Called without argument
export function main() {
  return greet();
}
      `,
      },
      errorPattern: ['TS2554'],
    },
  ];

  const tempDir = './quick-test-temp';

  // Create fixture directories
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

    // Install dependencies (skip if already exists)
    const nodeModulesPath = path.join(fixtureDir, 'node_modules');
    try {
      await fs.access(nodeModulesPath);
      console.log(`  📦 Dependencies already installed for ${fixture.name}`);
    } catch {
      console.log(`📦 Installing dependencies for ${fixture.name}...`);
      const { exec } = await import('child_process');
      await new Promise((resolve, reject) => {
        const proc = exec('npm install --no-audit --no-fund', { cwd: fixtureDir }, (error) => {
          if (error) {
            reject(error);
          } else {
            resolve(undefined);
          }
        });
        proc.stdout?.pipe(process.stdout);
        proc.stderr?.pipe(process.stderr);
      });
    }
  }

  console.log('\n🚀 Testing qwen3:8b on working fixtures...\n');

  const benchmark = new BuildFixBenchmark(tempDir);

  for (let i = 0; i < simpleFixtures.length; i++) {
    const fixture = simpleFixtures[i];
    if (!fixture) continue;

    console.log(`📝 Testing fixture ${i + 1}/${simpleFixtures.length}: ${fixture.name}`);

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
      }
    } catch (error) {
      console.log(`  ❌ FAILED: ${error}`);
    }
    console.log('');
  }

  // Cleanup
  await fs.rm(tempDir, { recursive: true, force: true });

  console.log('🏁 Quick test completed!');
}

runQuickTest().catch(console.error);
