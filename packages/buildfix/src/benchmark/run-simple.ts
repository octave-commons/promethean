#!/usr/bin/env node

import * as path from 'path';
import { promises as fs } from 'fs';
import { BuildFixBenchmark, models, type BenchmarkResult } from './index.js';
import type { Fixture } from './fixtures.js';

async function runSimpleBenchmark(): Promise<BenchmarkResult[]> {
  const tempDir = path.resolve('./simple-benchmark-temp');
  const results: BenchmarkResult[] = [];

  // Setup temp directory
  await fs.rm(tempDir, { recursive: true, force: true });
  await fs.mkdir(tempDir, { recursive: true });

  // Create simple fixtures
  const simpleFixtures: Fixture[] = [
    {
      name: '01-undefined-var',
      description: 'Cannot find name undefinedVariable',
      files: {
        'src.ts': `
// ERROR: Cannot find name 'undefinedVariable'
// ERROR_CODE: TS2304
export function testFunction() {
  return undefinedVariable;
}
        `,
      },
      expectedFixes: {
        'src.ts': `
export function testFunction() {
  const undefinedVariable = "defined";
  return undefinedVariable;
}
        `,
      },
      errorPattern: ['TS2304'],
    },
    {
      name: '02-missing-export',
      description: 'Function exists but not exported',
      files: {
        'src.ts': `
// ERROR: Function 'helper' is used but not exported
// ERROR_CODE: TS2305
function helper() {
  return "hello";
}

// Usage in another module expects this to be exported
export function main() {
  return helper();
}
        `,
      },
      expectedFixes: {
        'src.ts': `
export function helper() {
  return "hello";
}

// Usage in another module expects this to be exported
export function main() {
  return helper();
}
        `,
      },
      errorPattern: ['TS2305'],
    },
    {
      name: '03-optional-param',
      description: 'Function parameter should be optional',
      files: {
        'src.ts': `
// ERROR: Function parameter should be optional
// ERROR_CODE: TS2554
export function greet(name: string) {
  return \`Hello, \${name}!\`;
}

// Called without argument
export function main() {
  return greet();
}
        `,
      },
      expectedFixes: {
        'src.ts': `
export function greet(name?: string) {
  return \`Hello, \${name || "world"}!\`;
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

    // Install dependencies
    console.log(`  📦 Installing dependencies for ${fixture.name}...`);
    const { exec } = await import('child_process');
    await new Promise<void>((resolve, reject) => {
      const proc = exec('npm install', { cwd: fixtureDir }, (error) => {
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

  console.log(
    `🚀 Running simple benchmark with ${simpleFixtures.length} fixtures and ${models.length} models...`,
  );

  const benchmark = new BuildFixBenchmark(tempDir);

  for (let i = 0; i < simpleFixtures.length; i++) {
    const fixture = simpleFixtures[i];
    if (!fixture) {
      console.log(`  ⚠️  Fixture ${i + 1} is undefined, skipping...`);
      continue;
    }
    console.log(`\n📝 Testing fixture ${i + 1}/${simpleFixtures.length}: ${fixture.name}`);

    for (const modelConfig of models) {
      console.log(`  🤖 Testing model: ${modelConfig.name}...`);

      try {
        const result = await benchmark.runSingleBenchmark(fixture, modelConfig);
        results.push(result);

        const status = result.success ? '✅' : '❌';
        const errors = `${result.errorCountBefore}→${result.errorCountAfter}`;
        const plan = result.planGenerated ? '📋' : '❌';
        const resolved = result.errorsResolved ? '🎯' : '❌';

        console.log(
          `    ${status} ${modelConfig.name}: ${errors} ${plan} ${resolved} (${result.duration}ms)`,
        );

        if (result.errorMessage) {
          console.log(`    💭 ${result.errorMessage}`);
        }

        // Bail early on first success or error unless --no-bail
        if (result.success || result.errorMessage) {
          if (!process.argv.includes('--no-bail')) {
            console.log(`\n🛑 Bailing early - ${result.success ? 'SUCCESS' : 'ERROR'}`);
            return results;
          }
        }
      } catch (error) {
        console.log(`    ❌ ${modelConfig.name}: Failed - ${error}`);

        if (!process.argv.includes('--no-bail')) {
          console.log(`\n🛑 Bailing early due to error`);
          return results;
        }

        results.push({
          fixture: fixture!.name,
          model: modelConfig.name,
          success: false,
          errorCountBefore: 0,
          errorCountAfter: 0,
          errorsResolved: false,
          planGenerated: false,
          errorMessage: error instanceof Error ? error.message : String(error),
          duration: 0,
          attempts: 0,
        });
      }
    }
  }

  return results;
}

async function main() {
  try {
    console.log('🚀 Starting Simple BuildFix Benchmark');
    console.log('=====================================');

    const results = await runSimpleBenchmark();

    // Generate report
    const totalTests = results.length;
    const successfulTests = results.filter((r) => r.success).length;
    const successRate = totalTests > 0 ? ((successfulTests / totalTests) * 100).toFixed(1) : '0.0';

    console.log('\n📊 Simple Benchmark Summary');
    console.log('============================');
    console.log(`Total tests: ${totalTests}`);
    console.log(`Successful: ${successfulTests}`);
    console.log(`Success rate: ${successRate}%`);

    // Save report
    const reportContent = `# Simple BuildFix Benchmark Report

## Summary
- Total tests: ${totalTests}
- Successful: ${successfulTests}
- Success rate: ${successRate}%

## Results
${results.map((r) => `- ${r.fixture} with ${r.model}: ${r.success ? '✅' : '❌'} ${r.errorMessage || ''}`).join('\n')}
`;

    await fs.writeFile('./simple-buildfix-benchmark-report.md', reportContent);
    console.log('📄 Report saved to ./simple-buildfix-benchmark-report.md');
  } catch (error) {
    console.error('Benchmark failed:', error);
  }
}

if (process.argv[1] === import.meta.url.replace('file://', '')) {
  main().catch(console.error);
}
