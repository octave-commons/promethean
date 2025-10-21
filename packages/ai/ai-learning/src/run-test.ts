// Simple test runner
import { testEidolonIntegration } from './test-eidolon-integration.js';

console.log('Starting test runner...');
testEidolonIntegration()
  .then(() => {
    console.log('Test completed');
  })
  .catch((error) => {
    console.error('Test failed:', error);
  });
