// Debug the file resolution issue
import path from 'path';
import fs from 'fs';

// Simulate the MCP file resolution logic
const ROOT_PATH = process.env.MCP_ROOT_PATH || process.cwd();
console.log(`ROOT_PATH: ${ROOT_PATH}`);

const testFile = 'AGENTS.md';
console.log(`Looking for: ${testFile}`);

// Check if file exists directly
const directPath = path.resolve(ROOT_PATH, testFile);
console.log(`Direct path: ${directPath}`);
console.log(`File exists directly: ${fs.existsSync(directPath)}`);

// Test the validation step by step
async function debugValidation() {
  try {
    // Import the validation functions
    const { validateMcpOperation } = await import(
      '../packages/mcp/src/validation/comprehensive.ts'
    );

    console.log('\n=== Testing validation ===');
    const validationResult = await validateMcpOperation(ROOT_PATH, testFile, 'read');
    console.log(`Validation result:`, validationResult);

    if (validationResult.valid) {
      console.log(`Sanitized path: ${validationResult.sanitizedPath}`);

      // Test normalizeToRoot
      const { normalizeToRoot, isInsideRoot } = await import('../packages/mcp/src/files.ts');

      const normalizedPath = normalizeToRoot(ROOT_PATH, validationResult.sanitizedPath);
      console.log(`Normalized path: ${normalizedPath}`);
      console.log(`Is inside root: ${isInsideRoot(ROOT_PATH, normalizedPath)}`);

      // Check if it's a file
      try {
        const stats = await fs.stat(normalizedPath);
        console.log(`Is file: ${stats.isFile()}`);
        console.log(`File stats:`, stats);
      } catch (error) {
        console.log(`Stat error: ${error.message}`);
      }
    }
  } catch (error) {
    console.log(`Validation error: ${error.message}`);
    console.log(`Stack: ${error.stack}`);
  }
}

// List files in current directory to see what's available
console.log('\n=== Files in current directory ===');
try {
  const files = fs.readdirSync(ROOT_PATH);
  const agentsFiles = files.filter((f) => f.includes('AGENT'));
  console.log('Files containing AGENT:', agentsFiles);
  console.log('All files:', files.slice(0, 20), `... (${files.length} total)`);
} catch (error) {
  console.log(`Error reading directory: ${error.message}`);
}

debugValidation().catch(console.error);
