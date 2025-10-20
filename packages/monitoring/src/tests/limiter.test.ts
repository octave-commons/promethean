import test from "ava";

import { TokenBucket } from "../limiter.js";

type FakeClock = Readonly<{
  now: () => number;
  advance: (ms: number) => number;
}>;

/* eslint-disable functional/no-let */
const createClock = (): FakeClock => {
  let now = 0;
  return {
    now: () => now,
    advance: (ms: number) => {
      now += ms;
      return now;
    },
  };
};
/* eslint-enable functional/no-let */

// ensure TokenBucket enforces capacity and returns deficit
test("TokenBucket enforces capacity", (t) => {
  const clock = createClock();
  const bucket = new TokenBucket({
    capacity: 5,
    refillPerSec: 1,
    now: clock.now,
  });
  t.true(bucket.tryConsume(3));
  t.false(bucket.tryConsume(3));
  t.true(Math.abs(bucket.deficit(3) - 1) < 1e-6);
});

// ensure tokens refill over time
test("TokenBucket refills over time", (t) => {
  const clock = createClock();
  const bucket = new TokenBucket({
    capacity: 1,
    refillPerSec: 1,
    now: clock.now,
  });
  t.true(bucket.tryConsume());
  t.false(bucket.tryConsume());
  clock.advance(1100);
  t.true(bucket.tryConsume());
});

test("TokenBucket limits and refills with capacity 2", (t) => {
  const clock = createClock();
  const bucket = new TokenBucket({
    capacity: 2,
    refillPerSec: 1,
    now: clock.now,
  });
  t.true(bucket.tryConsume());
  t.true(bucket.tryConsume());
  t.false(bucket.tryConsume());
  const deficit = bucket.deficit();
  t.true(deficit > 0);
  clock.advance(1100);
  t.true(bucket.tryConsume());
});

test("TokenBucket drain empties remaining tokens", (t) => {
  const clock = createClock();
  const bucket = new TokenBucket({
    capacity: 5,
    refillPerSec: 1,
    now: clock.now,
  });
  t.true(bucket.tryConsume(2));
  const drained = bucket.drain();
  t.is(drained, 3);
  t.false(bucket.tryConsume());
});
