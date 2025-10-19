#!/usr/bin/env node

import * as path from 'path';
import { promises as fs } from 'fs';

async function debugBenchmark() {
  console.log('🔍 Debugging benchmark setup...\n');

  const tempDir = './debug-temp';
  const fixtureDir = path.join(tempDir, 'fixture');

  await fs.mkdir(fixtureDir, { recursive: true });

  // Create test file with error
  const testCode = `export function main() {
  return undefinedVar;
}`;

  await fs.writeFile(path.join(fixtureDir, 'src.ts'), testCode, 'utf8');

  // Create tsconfig
  const tsconfig = {
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
  };

  await fs.writeFile(
    path.join(fixtureDir, 'tsconfig.json'),
    JSON.stringify(tsconfig, null, 2),
    'utf8',
  );

  console.log(`📁 Created fixture at: ${fixtureDir}`);
  console.log(`📄 File content:`);
  console.log(testCode);
  console.log(`\n⚙️  Tsconfig:`);
  console.log(JSON.stringify(tsconfig, null, 2));

  // Test TypeScript compilation
  const { tsc } = await import('./packages/buildfix/src/utils.js');
  const tsconfigPath = path.join(fixtureDir, 'tsconfig.json');

  console.log(`\n🔨 Running TypeScript on: ${tsconfigPath}`);

  try {
    const result = await tsc(tsconfigPath);
    console.log(`\n📊 Results:`);
    console.log(`   Errors found: ${result.diags.length}`);

    if (result.diags.length > 0) {
      result.diags.forEach((diag, i) => {
        console.log(
          `   ${i + 1}. ${diag.code}: ${diag.message} (${diag.file}:${diag.line}:${diag.col})`,
        );
      });
    } else {
      console.log(`   No errors detected!`);
    }

    // Test with different include patterns
    console.log(`\n🔍 Testing files in directory:`);
    const files = await fs.readdir(fixtureDir);
    console.log(`   Files: ${files.join(', ')}`);
  } catch (error) {
    console.log(`❌ TypeScript compilation failed: ${error}`);
  }

  // Cleanup
  await fs.rm(tempDir, { recursive: true, force: true });
}

debugBenchmark().catch(console.error);
