import { retry } from './dist/utils/index.js';

const attempts = { count: 0 };
const alwaysFailingFunction = async () => {
  attempts.count++;
  console.log(`Attempt ${attempts.count}`);
  throw new Error(`Always fails, attempt ${attempts.count}`);
};

retry(alwaysFailingFunction, 3, 10).catch((error) => {
  console.log('Final error:', error.message);
  console.log('Total attempts:', attempts.count);
});
