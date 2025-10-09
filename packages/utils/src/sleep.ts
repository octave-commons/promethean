/**
 * Pause execution for the provided number of milliseconds.
 *
 * The helper wraps {@link setTimeout} in a promise so async flows can await a
 * delay without introducing ad-hoc timer management. The promise always
 * resolves and never rejects.
 */
export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
