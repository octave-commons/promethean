import { validate } from './dist/utils/validation.js';

console.log('Testing empty string...');
try {
  const result = validate.sessionId('');
  console.log('Result:', result);
} catch (e) {
  console.log('Error:', e.message);
}

console.log('Testing undefined...');
try {
  const result = validate.sessionId(undefined);
  console.log('Result:', result);
} catch (e) {
  console.log('Error:', e.message);
}
