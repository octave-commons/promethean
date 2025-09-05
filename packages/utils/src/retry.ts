export type RetryOptions = {
    attempts?: number; // total attempts including the initial one
    delayMs?: number; // base delay in ms
    backoff?: (attempt: number) => number; // compute delay before next attempt
};

import { sleep } from "./sleep.js";

export async function retry<T>(operation: () => Promise<T>, opts: RetryOptions = {}): Promise<T> {
    const { attempts = 3, delayMs = 100, backoff } = opts;
    let attempt = 0;
    // attempt counts failures so far; run until success or attempts exhausted
    while (true) {
        try {
            return await operation();
        } catch (err) {
            attempt++;
            if (attempt >= attempts) throw err;
            const wait = backoff ? backoff(attempt) : delayMs * attempt;
            if (wait > 0) await sleep(wait);
        }
    }
}
