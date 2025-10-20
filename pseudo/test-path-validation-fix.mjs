// Test script to verify path validation fix
const { validateFilePath } = require('./packages/omni/omni-service/src/adapters/mcp.ts');

// Test cases that should be allowed
const allowedPaths = [
  '.',
  './',
  './file.txt',
  'dir/.hidden',
  './src/components',
  '',
  'file.txt',
  'src/app.ts',
];

// Test cases that should be blocked
const blockedPaths = [
  '..',
  '../file.txt',
  '../../etc/passwd',
  'dir/../../../etc',
  '/etc/passwd',
  'C:\\Windows\\System32',
];

console.log('Testing allowed paths:');
allowedPaths.forEach((path) => {
  const result = validateFilePath(path);
  console.log(
    `${JSON.stringify(path)}: ${result.valid ? '✅ ALLOWED' : '❌ BLOCKED'} ${result.error || ''}`,
  );
});

console.log('\nTesting blocked paths:');
blockedPaths.forEach((path) => {
  const result = validateFilePath(path);
  console.log(
    `${JSON.stringify(path)}: ${result.valid ? '❌ ALLOWED (should be blocked)' : '✅ BLOCKED'} ${result.error || ''}`,
  );
});
