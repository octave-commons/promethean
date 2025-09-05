import test from "ava";

import { retry } from "../index.js";

// ensure retry succeeds after transient failures
// use small delays for fast tests

test("retries until success", async (t) => {
    const calls: number[] = [];
    const result = await retry(async () => {
        calls.push(1);
        if (calls.length < 3) throw new Error("fail");
        return "ok";
    }, { attempts: 5, delayMs: 1 });
    t.is(result, "ok");
    t.is(calls.length, 3);
});

test("throws after max attempts", async (t) => {
    const calls: number[] = [];
    await t.throwsAsync(() => retry(async () => {
        calls.push(1);
        throw new Error("fail");
    }, { attempts: 3, delayMs: 1 }));
    t.is(calls.length, 3);
});

test("shouldRetry can stop retries", async (t) => {
    const calls: number[] = [];
    await t.throwsAsync(() => retry(async () => {
        calls.push(1);
        throw new Error("fail");
    }, { attempts: 5, delayMs: 1, shouldRetry: () => false }));
    t.is(calls.length, 1);
});
