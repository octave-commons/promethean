import { validateMcpOperation } from './packages/mcp/src/validation/index.js';
import { normalizeToRoot, isInsideRoot, resolvePath } from './packages/mcp/src/files.js';
import * as path from 'node:path';

async function debugMcp() {
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
      return;
    }

    console.log('🎯 Sanitized path:', validationResult.sanitizedPath);
    console.log(
      '🎯 Is absolute?',
      require('node:path').isAbsolute(validationResult.sanitizedPath!),
    );

    // Step 2: Test normalizeToRoot
    console.log('\n2️⃣ Testing normalizeToRoot...');
    try {
      const normalized = normalizeToRoot(ROOT_PATH, validationResult.sanitizedPath!);
      console.log('✅ Normalized:', normalized);
    } catch (error) {
      console.log('❌ Normalize error:', error.message);
    }

    // Step 3: Test resolvePath
    console.log('\n3️⃣ Testing resolvePath...');
    const resolved = await resolvePath(ROOT_PATH, testPath);
    console.log('✅ Resolved:', resolved);
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('Stack:', error.stack);
  }
}

debugMcp();
