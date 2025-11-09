// Test the specific MCP path validation issue mentioned by user
import { validatePathSecurity } from '../packages/mcp/src/validation/comprehensive.ts';

// Test the exact cases mentioned in the issue
const testCases = [
  { path: '.', expected: true, description: 'Current directory (.)' },
  { path: '', expected: true, description: 'Empty string' },
  { path: '/', expected: false, description: 'Root slash (should be blocked as absolute)' },
];

console.log('Testing specific MCP path validation cases:\n');

testCases.forEach(({ path, expected, description }) => {
  const result = validatePathSecurity(path);
  const actual = result.valid;
  const status = actual === expected ? '✅ PASS' : '❌ FAIL';

  console.log(`${description}:`);
  console.log(`  Path: ${JSON.stringify(path)}`);
  console.log(`  Expected: ${expected ? 'ALLOWED' : 'BLOCKED'}`);
  console.log(`  Actual: ${actual ? 'ALLOWED' : 'BLOCKED'}`);
  console.log(`  Status: ${status}`);

  if (!actual && result.securityIssues) {
    console.log(`  Issues: ${result.securityIssues.join(', ')}`);
  }
  console.log('');
});

// Test the specific error case
console.log('Testing the original error case:');
const dotResult = validatePathSecurity('.');
console.log(`Path "." validation: ${dotResult.valid ? '✅ ALLOWED' : '❌ BLOCKED'}`);
if (!dotResult.valid && dotResult.securityIssues) {
  console.log(`Security issues: ${dotResult.securityIssues.join(', ')}`);
  console.log('This is the bug that was causing the "Path traversal attempt detected" error');
}
