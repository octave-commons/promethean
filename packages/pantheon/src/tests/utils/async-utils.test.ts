import test from 'ava';

import { withTimeout, retry } from '../../utils/index.js';

test('withTimeout resolves before timeout', async (t) => {
  const fastPromise = new Promise<string>((resolve) => {
    setTimeout(() => resolve('fast result'), 50);
  });

  const result = await withTimeout(fastPromise, 200);

  t.is(result, 'fast result');
});

test('withTimeout rejects on timeout', async (t) => {
  const slowPromise = new Promise<string>((resolve) => {
    setTimeout(() => resolve('slow result'), 200);
  });

  await t.throwsAsync(withTimeout(slowPromise, 100), {
    message: 'Operation timed out after 100ms',
  });
});

test('withTimeout with custom timeout error', async (t) => {
  const slowPromise = new Promise<string>(() => {
    // Never resolves
  });

  const customError = new Error('Custom timeout message');

  await t.throwsAsync(withTimeout(slowPromise, 50, customError), {
    message: 'Custom timeout message',
  });
});

test('withTimeout with immediate resolution', async (t) => {
  const immediatePromise = Promise.resolve('immediate');

  const result = await withTimeout(immediatePromise, 100);

  t.is(result, 'immediate');
});

test('retry succeeds on first attempt', async (t) => {
  let attempts = 0;
  const flakyFunction = async () => {
    attempts++;
    return 'success';
  };

  const result = await retry(flakyFunction, 3, 10);

  t.is(result, 'success');
  t.is(attempts, 1);
});

test('retry succeeds after failures', async (t) => {
  let attempts = 0;
  const flakyFunction = async () => {
    attempts++;
    if (attempts < 3) {
      throw new Error(`Attempt ${attempts} failed`);
    }
    return 'success after retries';
  };

  const result = await retry(flakyFunction, 5, 10);

  t.is(result, 'success after retries');
  t.is(attempts, 3);
});

test('retry exhausts max attempts', async (t) => {
  let attempts = 0;
  const alwaysFailingFunction = async () => {
    attempts++;
    throw new Error(`Always fails, attempt ${attempts}`);
  };

  await t.throwsAsync(retry(alwaysFailingFunction, 3, 10), { message: 'Always fails, attempt 3' });
  t.is(attempts, 3);
});

test('retry with linear backoff', async (t) => {
  const timestamps: number[] = [];
  const flakyFunction = async () => {
    timestamps.push(Date.now());
    throw new Error('Always fails');
  };

  const startTime = Date.now();

  await t.throwsAsync(retry(flakyFunction, 3, 10, 'linear'), {
    message: 'Always fails, attempt 3',
  });

  // Check that delays increase linearly
  t.is(timestamps.length, 3);
  const delay1 = timestamps[1] - timestamps[0];
  const delay2 = timestamps[2] - timestamps[1];

  t.true(Math.abs(delay1 - delay2) <= 5); // Allow small variance
});

test('retry with exponential backoff', async (t) => {
  const timestamps: number[] = [];
  const flakyFunction = async () => {
    timestamps.push(Date.now());
    throw new Error('Always fails');
  };

  await t.throwsAsync(retry(flakyFunction, 3, 10, 'exponential'), {
    message: 'Always fails, attempt 3',
  });

  // Check that delays increase exponentially
  t.is(timestamps.length, 3);
  const delay1 = timestamps[1] - timestamps[0];
  const delay2 = timestamps[2] - timestamps[1];

  t.true(delay2 > delay1); // Exponential backoff should increase delays
});

test('retry with zero max retries', async (t) => {
  let attempts = 0;
  const failingFunction = async () => {
    attempts++;
    throw new Error('Fails immediately');
  };

  await t.throwsAsync(retry(failingFunction, 0, 10), { message: 'Fails immediately' });
  t.is(attempts, 1);
});

test('retry with default parameters', async (t) => {
  let attempts = 0;
  const sometimesFailingFunction = async () => {
    attempts++;
    if (attempts < 2) {
      throw new Error(`Attempt ${attempts} failed`);
    }
    return 'success';
  };

  const result = await retry(sometimesFailingFunction);

  t.is(result, 'success');
  t.is(attempts, 2);
});
