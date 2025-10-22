// SPDX-License-Identifier: GPL-3.0-only
// Timers Composable - Manages timers and intervals

export type TimerManager = {
  readonly setTimer: (name: string, callback: () => void, delayMs: number) => void;
  readonly setIntervalTimer: (name: string, callback: () => void, intervalMs: number) => void;
  readonly clearTimer: (name: string) => void;
  readonly clearAllTimers: () => void;
};

export const createTimerManager = (): TimerManager => {
  const timers: Map<string, NodeJS.Timeout> = new Map();

  const setTimer = (name: string, callback: () => void, delayMs: number): void => {
    clearTimer(name);
    const timer = setTimeout(callback, delayMs);
    timers.set(name, timer);
  };

  const setIntervalTimer = (name: string, callback: () => void, intervalMs: number): void => {
    clearTimer(name);
    const timer = setInterval(callback, intervalMs);
    timers.set(name, timer);
  };

  const clearTimer = (name: string): void => {
    const timer = timers.get(name);
    if (timer) {
      clearTimeout(timer);
      clearInterval(timer);
      timers.delete(name);
    }
  };

  const clearAllTimers = (): void => {
    timers.forEach((timer) => {
      clearTimeout(timer);
      clearInterval(timer);
    });
    timers.clear();
  };

  return { setTimer, setIntervalTimer, clearTimer, clearAllTimers };
};
