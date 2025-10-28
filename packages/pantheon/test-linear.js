import { retry } from './dist/utils/index.js';

async function test() {
  const timestamps = [];
  const flakyFunction = async () => {
    timestamps.push(Date.now());
    throw new Error('Always fails');
  };

  try {
    await retry(flakyFunction, 3, 10, 'linear');
  } catch (error) {
    console.log('Error message:', error.message);
    console.log('Timestamps length:', timestamps.length);
    console.log('Timestamps:', timestamps);

    if (timestamps.length >= 3) {
      const delay1 = timestamps[1] - timestamps[0];
      const delay2 = timestamps[2] - timestamps[1];
      console.log('Delay 1:', delay1);
      console.log('Delay 2:', delay2);
      console.log('Difference:', Math.abs(delay1 - delay2));
      console.log('Within variance:', Math.abs(delay1 - delay2) <= 5);
    }
  }
}

test();
