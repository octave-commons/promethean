import test from "ava";
import { retry } from "../retry.js";

// ensure retry succeeds after transient failures
// use small delays for fast tests

test("retries until success", async (t) => {
    let attempts = 0;
    const result = await retry(async () => {
        attempts++;
        if (attempts < 3) throw new Error("fail");
        return "ok";
    }, { attempts: 5, delayMs: 1 });
    t.is(result, "ok");
    t.is(attempts, 3);
});

test("throws after max attempts", async (t) => {
    let attempts = 0;
    await t.throwsAsync(() => retry(async () => {
        attempts++;
        throw new Error("fail");
    }, { attempts: 3, delayMs: 1 }));
    t.is(attempts, 3);
});
