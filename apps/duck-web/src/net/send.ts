export const makeThrottledSender = (
  ch: RTCDataChannel,
  threshold = 1 << 20,
) => {
  ch.bufferedAmountLowThreshold = threshold;
  let waiters: ReadonlyArray<() => void> = [];
  const flush = () => {
    const queue = [...waiters];
    waiters = [];
    queue.forEach((fn) => fn());
  };

  const flush = () => {
    const queue = [...waiters];
    waiters = [];
    queue.forEach((fn) => fn());
  };

  ch.addEventListener("bufferedamountlow", flush);

  const waitLow = () =>
    new Promise<void>((resolve) => {
      if (ch.bufferedAmount <= ch.bufferedAmountLowThreshold) {
        resolve();
        return;
      }

      waiters = [...waiters, resolve];
    });

  return async (chunk: ArrayBuffer | Uint8Array) => {
    if (ch.readyState !== "open") {
      return;
    }

    if (ch.bufferedAmount > ch.bufferedAmountLowThreshold) {
      await waitLow();
    }

    ch.send(chunk);
  };
};
