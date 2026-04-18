import { spawn } from 'node:child_process';
import { once } from 'node:events';
import path from 'node:path';

import { z } from 'zod';

import type { ToolFactory, ToolSpec } from '../core/types.js';

const DEFAULT_MAX_RUNNING = 1;
const DEFAULT_TERMINATE_GRACE_MS = 5_000;
const DEFAULT_TERMINATE_FORCE_MS = 2_000;
const DEFAULT_LINE_BUFFER_SIZE = 10_000;
const DEFAULT_CHAR_BUFFER_SIZE = 16_384;

type TaskStatus = 'waiting' | 'running' | 'completed';

type OutputBuffer = {
  readonly lines: string[];
  firstLine: number;
  totalLines: number;
  remainder: string;
  tail: string;
};

type Task = {
  readonly id: string;
  readonly command: string;
  readonly args: readonly string[];
  readonly createdAt: Date;
  readonly stdout: OutputBuffer;
  readonly stderr: OutputBuffer;
  status: TaskStatus;
  name?: string;
  cwd?: string;
  env?: Record<string, string>;
  pid: number | null;
  startedAt?: Date;
  completedAt?: Date;
  exitCode?: number | null;
  signal?: NodeJS.Signals | null;
  timeoutMs?: number;
  timeoutHandle?: NodeJS.Timeout;
  process?: ReturnType<typeof spawn>;
};

type TaskSummary = Readonly<{
  id: string;
  name?: string;
  command: string;
  args: readonly string[];
  status: TaskStatus;
  pid: number | null;
  cwd?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  exitCode?: number | null;
  signal?: NodeJS.Signals | null;
  durationMs?: number;
}>;

type RunnerConfig = Readonly<{
  path: string;
  maxRunning: number;
  timeout?: number;
  terminateGraceMs: number;
  terminateForceMs: number;
  lineBufferSize: number;
  charBufferSize: number;
}>;

type RunnerState = {
  readonly tasks: Map<string, Task>;
  readonly waitingQueue: string[];
  readonly runningTasks: Set<string>;
  readonly completedTasks: string[];
  config: RunnerConfig;
  taskCounter: number;
};

type ResolveHandle = string | number;

const trimTail = (value: string, limit: number) =>
  value.length <= limit ? value : value.slice(value.length - limit);

const createOutputBuffer = (): OutputBuffer => ({
  lines: [],
  firstLine: 1,
  totalLines: 0,
  remainder: '',
  tail: '',
});

const flushRemainder = (buffer: OutputBuffer, lineLimit: number) => {
  if (buffer.remainder) {
    buffer.lines.push(buffer.remainder);
    buffer.totalLines += 1;
    buffer.remainder = '';
    if (buffer.lines.length > lineLimit) {
      const overshoot = buffer.lines.length - lineLimit;
      buffer.lines.splice(0, overshoot);
      buffer.firstLine += overshoot;
    }
  }
};

const appendOutput = (
  buffer: OutputBuffer,
  chunk: Buffer,
  { lineLimit, charLimit }: { lineLimit: number; charLimit: number },
) => {
  const text = chunk.toString('utf8');
  const combined = buffer.remainder + text;
  const parts = combined.split(/\r?\n/);
  buffer.remainder = parts.pop() ?? '';
  for (const line of parts) {
    buffer.lines.push(line);
    buffer.totalLines += 1;
  }
  if (buffer.lines.length > lineLimit) {
    const overshoot = buffer.lines.length - lineLimit;
    buffer.lines.splice(0, overshoot);
    buffer.firstLine += overshoot;
  }
  buffer.tail = trimTail(buffer.tail + text, charLimit);
};

const outputTail = (buffer: OutputBuffer, charLimit: number) => {
  const pendingTail = buffer.tail + buffer.remainder;
  return trimTail(pendingTail, charLimit);
};

const buildSummary = (task: Task): TaskSummary => {
  const durationMs = task.startedAt
    ? (task.completedAt?.getTime() ?? Date.now()) - task.startedAt.getTime()
    : undefined;
  return {
    id: task.id,
    name: task.name,
    command: task.command,
    args: task.args,
    status: task.status,
    pid: task.pid,
    cwd: task.cwd,
    createdAt: task.createdAt.toISOString(),
    startedAt: task.startedAt?.toISOString(),
    completedAt: task.completedAt?.toISOString(),
    exitCode: task.exitCode,
    signal: task.signal ?? undefined,
    durationMs,
  };
};

const createRunner = (initial?: Partial<RunnerConfig>) => {
  const state: RunnerState = {
    tasks: new Map(),
    waitingQueue: [],
    runningTasks: new Set(),
    completedTasks: [],
    config: {
      path: path.resolve(process.cwd()),
      maxRunning: DEFAULT_MAX_RUNNING,
      terminateGraceMs: DEFAULT_TERMINATE_GRACE_MS,
      terminateForceMs: DEFAULT_TERMINATE_FORCE_MS,
      lineBufferSize: DEFAULT_LINE_BUFFER_SIZE,
      charBufferSize: DEFAULT_CHAR_BUFFER_SIZE,
      ...initial,
    },
    taskCounter: 0,
  };

  const getConfig = (): RunnerConfig => ({ ...state.config });

  const finalizeTask = (task: Task, exitCode: number | null, signal: NodeJS.Signals | null) => {
    flushRemainder(task.stdout, state.config.lineBufferSize);
    flushRemainder(task.stderr, state.config.lineBufferSize);
    if (task.timeoutHandle) {
      task.timeoutHandle.unref();
      clearTimeout(task.timeoutHandle);
      task.timeoutHandle = undefined;
    }
    task.exitCode = exitCode;
    task.signal = signal;
    task.completedAt = new Date();
    task.status = 'completed';
    task.process = undefined;
    state.runningTasks.delete(task.id);
    if (!state.completedTasks.includes(task.id)) {
      state.completedTasks.push(task.id);
    }
  };

  const startTask = (task: Task) => {
    const child = spawn(task.command, task.args, {
      cwd: task.cwd ?? state.config.path,
      env: { ...process.env, ...(task.env ?? {}) },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    task.process = child;
    task.status = 'running';
    task.startedAt = new Date();
    task.pid = child.pid ?? null;
    state.runningTasks.add(task.id);

    const bufferConfig = {
      lineLimit: state.config.lineBufferSize,
      charLimit: state.config.charBufferSize,
    };

    if (child.stdout) {
      (async () => {
        for await (const chunk of child.stdout!) {
          appendOutput(task.stdout, chunk as Buffer, bufferConfig);
        }
      })().catch(() => {
        /* ignore stream iteration errors */
      });
    }
    if (child.stderr) {
      (async () => {
        for await (const chunk of child.stderr!) {
          appendOutput(task.stderr, chunk as Buffer, bufferConfig);
        }
      })().catch(() => {
        /* ignore stream iteration errors */
      });
    }

    child.once('error', (err) => {
      appendOutput(task.stderr, Buffer.from(String(err)), bufferConfig);
      finalizeTask(task, null, null);
      maybeRunNext();
    });

    child.once('close', (code, signal) => {
      finalizeTask(task, code, signal);
      maybeRunNext();
    });

    const timeout = task.timeoutMs ?? state.config.timeout;
    if (timeout && Number.isFinite(timeout)) {
      const handle = setTimeout(() => {
        if (task.process) {
          try {
            task.process.kill('SIGTERM');
          } catch {
            /* ignore */
          }
        }
      }, timeout);
      handle.unref();
      task.timeoutHandle = handle;
    }
  };

  const maybeRunNext = () => {
    while (state.runningTasks.size < state.config.maxRunning && state.waitingQueue.length > 0) {
      const nextId = state.waitingQueue.shift();
      if (!nextId) continue;
      const task = state.tasks.get(nextId);
      if (!task || task.status !== 'waiting') continue;
      startTask(task);
    }
  };

  const createTask = (input: {
    command: string;
    args: readonly string[];
    name?: string;
    cwd?: string;
    env?: Record<string, string>;
    timeoutMs?: number;
  }): Task => {
    const id = `task-${++state.taskCounter}`;
    const task: Task = {
      id,
      command: input.command,
      args: input.args,
      createdAt: new Date(),
      stdout: createOutputBuffer(),
      stderr: createOutputBuffer(),
      status: 'waiting',
      name: input.name,
      cwd: input.cwd,
      env: input.env,
      pid: null,
      timeoutMs: input.timeoutMs,
    };
    state.tasks.set(id, task);
    state.waitingQueue.push(id);
    return task;
  };

  const updateConfig = (key: keyof RunnerConfig, value: unknown) => {
    if (key === 'path') {
      if (typeof value !== 'string' || value.length === 0) {
        throw new Error('path must be a non-empty string');
      }
      state.config = { ...state.config, path: path.resolve(value) };
      return getConfig();
    }
    if (key === 'maxRunning') {
      const parsed = Number(value);
      if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new Error('maxRunning must be a positive integer');
      }
      state.config = { ...state.config, maxRunning: parsed };
      maybeRunNext();
      return getConfig();
    }
    if (key === 'timeout') {
      if (value === undefined || value === null) {
        const { timeout: _timeout, ...rest } = state.config;
        state.config = rest as RunnerConfig;
        return getConfig();
      }
      const parsed = Number(value);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        throw new Error('timeout must be a positive number of milliseconds');
      }
      state.config = { ...state.config, timeout: parsed };
      return getConfig();
    }
    if (key === 'terminateGraceMs' || key === 'terminateForceMs') {
      const parsed = Number(value);
      if (!Number.isFinite(parsed) || parsed < 0) {
        throw new Error(`${key} must be a non-negative number of milliseconds`);
      }
      state.config = { ...state.config, [key]: parsed } as RunnerConfig;
      return getConfig();
    }
    if (key === 'lineBufferSize' || key === 'charBufferSize') {
      const parsed = Number(value);
      if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new Error(`${key} must be a positive integer`);
      }
      state.config = { ...state.config, [key]: parsed } as RunnerConfig;
      return getConfig();
    }
    throw new Error(`Unknown config key: ${String(key)}`);
  };

  const resolveTask = (handle: ResolveHandle): Task => {
    if (typeof handle === 'number') {
      for (const task of state.tasks.values()) {
        if (task.pid === handle) return task;
      }
      throw new Error(`No task with pid ${handle}`);
    }
    const byId = state.tasks.get(handle);
    if (byId) return byId;
    for (const task of state.tasks.values()) {
      if (task.name === handle) return task;
    }
    throw new Error(`No task with handle ${handle}`);
  };

  const calculateLogs = (
    buffer: OutputBuffer,
    input: { startLine: number; count: number } | { pagenumber: number; length: number },
  ) => {
    const availableLines = buffer.lines;
    if (availableLines.length === 0) {
      return {
        start: 0,
        end: 0,
        pagenumber: 'pagenumber' in input ? input.pagenumber : null,
        lastPage: true,
        logs: '',
        truncated: buffer.totalLines > 0,
      } as const;
    }
    const firstAvailable = buffer.firstLine;
    const lastAvailable = firstAvailable + availableLines.length - 1;

    if ('startLine' in input) {
      const requestedStart = Math.max(input.startLine, firstAvailable);
      if (requestedStart > lastAvailable) {
        return {
          start: lastAvailable + 1,
          end: lastAvailable,
          pagenumber: null,
          lastPage: true,
          logs: '',
          truncated: true,
        } as const;
      }
      const startIndex = requestedStart - firstAvailable;
      const slice = availableLines.slice(startIndex, startIndex + input.count);
      const endLine = slice.length ? requestedStart + slice.length - 1 : requestedStart - 1;
      return {
        start: requestedStart,
        end: endLine,
        pagenumber: null,
        lastPage: endLine >= lastAvailable,
        logs: slice.join('\n'),
        truncated: requestedStart !== input.startLine || buffer.firstLine > 1,
      } as const;
    }

    const pageNumber = input.pagenumber;
    const length = input.length;
    const startIndex = (pageNumber - 1) * length;
    const slice = availableLines.slice(startIndex, startIndex + length);
    const actualStart = firstAvailable + startIndex;
    const endLine = slice.length ? actualStart + slice.length - 1 : actualStart - 1;
    const lastPage = endLine >= lastAvailable;
    return {
      start: actualStart,
      end: endLine,
      pagenumber: pageNumber,
      lastPage,
      logs: slice.join('\n'),
      truncated: buffer.firstLine > 1,
    } as const;
  };

  const tailForTask = (task: Task, tail: number) => {
    if (tail <= 0) return '';
    const combined =
      outputTail(task.stdout, state.config.charBufferSize) +
      outputTail(task.stderr, state.config.charBufferSize);
    return trimTail(combined, tail);
  };

  const stopTask = async (handle: ResolveHandle, tail: number, signal?: NodeJS.Signals) => {
    const task = resolveTask(handle);
    if (task.status === 'waiting') {
      const index = state.waitingQueue.indexOf(task.id);
      if (index >= 0) state.waitingQueue.splice(index, 1);
      task.status = 'completed';
      task.completedAt = new Date();
      if (!state.completedTasks.includes(task.id)) {
        state.completedTasks.push(task.id);
      }
      return { tail: '' } as const;
    }
    if (task.status === 'completed' || !task.process) {
      return { tail: tailForTask(task, tail) } as const;
    }
    const proc = task.process;
    try {
      if (signal) {
        proc.kill(signal);
      } else {
        proc.kill('SIGTERM');
      }
    } catch {
      proc.kill();
    }

    const closePromise = once(proc, 'close');

    const guard = new Promise<never>((_resolve, reject) => {
      const graceTimer = setTimeout(() => {
        if (process.platform !== 'win32' && !proc.killed) {
          try {
            proc.kill('SIGKILL');
          } catch {
            /* ignore */
          }
        }
        const forceTimer = setTimeout(() => {
          reject(new Error(`Process ${proc.pid ?? '<unknown>'} failed to exit after escalation`));
        }, state.config.terminateForceMs);
        forceTimer.unref();
        void closePromise.finally(() => {
          clearTimeout(forceTimer);
        });
      }, state.config.terminateGraceMs);
      graceTimer.unref();
      void closePromise.finally(() => {
        clearTimeout(graceTimer);
      });
    });

    await Promise.race([closePromise, guard]);
    await closePromise;

    return { tail: tailForTask(task, tail) } as const;
  };

  const getQueue = () => ({
    waiting: state.waitingQueue
      .map((id) => state.tasks.get(id))
      .filter((task): task is Task => Boolean(task))
      .map(buildSummary),
    running: Array.from(state.runningTasks)
      .map((id) => state.tasks.get(id))
      .filter((task): task is Task => Boolean(task))
      .map(buildSummary),
    completed: state.completedTasks
      .map((id) => state.tasks.get(id))
      .filter((task): task is Task => Boolean(task))
      .map(buildSummary),
  });

  const reset = () => {
    for (const task of state.tasks.values()) {
      if (task.process && task.status === 'running') {
        try {
          task.process.kill('SIGTERM');
        } catch {
          /* ignore */
        }
      }
      if (task.timeoutHandle) {
        task.timeoutHandle.unref();
        clearTimeout(task.timeoutHandle);
      }
    }
    state.tasks.clear();
    state.waitingQueue.length = 0;
    state.runningTasks.clear();
    state.completedTasks.length = 0;
    state.taskCounter = 0;
    const { timeout } = state.config;
    state.config = {
      path: path.resolve(process.cwd()),
      maxRunning: DEFAULT_MAX_RUNNING,
      terminateGraceMs: DEFAULT_TERMINATE_GRACE_MS,
      terminateForceMs: DEFAULT_TERMINATE_FORCE_MS,
      lineBufferSize: DEFAULT_LINE_BUFFER_SIZE,
      charBufferSize: DEFAULT_CHAR_BUFFER_SIZE,
      ...(timeout ? { timeout } : {}),
    };
  };

  return {
    getConfig,
    updateConfig,
    createTask,
    maybeRunNext,
    stopTask,
    getQueue,
    resolveTask,
    calculateLogs,
    tailForTask,
    reset,
  };
};

const runner = createRunner();

const runnerConfigSchema = z.enum([
  'path',
  'maxRunning',
  'timeout',
  'terminateGraceMs',
  'terminateForceMs',
  'lineBufferSize',
  'charBufferSize',
] as const satisfies readonly (keyof RunnerConfig)[]);

const ALLOWED_SIGNALS = [
  'SIGTERM',
  'SIGINT',
  'SIGKILL',
  'SIGHUP',
  'SIGQUIT',
] as const satisfies readonly NodeJS.Signals[];

const EnqueueSchema = z.object({
  command: z.string().min(1),
  args: z.array(z.string()).default([]),
  opts: z
    .object({
      name: z.string().min(1).optional(),
      cwd: z.string().min(1).optional(),
      env: z.record(z.string()).optional(),
      timeoutMs: z.number().positive().optional(),
    })
    .default({}),
});

const LogSchema = z.union([
  z.object({
    handle: z.union([z.string(), z.number()]),
    pagenumber: z.number().int().min(1),
    length: z.number().int().min(1),
  }),
  z.object({
    handle: z.union([z.string(), z.number()]),
    startLine: z.number().int().min(1),
    count: z.number().int().min(1),
  }),
]);

export const processGetTaskRunnerConfig: ToolFactory = () => ({
  spec: {
    name: 'process_get_task_runner_config',
    description: 'Return the current task runner configuration.',
    stability: 'experimental',
    since: '0.1.0',
  } satisfies ToolSpec,
  invoke: async () => ({ config: runner.getConfig() }),
});

export const processUpdateTaskRunnerConfig: ToolFactory = () => {
  const Schema = z.object({
    key: runnerConfigSchema,
    value: z.union([z.string(), z.number()]).optional(),
  });
  return {
    spec: {
      name: 'process_update_task_runner_config',
      description: 'Update a single key in the task runner configuration.',
      inputSchema: {
        key: Schema.shape.key,
        value: Schema.shape.value,
      },
      stability: 'experimental',
      since: '0.1.0',
    } satisfies ToolSpec,
    invoke: async (raw: unknown) => {
      const { key, value } = Schema.parse(raw);
      const config = runner.updateConfig(key, value);
      return { config };
    },
  };
};

export const processEnqueueTask: ToolFactory = () => ({
  spec: {
    name: 'process_enqueue_task',
    description: 'Enqueue a command for execution respecting concurrency limits.',
    inputSchema: {
      command: z.string(),
      args: z.array(z.string()).optional(),
      opts: EnqueueSchema.shape.opts.optional(),
    },
    stability: 'experimental',
    since: '0.1.0',
  } satisfies ToolSpec,
  invoke: async (raw: unknown) => {
    const parsed = EnqueueSchema.parse(raw);
    const task = runner.createTask({
      command: parsed.command,
      args: parsed.args,
      name: parsed.opts.name,
      cwd: parsed.opts.cwd,
      env: parsed.opts.env,
      timeoutMs: parsed.opts.timeoutMs,
    });
    runner.maybeRunNext();
    return { id: task.id, name: task.name, pid: task.pid };
  },
});

export const processStopTask: ToolFactory = () => {
  const Schema = z.object({
    handle: z.union([z.string(), z.number()]),
    tail: z.number().int().min(0).default(0),
    signal: z.enum(ALLOWED_SIGNALS).optional(),
  });
  return {
    spec: {
      name: 'process_stop',
      description: 'Stop a running task via id, pid, or name and return trailing output.',
      inputSchema: {
        handle: Schema.shape.handle,
        tail: Schema.shape.tail,
        signal: Schema.shape.signal,
      },
      stability: 'experimental',
      since: '0.1.0',
    } satisfies ToolSpec,
    invoke: async (raw: unknown) => {
      const { handle, tail, signal } = Schema.parse(raw);
      const result = await runner.stopTask(handle, tail, signal);
      return result;
    },
  };
};

const buildLogSpec = (name: string): ToolSpec => ({
  name,
  description: 'Retrieve task output with pagination or explicit line ranges.',
  inputSchema: {
    handle: z.union([z.string(), z.number()]),
    pagenumber: z.number().optional(),
    length: z.number().optional(),
    startLine: z.number().optional(),
    count: z.number().optional(),
  },
  stability: 'experimental',
  since: '0.1.0',
});

export const processGetStdout: ToolFactory = () => ({
  spec: buildLogSpec('process_get_stdout'),
  invoke: async (raw: unknown) => {
    const parsed = LogSchema.parse(raw);
    const task = runner.resolveTask(parsed.handle);
    if ('startLine' in parsed) {
      return runner.calculateLogs(task.stdout, {
        startLine: parsed.startLine,
        count: parsed.count,
      });
    }
    return runner.calculateLogs(task.stdout, {
      pagenumber: parsed.pagenumber,
      length: parsed.length,
    });
  },
});

export const processGetStderr: ToolFactory = () => ({
  spec: buildLogSpec('process_get_stderr'),
  invoke: async (raw: unknown) => {
    const parsed = LogSchema.parse(raw);
    const task = runner.resolveTask(parsed.handle);
    if ('startLine' in parsed) {
      return runner.calculateLogs(task.stderr, {
        startLine: parsed.startLine,
        count: parsed.count,
      });
    }
    return runner.calculateLogs(task.stderr, {
      pagenumber: parsed.pagenumber,
      length: parsed.length,
    });
  },
});

export const processGetQueue: ToolFactory = () => ({
  spec: {
    name: 'process_get_queue',
    description: 'Return waiting, running, and completed task summaries.',
    stability: 'experimental',
    since: '0.1.0',
  } satisfies ToolSpec,
  invoke: async () => runner.getQueue(),
});

export const __resetProcessManagerForTests = () => {
  runner.reset();
};

export type { RunnerConfig };
