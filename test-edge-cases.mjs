import { viewFile } from './packages/mcp/dist/files.js';

async function testCase(description, path) {
  try {
    console.log(`\n🔍 ${description}: "${path}"`);
    const result = await viewFile(process.cwd(), path);
    console.log('✅ Success - Path:', result.path, 'Lines:', result.totalLines);
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

async function runTests() {
  await testCase('Current directory', '.');
  await testCase('Empty string', '');
  await testCase('Root slash', '/');
  await testCase('Normal file', 'AGENTS.md');
  await testCase('Nested file', 'packages/mcp/src/files.ts');
  await testCase('Dangerous traversal', '../../../etc/passwd');
  await testCase('Mixed traversal', 'packages/../../../etc/passwd');
}

runTests();
