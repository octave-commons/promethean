import test from 'ava';

import { sleep } from '@promethean/test-utils/sleep.js';

import { TokenBucket } from '../dist/limiter.js';

// ensure TokenBucket enforces capacity and returns deficit
test('TokenBucket enforces capacity', (t) => {
    const bucket = new TokenBucket({ capacity: 5, refillPerSec: 1 });
    t.true(bucket.tryConsume(3));
    t.false(bucket.tryConsume(3));
    t.true(Math.abs(bucket.deficit(3) - 1) < 1e-6);
});

// ensure tokens refill over time
test('TokenBucket refills over time', async (t) => {
    t.timeout?.(5000);
    const bucket = new TokenBucket({ capacity: 1, refillPerSec: 1 });
    t.true(bucket.tryConsume());
    t.false(bucket.tryConsume());
    await sleep(1100);
    t.true(bucket.tryConsume());
});

test('TokenBucket limits and refills with capacity 2', async (t) => {
    const bucket = new TokenBucket({ capacity: 2, refillPerSec: 1 });
    t.true(bucket.tryConsume());
    t.true(bucket.tryConsume());
    t.false(bucket.tryConsume());
    const deficit = bucket.deficit();
    t.true(deficit > 0);
    await sleep(1100);
    t.true(bucket.tryConsume());
});
