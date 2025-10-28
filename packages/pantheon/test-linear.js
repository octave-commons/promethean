import { retry } from './dist/utils/index.js';

const timestamps = [];
const flakyFunction = async () => {
  timestamps.push(Date.now());
  throw new Error('Always fails');
};

retry(flakyFunction, 3, 10, 'linear').catch((error) => {
  console.log('Final error:', error.message);
  console.log('Timestamps length:', timestamps.length);
  console.log('Timestamps:', timestamps);
});
