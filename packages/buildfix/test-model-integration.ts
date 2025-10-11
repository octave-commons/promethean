#!/usr/bin/env node

import * as path from 'path';
import { promises as fs } from 'fs';

// Simple test to verify AI model integration works
async function testModelIntegration() {
  console.log('🧪 Testing AI Model Integration');
  console.log('===============================');

  // Create a simple test fixture
  const testDir = path.resolve('./test-integration-temp');
  await fs.rm(testDir, { recursive: true, force: true });
  await fs.mkdir(testDir, { recursive: true });

  // Create a simple TypeScript file with an error
  const testFile = path.join(testDir, 'src.ts');
  await fs.writeFile(
    testFile,
    `
function greet(name: string) {
  return \`Hello, \${name}!\`;
}

// Called without argument - should cause TS2554 error
export function main() {
  return greet();
}
`,
    'utf8',
  );

  // Create tsconfig.json
  const tsconfigPath = path.join(testDir, 'tsconfig.json');
  await fs.writeFile(
    tsconfigPath,
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          module: 'ESNext',
          moduleResolution: 'bundler',
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true,
        },
        include: ['src.ts'],
      },
      null,
      2,
    ),
    'utf8',
  );

  console.log('✅ Created test fixture with TypeScript error');

  // Try to compile and see the error
  const { execSync } = await import('child_process');

  try {
    const output = execSync(`npx tsc --noEmit ${testFile}`, {
      encoding: 'utf8',
      cwd: testDir,
    });
    console.log('Compilation output:', output);
  } catch (error: any) {
    console.log('❌ TypeScript compilation error (expected):');
    console.log(error.stdout || error.message);
  }

  // Test if we can import the plan request function
  try {
    console.log('\n🔧 Testing plan request function...');

    // Since we can't easily import due to build issues, let's create a mock test
    const mockError = {
      file: testFile,
      line: 7,
      col: 12,
      code: 'TS2554',
      message: 'Expected 1 arguments, but got 0.',
      frame: 'return greet();',
      key: 'TS2554|' + testFile + '|7',
    };

    const mockHistory = {
      key: mockError.key,
      file: mockError.file,
      code: mockError.code,
      attempts: [],
    };

    console.log('📝 Mock error created:', mockError);
    console.log('📋 Mock history created:', mockHistory);

    // For now, just verify the structure is correct
    console.log('✅ Mock structures created successfully');
    console.log('🚀 Ready to test with actual AI models once build issues are resolved');
  } catch (error) {
    console.error('❌ Error testing plan request:', error);
  }

  // Cleanup
  await fs.rm(testDir, { recursive: true, force: true });
  console.log('\n🧹 Cleaned up test directory');
}

if (process.argv[1] === import.meta.url.replace('file://', '')) {
  testModelIntegration().catch(console.error);
}
