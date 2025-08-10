import test from "ava";
import { TokenBucket } from "../shared/js/prom-lib/dist/rate/limiter.js";

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
