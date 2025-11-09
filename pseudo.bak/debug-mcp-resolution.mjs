import { validateMcpOperation } from './packages/mcp/dist/validation/index.js';
import { normalizeToRoot, isInsideRoot } from './packages/mcp/dist/files.js';

const ROOT_PATH = process.cwd();
const testPath = 'AGENTS.md';

console.log('🔍 Debugging MCP path resolution...');
console.log('📁 Root path:', ROOT_PATH);
console.log('📄 Test path:', testPath);

try {
  // Step 1: Validation
  console.log('\n1️⃣ Validating path...');
  const validationResult = await validateMcpOperation(ROOT_PATH, testPath, 'read');
  console.log('✅ Validation result:', validationResult);

  if (!validationResult.valid) {
    console.log('❌ Validation failed:', validationResult.error);
    process.exit(1);
  }

  // Step 2: Normalization
  console.log('\n2️⃣ Normalizing path...');
  const normalizedPath = normalizeToRoot(ROOT_PATH, validationResult.sanitizedPath);
  console.log('✅ Normalized path:', normalizedPath);

  // Step 3: Check if inside root
  console.log('\n3️⃣ Checking if inside root...');
  const insideRoot = isInsideRoot(ROOT_PATH, normalizedPath);
  console.log('✅ Inside root:', insideRoot);

  // Step 4: Check if file exists
  console.log('\n4️⃣ Checking file existence...');
  const fs = await import('node:fs/promises');
  try {
    const stats = await fs.stat(normalizedPath);
    console.log('✅ File exists, isFile:', stats.isFile());
  } catch (error) {
    console.log('❌ File does not exist:', error.message);
  }
} catch (error) {
  console.log('❌ Error:', error.message);
  console.log('Stack:', error.stack);
}
