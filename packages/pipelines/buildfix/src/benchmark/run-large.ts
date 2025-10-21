#!/usr/bin/env node

import * as path from 'path';
import { promises as fs } from 'fs';
import { BuildFixBenchmark, models, type BenchmarkResult } from './index.js';
import type { Fixture } from './fixtures.js';

async function runLargeScaleBenchmark(): Promise<BenchmarkResult[]> {
  const tempDir = path.resolve('./large-benchmark-temp');
  const results: BenchmarkResult[] = [];

  // Setup temp directory with generated errors
  await fs.rm(tempDir, { recursive: true, force: true });
  await fs.mkdir(tempDir, { recursive: true });

  // Find all TypeScript files with errors in the benchmark-fixtures directory
  const sourceDir = path.resolve('./benchmark-fixtures');
  const errorFiles = await findErrorFiles(sourceDir);
  console.log(`📊 Found ${errorFiles.length} TypeScript files with errors`);
  if (errorFiles.length > 0) {
    console.log('First few files:', errorFiles.slice(0, 3));
  }

  console.log(
    `🚀 Running large-scale benchmark with ${errorFiles.length} error files and ${models.length} models...`,
  );

  // Create a custom benchmark instance for our generated fixtures
  const benchmark = new BuildFixBenchmark(tempDir);

  // Convert error files to fixture format and create proper directory structure
  const generatedFixtures: Fixture[] = [];
  for (const filePath of errorFiles) {
    const relativePath = path.relative(sourceDir, filePath);
    const fixtureName = relativePath.replace(/\//g, '_').replace(/\.ts$/, '');

    // Read the file to extract error information
    const content = await fs.readFile(filePath, 'utf8');
    const errorMatch = content.match(/\/\/ ERROR: (.+)/);
    const description = errorMatch ? errorMatch[1] : 'Generated TypeScript error';

    // Extract error code from content
    const errorCodeMatch = content.match(/\/\/ ERROR_CODE: (\w+)/);
    const errorCode = errorCodeMatch ? errorCodeMatch[1] : 'TS0000';

    const fixture: Fixture = {
      name: fixtureName,
      description: description || 'Generated TypeScript error',
      files: {
        'src.ts': content,
      },
      expectedFixes: {
        'src.ts': content, // Will be replaced by AI model
      },
      errorPattern: [errorCode || 'TS0000'],
    };

    generatedFixtures.push(fixture);

    // Create proper fixture directory structure
    const fixtureDir = path.join(tempDir, 'fixtures', fixtureName);
    await fs.mkdir(fixtureDir, { recursive: true });

    // Create all files for the fixture
    for (const [filename, fileContent] of Object.entries(fixture.files)) {
      await fs.writeFile(path.join(fixtureDir, filename), fileContent.trim(), 'utf8');
    }

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

    // Create metadata
    await fs.writeFile(
      path.join(fixtureDir, 'metadata.json'),
      JSON.stringify(
        {
          name: fixture.name,
          description: fixture.description,
          errorPattern: fixture.errorPattern,
          files: Object.keys(fixture.files),
        },
        null,
        2,
      ),
      'utf8',
    );
  }

  console.log(`🔧 Created ${generatedFixtures.length} fixtures from generated errors`);

  // Limit to first 20 fixtures for manageable runtime
  const fixturesToTest = generatedFixtures.slice(0, 20);
  console.log(`📋 Testing first ${fixturesToTest.length} fixtures`);

  for (let i = 0; i < fixturesToTest.length; i++) {
    const fixture = fixturesToTest[i];
    if (!fixture) continue;
    console.log(`\n📝 Testing fixture ${i + 1}/${fixturesToTest.length}: ${fixture.name}`);

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

          // Bail early on any error unless --no-bail flag is passed
          if (!process.argv.includes('--no-bail')) {
            console.log(`\n🛑 Bailing early due to error in fixture ${fixture.name}`);
            console.log(`Use --no-bail to continue on errors`);
            return results;
          }
        }
      } catch (error) {
        console.log(`    ❌ ${modelConfig.name}: Failed - ${error}`);

        const errorMsg = error instanceof Error ? error.message : String(error);

        // Bail early on any error unless --no-bail flag is passed
        if (!process.argv.includes('--no-bail')) {
          console.log(`\n🛑 Bailing early due to error: ${errorMsg}`);
          console.log(`Use --no-bail to continue on errors`);
          results.push({
            fixture: fixture.name,
            model: modelConfig.name,
            success: false,
            errorCountBefore: 0,
            errorCountAfter: 0,
            errorsResolved: false,
            planGenerated: false,
            errorMessage: errorMsg,
            duration: 0,
            attempts: 0,
          });
          return results;
        }

        results.push({
          fixture: fixture.name,
          model: modelConfig.name,
          success: false,
          errorCountBefore: 0,
          errorCountAfter: 0,
          errorsResolved: false,
          planGenerated: false,
          errorMessage: errorMsg,
          duration: 0,
          attempts: 0,
        });
      }
    }
  }

  return results;
}

async function findErrorFiles(dir: string): Promise<string[]> {
  const errorFiles: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      errorFiles.push(...(await findErrorFiles(fullPath)));
    } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
      // For now, assume all .ts files in the fixtures directory have errors
      // The generator was designed to create files with TypeScript errors
      errorFiles.push(fullPath);
    }
  }

  return errorFiles;
}

async function main() {
  try {
    console.log('🚀 Starting Large-Scale BuildFix Benchmark');
    console.log('==========================================');

    const results = await runLargeScaleBenchmark();

    // Generate report
    const totalTests = results.length;
    const successfulTests = results.filter((r) => r.success).length;
    const successRate = totalTests > 0 ? ((successfulTests / totalTests) * 100).toFixed(1) : '0.0';

    console.log('\n📊 Large-Scale Benchmark Summary');
    console.log('=================================');
    console.log(`Total tests: ${totalTests}`);
    console.log(`Successful: ${successfulTests}`);
    console.log(`Success rate: ${successRate}%`);

    // Save report
    const reportContent = `# Large-Scale BuildFix Benchmark Report

## Summary
- Total tests: ${totalTests}
- Successful: ${successfulTests}
- Success rate: ${successRate}%

## Results
${results.map((r) => `- ${r.fixture} with ${r.model}: ${r.success ? '✅' : '❌'} ${r.errorMessage || ''}`).join('\n')}
`;

    await fs.writeFile('./large-buildfix-benchmark-report.md', reportContent);
    console.log('📄 Report saved to ./large-buildfix-benchmark-report.md');
  } catch (error) {
    console.error('Benchmark failed:', error);
  }
}

if (process.argv[1] === import.meta.url.replace('file://', '')) {
  main().catch(console.error);
}
