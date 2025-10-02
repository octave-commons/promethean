# Throttled DataChannel Sender

Pure factory that yields an async sender respecting `bufferedAmountLowThreshold`.

```ts
export const makeThrottledSender = (ch: RTCDataChannel, threshold = 1 << 20) => {
  ch.bufferedAmountLowThreshold = threshold;
  let waiters: Array<() => void> = [];
  const flush = () => { const q = waiters; waiters = []; q.forEach(fn => fn()); };
  ch.addEventListener('bufferedamountlow', flush);
  const waitLow = () => new Promise<void>(resolve => {
    if (ch.bufferedAmount <= ch.bufferedAmountLowThreshold) return resolve();
    waiters = [...waiters, resolve];
  });
  return async (chunk: ArrayBuffer | Uint8Array) => {
    if (ch.readyState !== 'open') return;
    if (ch.bufferedAmount > ch.bufferedAmountLowThreshold) await waitLow();
    ch.send(chunk as any);
  };
};
```

- Default threshold is ~1 MiB (`1 << 20`).
- No mutation outside the closure; easy to unit test by faking the channel.