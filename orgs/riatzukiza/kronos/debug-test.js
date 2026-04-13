// Simple test to debug the issue
import { validatePathSecurity } from './src/validation/comprehensive.js';

console.log('Testing validation...');

try {
  const result = validatePathSecurity('../../../etc/passwd');
  console.log('Validation result:', result);
} catch (error) {
  console.error('Error:', error);
}
