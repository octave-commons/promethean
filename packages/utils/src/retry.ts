import { sleep } from './sleep.js';

/**
 * Configuration values that tune the {@link retry} helper.
 *
 * All options are optional so callers can opt-in to only the behaviours they need.
 * The defaults provide three total attempts with a linear delay that increases by
 * {@link RetryOptions.delayMs} for each retry.
 */
export type RetryOptions = {
  /** Total attempts including the initial invocation. Defaults to `3`. */
  attempts?: number;
  /** Base delay in milliseconds used by the default linear backoff strategy. */
  delayMs?: number;
  /**
   * Override the delay calculation. Receives the attempt number (starting at 1) and should
   * return the number of milliseconds to wait before the next retry.
   */
  backoff?: (attempt: number) => number;
  /**
   * Decide whether a thrown error should trigger another attempt. Returning `false` short-circuits
   * the retry loop and immediately rethrows the error.
   */
  shouldRetry?: (err: unknown, attempt: number) => boolean;
  /**
   * Observe retry attempts. Useful for logging or metrics when retries are triggered.
   */
  onRetry?: (err: unknown, attempt: number, nextDelayMs: number) => void | Promise<void>;
};

/**
 * Execute an async operation and retry on failure according to the provided {@link RetryOptions}.
 *
 * The helper always performs at least one attempt. Between retries it optionally waits for a delay
 * (using {@link sleep}) that is either computed via the custom {@link RetryOptions.backoff} or by a
 * simple linear progression based on {@link RetryOptions.delayMs}. Errors that exhaust the configured
 * attempts, or that are filtered out by {@link RetryOptions.shouldRetry}, are rethrown to the caller.
 */
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
