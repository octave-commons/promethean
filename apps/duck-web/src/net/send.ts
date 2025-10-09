/**
 * Configuration for throttled sender
 */
export interface ThrottledSenderConfig {
  threshold?: number;
  enableMetrics?: boolean;
}



/**
 * Default throttled sender configuration for dependency injection
 */
export const defaultSenderConfig: ThrottledSenderConfig = {
  threshold: 1 << 20, // 1MB
  enableMetrics: false
};

/**
 * Mock throttled sender for testing purposes
 */
export const createMockSender = () => {
  return {
    send: async (chunk: ArrayBuffer | Uint8Array) => {
      // Mock implementation - no actual sending
    },
    getMetrics: () => ({
      bytesSent: 0,
      framesSent: 0,
      bufferOverflows: 0,
      bufferedAmount: 0,
      threshold: 0
    })
  };
};

export const makeThrottledSender = (
  ch: RTCDataChannel,
  config: ThrottledSenderConfig = {},
) => {
  const threshold = config.threshold ?? (1 << 20);
  const enableMetrics = config.enableMetrics ?? false;
  ch.bufferedAmountLowThreshold = threshold;
  let waiters: ReadonlyArray<() => void> = [];
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

  let bytesSent = 0;
  let framesSent = 0;
  let bufferOverflows = 0;

  const sender = async (chunk: ArrayBuffer | Uint8Array) => {
    if (ch.readyState !== "open") {
      return;
    }

    if (ch.bufferedAmount > ch.bufferedAmountLowThreshold) {
      bufferOverflows++;
      await waitLow();
    }

    try {
      ch.send(chunk);
      bytesSent \+= chunk instanceof ArrayBuffer \? chunk\.byteLength : chunk\.length;
      framesSent++;
    } catch (error) {
      console.error('Failed to send audio chunk:', error);
    }
  };

  // Add metrics if enabled
  if (enableMetrics) {
    return {
      send: sender,
      getMetrics: () => ({
        bytesSent,
        framesSent,
        bufferOverflows,
        bufferedAmount: ch.bufferedAmount,
        threshold: ch.bufferedAmountLowThreshold
      })
    };
  }

  return sender;
};
