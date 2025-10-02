const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_CLOSE_CODE = 1011;
const DEFAULT_CLOSE_REASON = "enso handshake failed";

function safeStringify(value) {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function normalizeError(error) {
  if (error instanceof Error) return error;
  if (error && typeof error === "object") {
    const message = error.message ?? safeStringify(error);
    return new Error(typeof message === "string" ? message : String(message));
  }
  return new Error(String(error));
}

function stringifyReason(error) {
  return error?.message ? String(error.message) : String(error);
}

export function waitForReadyWithTimeout(
  readyPromise,
  timeoutMs = DEFAULT_TIMEOUT_MS,
) {
  if (!readyPromise || typeof readyPromise.then !== "function") {
    return Promise.reject(
      new Error("Expected a promise for handshake readiness."),
    );
  }
  if (timeoutMs <= 0 || !Number.isFinite(timeoutMs)) {
    return readyPromise;
  }
  return new Promise((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => {
      settled = true;
      reject(new Error(`ENSO handshake timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    readyPromise
      .then((value) => {
        if (settled) return;
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        if (settled) return;
        clearTimeout(timer);
        reject(error);
      });
  });
}

export function createHandshakeGuard(handle, ws, options = {}) {
  const {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    closeCode = DEFAULT_CLOSE_CODE,
    closeReason = DEFAULT_CLOSE_REASON,
    logger,
  } = options;

  let resolved = false;
  let failure = null;

  const closeHandle = () => {
    if (handle && typeof handle.close === "function") {
      Promise.resolve()
        .then(() => handle.close())
        .catch(() => {});
    }
  };

  const notifyFailure = (error) => {
    const reason = stringifyReason(error);
    logger?.error?.("ENSO handshake failed", error);
    if (ws && ws.readyState === ws?.OPEN) {
      try {
        ws.send(JSON.stringify({ type: "error", reason }));
      } catch (sendError) {
        logger?.warn?.(
          "Failed to notify browser of handshake failure",
          sendError,
        );
      }
    }
    try {
      ws?.close?.(closeCode, closeReason);
    } catch (closeError) {
      logger?.warn?.(
        "Failed to close browser socket after handshake failure",
        closeError,
      );
    }
    closeHandle();
  };

  const monitoredPromise = waitForReadyWithTimeout(handle?.ready, timeoutMs)
    .then(() => {
      resolved = true;
    })
    .catch((error) => {
      failure = normalizeError(error);
      notifyFailure(failure);
      throw failure;
    });

  monitoredPromise.catch(() => {});

  return {
    wait: async () => {
      if (failure) {
        throw failure;
      }
      await monitoredPromise;
    },
    isReady: () => resolved,
    error: () => failure,
  };
}
