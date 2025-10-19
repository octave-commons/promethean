#!/usr/bin/env node

/**
 * Simple test runner for dual store real-world test
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 Testing dual store real-world functionality...');

async function runTest() {
  try {
    // Change to the opencode-client directory
    process.chdir(join(__dirname, 'packages', 'opencode-client'));

    // Run the test using AVA directly
    const testProcess = spawn(
      'npx',
      [
        'ava',
        '--files=src/tests/dual-store-real-world.test.ts',
        '--timeout=180000', // 3 minutes
        '--serial',
      ],
      {
        stdio: 'inherit',
        shell: true,
      },
    );

    return new Promise((resolve, reject) => {
      testProcess.on('exit', (code) => {
        if (code === 0) {
          console.log('✅ Test completed successfully!');
          resolve(code);
        } else {
          console.log(`❌ Test failed with exit code: ${code}`);
          reject(new Error(`Test failed with exit code: ${code}`));
        }
      });

      testProcess.on('error', (error) => {
        console.error('❌ Test process error:', error);
        reject(error);
      });
    });
  } catch (error) {
    console.error('❌ Error running test:', error);
    process.exit(1);
  }
}

runTest()
  .then(() => {
    console.log('🎉 Dual store real-world test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test failed:', error.message);
    process.exit(1);
  });
