import { retry } from './dist/utils/index.js';

async function test() {
  const attempts = { count: 0 };
  const failingFunction = async () => {
    attempts.count++;
    throw new Error('Fails immediately');
  };

  try {
    await retry(failingFunction, 0, 10);
  } catch (error) {
    console.log('Error message:', error.message);
    console.log('Attempts count:', attempts.count);
  }
}

test();
