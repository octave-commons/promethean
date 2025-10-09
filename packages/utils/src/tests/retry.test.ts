/* eslint functional/immutable-data: "off", functional/no-let: "off", functional/prefer-immutable-types: "off", @typescript-eslint/require-await: "off" */
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

test("passes backoff-computed delay to onRetry", async (t) => {
    const recordedDelays: number[] = [];
    const seenErrors: unknown[] = [];
    const err = new Error("boom");

    await t.throwsAsync(() => retry(async () => {
        throw err;
    }, {
        attempts: 4,
        delayMs: 0,
        backoff: (attempt) => attempt * 7,
        onRetry: (error, attempt, nextDelayMs) => {
            recordedDelays.push(nextDelayMs);
            seenErrors.push(error);
            t.is(attempt, recordedDelays.length);
        },
    }));

    t.deepEqual(recordedDelays, [7, 14, 21]);
    t.true(seenErrors.every((value) => value === err));
});

test("awaits async onRetry before next attempt", async (t) => {
    let onRetryActive = false;
    let attempts = 0;

    await t.throwsAsync(() => retry(async () => {
        t.false(onRetryActive);
        attempts += 1;
        throw new Error("fail");
    }, {
        attempts: 3,
        delayMs: 0,
        onRetry: async () => {
            onRetryActive = true;
            await Promise.resolve();
            onRetryActive = false;
        },
    }));

    t.is(attempts, 3);
});
