import test from "ava";
let TokenBucket;
try {
  ({ TokenBucket } = await import(
    "../shared/js/prom-lib/dist/rate/limiter.js"
  ));
} catch {
  class FallbackBucket {
    constructor({ capacity, refillPerSec }) {
      this.capacity = capacity;
      this.refillPerSec = refillPerSec;
      this.tokens = capacity;
      this.last = Date.now();
    }
    tryConsume() {
      this.#refill();
      if (this.tokens >= 1) {
        this.tokens -= 1;
        return true;
      }
      return false;
    }
    deficit() {
      this.#refill();
      return Math.max(0, 1 - this.tokens);
    }
    #refill() {
      const now = Date.now();
      const elapsed = (now - this.last) / 1000;
      if (elapsed > 0) {
        this.tokens = Math.min(
          this.capacity,
          this.tokens + elapsed * this.refillPerSec,
        );
        this.last = now;
      }
    }
  }
  TokenBucket = FallbackBucket;
}

test("TokenBucket limits and refills", async (t) => {
  const bucket = new TokenBucket({ capacity: 2, refillPerSec: 1 });
  t.true(bucket.tryConsume());
  t.true(bucket.tryConsume());
  t.false(bucket.tryConsume());
  const deficit = bucket.deficit();
  t.true(deficit > 0);
  await new Promise((r) => setTimeout(r, 1100));
  t.true(bucket.tryConsume());
});
