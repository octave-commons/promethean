import { sleep } from "./sleep.js";

export type RetryOptions = {
    attempts?: number; // total attempts including the initial one
    delayMs?: number; // base delay in ms
    backoff?: (attempt: number) => number; // compute delay before next attempt
    shouldRetry?: (err: unknown, attempt: number) => boolean; // return false to stop retrying
    onRetry?: (err: unknown, attempt: number, nextDelayMs: number) => void | Promise<void>;
};

export async function retry<T>(operation: () => Promise<T>, opts: RetryOptions = {}): Promise<T> {
    const { attempts = 3, delayMs = 100, backoff, shouldRetry, onRetry } = opts;
    const maxAttempts = Math.max(1, attempts | 0);
    const run = async (n: number): Promise<T> => {
        try {
            return await operation();
        } catch (err) {
            if (n >= maxAttempts || (shouldRetry && !shouldRetry(err, n))) throw err;
            const wait = Math.max(0, (backoff ? backoff(n) : delayMs * n) | 0);
            if (onRetry) await onRetry(err, n, wait);
            if (wait > 0) await sleep(wait);
            return run(n + 1);
        }
    };
    return run(1);
}
