#!/usr/bin/env node

import * as path from 'path';
import { promises as fs } from 'fs';
import { BuildFixBenchmark, models, type BenchmarkResult } from './index.js';

async function runLargeScaleBenchmark(): Promise<BenchmarkResult[]> {
  const tempDir = path.resolve('./large-benchmark-temp');
  const results: BenchmarkResult[] = [];

  // Setup temp directory with generated errors
  await fs.rm(tempDir, { recursive: true, force: true });
  await fs.mkdir(tempDir, { recursive: true });

  // Copy the benchmark-fixtures directory to our temp directory
  const sourceDir = path.resolve('./benchmark-fixtures');
  const targetDir = path.join(tempDir, 'fixtures');

  console.log('📁 Copying generated error fixtures...');
  await copyDirectory(sourceDir, targetDir);

  // Find all TypeScript files with errors
  const errorFiles = await findErrorFiles(targetDir);
  console.log(`📊 Found ${errorFiles.length} TypeScript files with errors`);

  console.log(
    `🚀 Running large-scale benchmark with ${errorFiles.length} error files and ${models.length} models...`,
  );

  for (let i = 0; i < Math.min(errorFiles.length, 50); i++) {
    // Limit to first 50 for demo
    const filePath = errorFiles[i];
    console.log(
      `\n📝 Testing file ${i + 1}/${Math.min(errorFiles.length, 50)}: ${path.relative(tempDir, filePath)}`,
    );

    for (const modelConfig of models) {
      console.log(`  🤖 Testing model: ${modelConfig.name}...`);

      const result: BenchmarkResult = {
        fixture: path.relative(tempDir, filePath),
        model: modelConfig.name,
        success: false,
        errorCountBefore: 1,
        errorCountAfter: 1,
        errorsResolved: false,
        planGenerated: false,
        duration: 0,
        attempts: 0,
        errorMessage: 'Large-scale benchmark demo mode',
      };

      results.push(result);

      const status = result.success ? '✅' : '❌';
      const errors = `${result.errorCountBefore}→${result.errorCountAfter}`;
      const plan = result.planGenerated ? '📋' : '❌';
      const resolved = result.errorsResolved ? '🎯' : '❌';

      console.log(`    ${status} ${modelConfig.name}: ${errors} ${plan} ${resolved} (demo)`);
    }
  }

  return results;
}

async function copyDirectory(src: string, dest: string): Promise<void> {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function findErrorFiles(dir: string): Promise<string[]> {
  const errorFiles: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      errorFiles.push(...(await findErrorFiles(fullPath)));
    } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
      // Check if this file has TypeScript errors
      try {
        const { execSync } = require('child_process');
        execSync(`npx tsc --noEmit "${fullPath}"`, {
          encoding: 'utf8',
          cwd: path.dirname(fullPath),
          stdio: 'pipe',
        });
        // No errors
      } catch (error: any) {
        // Has errors
        if (error.stdout && error.stdout.includes('error TS')) {
          errorFiles.push(fullPath);
        }
      }
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