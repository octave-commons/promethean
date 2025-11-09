import { viewFile, resolvePath } from './packages/mcp/dist/files.js';

const ROOT_PATH = process.cwd();
const testPath = 'AGENTS.md';

console.log('🔍 Debugging viewFile function...');

try {
  console.log('\n📁 Testing resolvePath...');
  const resolvedPath = await resolvePath(ROOT_PATH, testPath);
  console.log('✅ Resolved path:', resolvedPath);

  console.log('\n📄 Testing viewFile...');
  const result = await viewFile(ROOT_PATH, testPath);
  console.log('✅ viewFile result:', result);
} catch (error) {
  console.log('❌ Error:', error.message);
  console.log('Stack:', error.stack);
}
