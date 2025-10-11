#!/usr/bin/env node

import { promises as fs } from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple test to verify our fixtures work in isolation
async function testFixturesIsolated() {
  const fixturesDir = path.join(__dirname, '../../benchmark-fixtures');

  console.log('🧪 Testing TypeScript error fixtures in isolation...');

  // Check if fixtures directory exists
  try {
    await fs.access(fixturesDir);
  } catch {
    console.log('❌ Fixtures directory not found. Run generate-simple-fixtures.ts first.');
    return;
  }

  // Get all fixture files
  const files = await fs.readdir(fixturesDir);
  const tsFiles = files.filter((f) => f.endsWith('.ts'));

  console.log(`📁 Found ${tsFiles.length} TypeScript fixture files`);

  // Test each file individually with a clean TypeScript compilation
  let successCount = 0;
  let errorCount = 0;

  for (const file of tsFiles) {
    const filePath = path.join(fixturesDir, file);

    try {
      // Use a minimal TypeScript configuration to avoid node_modules contamination
      const result = execSync(
        `npx --yes tsc@5.3.3 --noEmit --strict --target ES2022 --module ESNext --skipLibCheck "${filePath}"`,
        {
          cwd: fixturesDir,
          encoding: 'utf8',
          timeout: 10000,
          stdio: 'pipe',
        },
      );

      // If we get here, there were no errors - this might be unexpected
      console.log(`⚠️  ${file}: No errors detected (might be unexpected)`);
    } catch (error: any) {
      const stderr = error.stderr || error.stdout || '';
      if (stderr.includes('error')) {
        // Extract error codes from output
        const errorMatches = stderr.match(/TS\d+/g) || [];
        const uniqueErrors = [...new Set(errorMatches)];

        if (uniqueErrors.length > 0) {
          console.log(
            `✅ ${file}: Generated ${uniqueErrors.length} unique error(s): ${uniqueErrors.join(', ')}`,
          );
          successCount++;
        } else {
          console.log(`⚠️  ${file}: Compilation failed but no TS error codes found`);
          errorCount++;
        }
      } else {
        console.log(`❌ ${file}: Unexpected error: ${stderr.slice(0, 100)}...`);
        errorCount++;
      }
    }
  }

  console.log(`\n📊 Test Results:`);
  console.log(`✅ Successfully generated errors: ${successCount}/${tsFiles.length}`);
  console.log(`❌ Failed or unexpected: ${errorCount}/${tsFiles.length}`);

  if (successCount > 0) {
    console.log(`\n🎯 Fixtures are working! Ready for buildfix benchmarking.`);
  } else {
    console.log(
      `\n⚠️  No fixtures generated expected errors. May need to adjust fixture generation.`,
    );
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  testFixturesIsolated().catch(console.error);
}
