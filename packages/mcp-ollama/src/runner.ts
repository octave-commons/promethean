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
}>;

type RequestDescriptor = Readonly<{
  path: string;
  body: Record<string, unknown>;
}>;

type ConsumeResult = Readonly<{
  status: TaskStatus;
  data?: unknown;
  error?: string;
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

const consumeResponse = async (
  response: Response,
  signal: AbortSignal | undefined,
): Promise<ConsumeResult & { logs: readonly string[] }> => {
  const chunks: string[] = [];
  const decoder = new TextDecoder();
  let aborted = false;
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;

  const abortHandler = () => {
    aborted = true;
    if (reader) {
      reader.cancel().catch(() => undefined);
    }
  };

  if (signal) {
    if (signal.aborted) {
      aborted = true;
    }
    signal.addEventListener('abort', abortHandler, { once: true });
  }

  try {
    if (response.body) {
      reader = response.body.getReader();
      while (true) {
        if (signal?.aborted) {
          aborted = true;
          break;
        }
        const { value, done } = await reader.read();
        if (value) {
          const fragment = decoder.decode(value, { stream: !done });
          if (fragment.length > 0) {
            chunks.push(fragment);
          }
        }
        if (done) break;
      }
    } else {
      const text = await response.text();
      if (text.length > 0) {
        chunks.push(text);
      }
    }
  } catch (error) {
    if (isAbortError(error) || signal?.aborted) {
      aborted = true;
    } else {
      return {
        status: 'failed',
        error: errorMessage(error),
        data: joinChunks(chunks, response.headers.get('content-type')),
        logs: chunks,
      };
    }
  } finally {
    if (signal) {
      signal.removeEventListener('abort', abortHandler);
    }
  }

  if (aborted) {
    return {
      status: 'aborted',
      error: 'aborted',
      data: joinChunks(chunks, response.headers.get('content-type')),
      logs: chunks,
    };
  }

  if (!response.ok) {
    return {
      status: 'failed',
      error: `ollama returned ${response.status}`,
      data: joinChunks(chunks, response.headers.get('content-type')),
      logs: chunks,
    };
  }

  return {
    status: 'succeeded',
    data: joinChunks(chunks, response.headers.get('content-type')),
    logs: chunks,
  };
};

const joinChunks = (chunks: readonly string[], contentType: string | null): unknown => {
  if (chunks.length === 0) return undefined;
  const combined = chunks.join('');
  if (contentType && contentType.includes('application/json')) {
    try {
      return JSON.parse(combined);
    } catch (error) {
      return combined;
    }
  }
  return combined;
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

export const runTask = async (
  task: Task,
  deps: RunTaskDependencies,
  options: RunTaskOptions = {},
): Promise<TaskResult> => {
  const { fetch: fetchImpl, baseUrl } = deps;
  const now = deps.now ?? defaultNow;
  const startedAt = now();
  const descriptor = buildRequest(task);
  const url = new URL(descriptor.path, baseUrl).toString();
  const init: RequestInit = {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(descriptor.body),
    signal: options.signal,
  };

  let response: Response;
  try {
    response = await fetchImpl(url, init);
  } catch (error) {
    const status: TaskStatus =
      isAbortError(error) || options.signal?.aborted ? 'aborted' : 'failed';
    const finishedAt = now();
    return {
      id: task.id,
      startedAt: startedAt.toISOString(),
      finishedAt: finishedAt.toISOString(),
      status,
      output: Object.freeze({
        logs: Object.freeze([]),
        error: status === 'aborted' ? 'aborted' : errorMessage(error),
      }),
    };
  }

  const result = await consumeResponse(response, options.signal);
  const finishedAt = now();
  return finalise(task.id, startedAt, finishedAt, result);
};
