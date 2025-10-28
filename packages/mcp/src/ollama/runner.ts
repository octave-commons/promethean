import type { Task } from './task.js';

export type TaskStatus = 'succeeded' | 'failed' | 'aborted';

export type TaskOutput = Readonly<{
  logs: readonly string[];
  data?: unknown;
  error?: string;
}>;

export type TaskResult = Readonly<{
  id: string;
  startedAt: string;
  finishedAt: string;
  status: TaskStatus;
  output: TaskOutput;
}>;

export type RunTaskDependencies = Readonly<{
  fetch: typeof fetch;
  baseUrl: string;
  now?: () => Date;
}>;

export type RunTaskOptions = Readonly<{
  signal?: AbortSignal;
  timeoutMs?: number;
  debug?: boolean;
}>;

type RequestDescriptor = Readonly<{
  path: string;
  body: Record<string, unknown>;
}>;

export type DebugMetrics = Readonly<{
  tokensIn: number;
  tokensOut: number;
  durationMs: number;
}>;

type ConsumeResult = Readonly<{
  status: TaskStatus;
  data?: unknown;
  error?: string;
  aborted: boolean;
  debug?: DebugMetrics;
}>;

export type TaskStreamEvent = Readonly<{
  raw: string;
  json?: unknown;
  textDelta?: string;
  done?: boolean;
}>;

export type RunTaskSuccess = Readonly<{
  kind: 'Success';
  result: TaskResult;
  debug?: DebugMetrics;
}>;

export type RunTaskRateLimited = Readonly<{
  kind: 'RateLimited';
  retryAfterMs: number | null;
}>;

export type RunTaskTimeout = Readonly<{ kind: 'Timeout' }>;

export type RunTaskError = Readonly<{
  kind: 'Error';
  error: string;
  status?: number;
}>;

export type RunTaskResult = RunTaskSuccess | RunTaskRateLimited | RunTaskTimeout | RunTaskError;

type TaskStreamQueue = Readonly<{
  iterator: AsyncIterable<TaskStreamEvent>;
  push: (event: TaskStreamEvent) => void;
  close: () => void;
  fail: (error: unknown) => void;
}>;

export type TaskRun = Readonly<{
  stream: AsyncIterable<TaskStreamEvent>;
  result: Promise<RunTaskResult>;
}>;

const defaultNow = () => new Date();

const isAbortError = (error: unknown): boolean =>
  Boolean(
    error &&
      typeof error === 'object' &&
      'name' in error &&
      (error as { name?: string }).name === 'AbortError',
  );

const errorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Unknown error';
};

const buildRequest = (task: Task): RequestDescriptor => {
  const common: Record<string, unknown> = {
    model: task.model,
    stream: task.stream ?? true,
  };
  if (task.options) {
    common.options = task.options;
  }
  if (task.kind === 'generate') {
    if (task.suffix) {
      common.suffix = task.suffix;
    }
    return {
      path: '/api/generate',
      body: {
        ...common,
        prompt: task.prompt,
      },
    };
  }
  return {
    path: '/api/chat',
    body: {
      ...common,
      messages: task.messages.map((message) => ({ role: message.role, content: message.content })),
    },
  };
};

const createStreamQueue = (): TaskStreamQueue => {
  const buffer: TaskStreamEvent[] = [];
  let pending: ((value: IteratorResult<TaskStreamEvent>) => void) | undefined;
  let pendingReject: ((reason?: unknown) => void) | undefined;
  let finished = false;
  let storedError: unknown;

  const iterator: AsyncIterable<TaskStreamEvent> & AsyncIterator<TaskStreamEvent> = {
    [Symbol.asyncIterator]() {
      return this;
    },
    next(): Promise<IteratorResult<TaskStreamEvent>> {
      if (storedError) {
        return Promise.reject(storedError);
      }
      if (buffer.length > 0) {
        return Promise.resolve({ value: buffer.shift()!, done: false });
      }
      if (finished) {
        return Promise.resolve({ value: undefined, done: true });
      }
      return new Promise<IteratorResult<TaskStreamEvent>>((resolve, reject) => {
        pending = resolve;
        pendingReject = reject;
      });
    },
    return(): Promise<IteratorResult<TaskStreamEvent>> {
      finished = true;
      if (pending) {
        pending({ value: undefined, done: true });
        pending = undefined;
        pendingReject = undefined;
      }
      return Promise.resolve({ value: undefined, done: true });
    },
    throw(error): Promise<IteratorResult<TaskStreamEvent>> {
      finished = true;
      storedError = error;
      if (pendingReject) {
        pendingReject(error);
        pending = undefined;
        pendingReject = undefined;
      }
      return Promise.reject(error);
    },
  };

  const push = (event: TaskStreamEvent) => {
    if (finished || storedError) {
      return;
    }
    if (pending) {
      pending({ value: event, done: false });
      pending = undefined;
      pendingReject = undefined;
    } else {
      buffer.push(event);
    }
  };

  const close = () => {
    if (finished) {
      return;
    }
    finished = true;
    if (pending) {
      pending({ value: undefined, done: true });
      pending = undefined;
      pendingReject = undefined;
    }
  };

  const fail = (error: unknown) => {
    if (finished) {
      return;
    }
    storedError = error;
    finished = true;
    if (pendingReject) {
      pendingReject(error);
    }
    pending = undefined;
    pendingReject = undefined;
  };

  return { iterator, push, close, fail };
};

const safeParse = (raw: string): unknown => {
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
};

const coerceNumber = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isFinite(value) ? value : undefined;

const normaliseDurationMs = (value: unknown): number => {
  const parsed = coerceNumber(value);
  if (!parsed) return 0;
  return Math.round(parsed / 1_000_000);
};

type ChunkParser = Readonly<{
  feed: (fragment: string) => readonly string[];
  flush: () => readonly string[];
}>;

const toSsePayload = (payload: string): string | undefined => {
  const lines = payload
    .split(/\r?\n/)
    .map((line) => line.trimStart())
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice(5).trimStart());
  if (lines.length === 0) {
    return undefined;
  }
  return lines.join('\n').trim();
};

const createChunkParser = (contentType: string | null): ChunkParser => {
  const mime = contentType?.split(';')[0]?.trim().toLowerCase() ?? '';
  const isSse = mime === 'text/event-stream';
  let buffer = '';

  const drain = (includePartial: boolean): readonly string[] => {
    const delimiter = isSse ? '\n\n' : '\n';
    const collected: string[] = [];
    while (true) {
      const idx = buffer.indexOf(delimiter);
      if (idx < 0) {
        break;
      }
      const segment = buffer.slice(0, idx);
      buffer = buffer.slice(idx + delimiter.length);
      const trimmed = segment.trim();
      if (!trimmed) {
        continue;
      }
      if (isSse) {
        const payload = toSsePayload(segment);
        if (payload) {
          collected.push(payload);
        }
      } else {
        collected.push(trimmed);
      }
    }
    if (includePartial) {
      const remaining = buffer.trim();
      buffer = '';
      if (remaining) {
        if (isSse) {
          const payload = toSsePayload(remaining);
          if (payload) {
            collected.push(payload);
          }
        } else {
          collected.push(remaining);
        }
      }
    }
    return collected;
  };

  return {
    feed(fragment: string) {
      buffer += fragment;
      return drain(false);
    },
    flush() {
      return drain(true);
    },
  };
};

const consumeResponse = async (
  response: Response,
  options: Readonly<{
    signal?: AbortSignal;
    queue: TaskStreamQueue;
    debug?: boolean;
  }>,
): Promise<ConsumeResult & { logs: readonly string[] }> => {
  const chunks: string[] = [];
  const decoder = new TextDecoder();
  let aborted = false;
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  const parser = createChunkParser(response.headers.get('content-type'));
  let aggregatedText = '';
  let lastParsed: unknown;
  let finalParsed: unknown;
  let tokensIn = 0;
  let tokensOut = 0;
  let durationMs = 0;

  const abortHandler = () => {
    aborted = true;
    if (reader) {
      reader.cancel().catch(() => undefined);
    }
  };

  if (options.signal) {
    if (options.signal.aborted) {
      aborted = true;
    }
    options.signal.addEventListener('abort', abortHandler, { once: true });
  }

  const handleSegment = (segment: string) => {
    const raw = segment.trim();
    if (!raw) {
      return;
    }
    chunks.push(raw);
    const parsed = safeParse(raw);
    if (parsed && typeof parsed === 'object') {
      lastParsed = parsed;
      const maybeDelta = (parsed as { message?: { content?: string }; response?: string }).message
        ?.content;
      const responseText = (parsed as { response?: string }).response;
      const hasDoneField = Object.prototype.hasOwnProperty.call(parsed, 'done');
      const delta =
        typeof maybeDelta === 'string'
          ? maybeDelta
          : hasDoneField && typeof responseText === 'string'
            ? responseText
            : undefined;
      if (delta) {
        aggregatedText += delta;
      }
      const done = Boolean((parsed as { done?: boolean }).done);
      if (done) {
        finalParsed = parsed;
        if (options.debug) {
          tokensIn =
            coerceNumber((parsed as { prompt_eval_count?: unknown }).prompt_eval_count) ?? tokensIn;
          tokensOut = coerceNumber((parsed as { eval_count?: unknown }).eval_count) ?? tokensOut;
          durationMs = normaliseDurationMs(
            (parsed as { total_duration?: unknown }).total_duration ?? durationMs,
          );
        }
      } else if (options.debug) {
        tokensIn =
          coerceNumber((parsed as { prompt_eval_count?: unknown }).prompt_eval_count) ?? tokensIn;
        tokensOut = coerceNumber((parsed as { eval_count?: unknown }).eval_count) ?? tokensOut;
      }
      options.queue.push({ raw, json: parsed, textDelta: delta, done });
    } else {
      if (raw) {
        aggregatedText += raw;
      }
      options.queue.push({ raw });
    }
  };

  try {
    if (response.body) {
      reader = response.body.getReader();
      while (true) {
        if (options.signal?.aborted) {
          aborted = true;
          break;
        }
        const { value, done } = await reader.read();
        if (value) {
          const fragment = decoder.decode(value, { stream: !done });
          if (fragment.length > 0) {
            const segments = parser.feed(fragment);
            for (const segment of segments) {
              handleSegment(segment);
            }
          }
        }
        if (done) break;
      }
      const remaining = parser.flush();
      for (const segment of remaining) {
        handleSegment(segment);
      }
    } else {
      const text = await response.text();
      if (text.length > 0) {
        const segments = parser.feed(text);
        for (const segment of segments) {
          handleSegment(segment);
        }
        const remaining = parser.flush();
        for (const segment of remaining) {
          handleSegment(segment);
        }
      }
    }
  } catch (error) {
    if (isAbortError(error) || options.signal?.aborted) {
      aborted = true;
    } else {
      options.queue.fail(error);
      if (options.signal) {
        options.signal.removeEventListener('abort', abortHandler);
      }
      return {
        status: 'failed',
        error: errorMessage(error),
        data: aggregatedText || lastParsed,
        logs: chunks,
        aborted: false,
      };
    }
  } finally {
    if (options.signal) {
      options.signal.removeEventListener('abort', abortHandler);
    }
    options.queue.close();
  }

  const data = (() => {
    if (finalParsed && typeof finalParsed === 'object') {
      if (aggregatedText) {
        const base = finalParsed as Record<string, unknown>;
        const message = (
          base.message && typeof base.message === 'object'
            ? { ...(base.message as Record<string, unknown>), content: aggregatedText }
            : { content: aggregatedText }
        ) as Record<string, unknown>;
        return { ...base, message };
      }
      return finalParsed;
    }
    if (aggregatedText) {
      return aggregatedText;
    }
    return lastParsed ?? (chunks.length > 0 ? chunks.join('') : undefined);
  })();

  if (aborted) {
    return {
      status: 'aborted',
      error: 'aborted',
      data,
      logs: chunks,
      aborted: true,
      debug: options.debug ? { tokensIn, tokensOut, durationMs } : undefined,
    };
  }

  if (!response.ok) {
    return {
      status: 'failed',
      error: `ollama returned ${response.status}`,
      data,
      logs: chunks,
      aborted: false,
      debug: options.debug ? { tokensIn, tokensOut, durationMs } : undefined,
    };
  }

  return {
    status: 'succeeded',
    data,
    logs: chunks,
    aborted: false,
    debug: options.debug ? { tokensIn, tokensOut, durationMs } : undefined,
  };
};

const finalise = (
  id: string,
  started: Date,
  finished: Date,
  result: ConsumeResult & { logs: readonly string[] },
): TaskResult => ({
  id,
  startedAt: started.toISOString(),
  finishedAt: finished.toISOString(),
  status: result.status,
  output: Object.freeze({
    logs: Object.freeze([...result.logs]),
    data: result.data,
    error: result.error,
  }),
});

const parseRetryAfter = (header: string | null, now: () => Date): number | null => {
  if (!header) {
    return null;
  }
  const numeric = Number(header);
  if (Number.isFinite(numeric)) {
    return Math.max(0, Math.floor(numeric * 1000));
  }
  const ts = Date.parse(header);
  if (Number.isFinite(ts)) {
    const diff = ts - now().getTime();
    return diff > 0 ? diff : 0;
  }
  return null;
};

const emptyStream: AsyncIterable<TaskStreamEvent> = {
  [Symbol.asyncIterator]() {
    return {
      next: () => Promise.resolve({ value: undefined, done: true }),
    };
  },
};

export const runTask = async (
  task: Task,
  deps: RunTaskDependencies,
  options: RunTaskOptions = {},
): Promise<TaskRun> => {
  const { fetch: fetchImpl, baseUrl } = deps;
  const now = deps.now ?? defaultNow;
  const startedAt = now();
  const descriptor = buildRequest(task);
  const url = new URL(descriptor.path, baseUrl).toString();
  const queue = createStreamQueue();

  const controller = new AbortController();
  const inputSignal = options.signal;
  let timedOut = false;
  let externalAbort = false;

  const unsubscribe = (() => {
    if (!inputSignal) {
      return () => undefined;
    }
    if (inputSignal.aborted) {
      externalAbort = true;
      controller.abort(inputSignal.reason);
      return () => undefined;
    }
    const listener = () => {
      externalAbort = true;
      controller.abort(inputSignal.reason);
    };
    inputSignal.addEventListener('abort', listener, { once: true });
    return () => inputSignal.removeEventListener('abort', listener);
  })();

  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  if (typeof options.timeoutMs === 'number' && Number.isFinite(options.timeoutMs)) {
    timeoutId = setTimeout(
      () => {
        timedOut = true;
        controller.abort();
      },
      Math.max(0, options.timeoutMs),
    );
  }

  const init: RequestInit = {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(descriptor.body),
    signal: controller.signal,
  };

  let response: Response;
  try {
    response = await fetchImpl(url, init);
  } catch (error) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    unsubscribe();
    const kind: RunTaskResult =
      timedOut || externalAbort || isAbortError(error)
        ? { kind: 'Timeout' }
        : { kind: 'Error', error: errorMessage(error) };
    return {
      stream: emptyStream,
      result: Promise.resolve(kind),
    } satisfies TaskRun;
  }

  if (response.status === 429) {
    const retryAfterMs = parseRetryAfter(response.headers.get('retry-after'), now);
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    unsubscribe();
    return {
      stream: emptyStream,
      result: Promise.resolve({ kind: 'RateLimited', retryAfterMs }),
    } satisfies TaskRun;
  }

  const processing = consumeResponse(response, {
    signal: controller.signal,
    queue,
    debug: options.debug,
  })
    .then((result) => {
      const finishedAt = now();
      if (result.aborted || controller.signal.aborted) {
        return { kind: 'Timeout' } satisfies RunTaskTimeout;
      }
      if (!response.ok || result.status !== 'succeeded') {
        if (!response.ok) {
          return {
            kind: 'Error',
            error: result.error ?? `ollama returned ${response.status}`,
            status: response.status,
          } satisfies RunTaskError;
        }
        return {
          kind: 'Error',
          error: result.error ?? 'ollama response stream failed',
        } satisfies RunTaskError;
      }
      return {
        kind: 'Success',
        result: finalise(task.id, startedAt, finishedAt, result),
        debug: result.debug,
      } satisfies RunTaskSuccess;
    })
    .catch((error) => {
      queue.fail(error);
      return { kind: 'Error', error: errorMessage(error) } satisfies RunTaskError;
    })
    .finally(() => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      unsubscribe();
    });

  return { stream: queue.iterator, result: processing } satisfies TaskRun;
};
