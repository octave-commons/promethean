import test from 'ava';
import { TokenBucket } from './limiter.js';

// ensure TokenBucket enforces capacity and returns deficit
test('TokenBucket enforces capacity', (t) => {
    const bucket = new TokenBucket({ capacity: 5, refillPerSec: 1 });
    t.true(bucket.tryConsume(3));
    t.false(bucket.tryConsume(3));
    t.is(bucket.deficit(3), 1);
});

// ensure tokens refill over time
test('TokenBucket refills over time', async (t) => {
    t.timeout?.(5000);
    const bucket = new TokenBucket({ capacity: 1, refillPerSec: 1 });
    t.true(bucket.tryConsume());
    t.false(bucket.tryConsume());
    await new Promise((r) => setTimeout(r, 1100));
    t.true(bucket.tryConsume());
});
