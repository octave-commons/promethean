import { spawn } from "node:child_process";
import { once } from "node:events";
import path from "node:path";

import { z } from "zod";

import type { ToolFactory } from "../core/types.js";

type TaskStatus = "waiting" | "running" | "completed";

type Task = {
  readonly id: string;
  readonly command: string;
  readonly args: readonly string[];
  readonly createdAt: Date;
  name?: string;
  status: TaskStatus;
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
  stdoutText: string;
  stderrText: string;
  stdoutLines: string[];
  stderrLines: string[];
  stdoutRemainder: string;
  stderrRemainder: string;
};

type TaskSummary = Readonly<{
  id: string;
  name?: string;
  command: string;
  args: readonly string[];
  status: TaskStatus;
  pid: number | null;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  exitCode?: number | null;
  signal?: NodeJS.Signals | null;
}>;

type RunnerConfig = Readonly<{
  path: string;
  maxRunning: number;
  timeout?: number;
}>;

let taskCounter = 0;
let config: RunnerConfig = {
  path: process.cwd(),
  maxRunning: 1,
};
const tasks = new Map<string, Task>();
const waitingQueue: string[] = [];
const runningTasks = new Set<string>();
const completedTasks: string[] = [];

const buildSummary = (task: Task): TaskSummary => ({
  id: task.id,
  name: task.name,
  command: task.command,
  args: task.args,
  status: task.status,
  pid: task.pid,
  createdAt: task.createdAt.toISOString(),
  startedAt: task.startedAt?.toISOString(),
  completedAt: task.completedAt?.toISOString(),
  exitCode: task.exitCode,
  signal: task.signal ?? undefined,
});

const getConfig = () => ({ ...config });

const updateConfig = (key: string, value: string | number | undefined) => {
  if (key === "path") {
    if (typeof value !== "string" || !value) {
      throw new Error("path must be a non-empty string");
    }
    config = { ...config, path: path.resolve(value) };
    return config;
  }
  if (key === "maxRunning") {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new Error("maxRunning must be a positive integer");
    }
    config = { ...config, maxRunning: parsed };
    maybeRunNext();
    return config;
  }
  if (key === "timeout") {
    if (value === undefined || value === null) {
      const { timeout, ...rest } = config;
      config = rest as RunnerConfig;
      return config;
    }
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      throw new Error("timeout must be a positive number of milliseconds");
    }
    config = { ...config, timeout: parsed };
    return config;
  }
  throw new Error(`Unknown config key: ${key}`);
};

const appendOutput = (task: Task, kind: "stdout" | "stderr", chunk: Buffer) => {
  const text = chunk.toString("utf8");
  if (kind === "stdout") {
    task.stdoutText += text;
    const combined = task.stdoutRemainder + text;
    const parts = combined.split(/\r?\n/);
    task.stdoutRemainder = parts.pop() ?? "";
    task.stdoutLines.push(...parts);
    return;
  }
  task.stderrText += text;
  const combined = task.stderrRemainder + text;
  const parts = combined.split(/\r?\n/);
  task.stderrRemainder = parts.pop() ?? "";
  task.stderrLines.push(...parts);
};

const flushRemainders = (task: Task) => {
  if (task.stdoutRemainder) {
    task.stdoutLines.push(task.stdoutRemainder);
    task.stdoutRemainder = "";
  }
  if (task.stderrRemainder) {
    task.stderrLines.push(task.stderrRemainder);
    task.stderrRemainder = "";
  }
};

const finalizeTask = (
  task: Task,
  exitCode: number | null,
  signal: NodeJS.Signals | null,
) => {
  flushRemainders(task);
  if (task.timeoutHandle) {
    task.timeoutHandle.unref();
    clearTimeout(task.timeoutHandle);
    task.timeoutHandle = undefined;
  }
  task.exitCode = exitCode;
  task.signal = signal;
  task.completedAt = new Date();
  task.status = "completed";
  task.process = undefined;
  runningTasks.delete(task.id);
  if (!completedTasks.includes(task.id)) {
    completedTasks.push(task.id);
  }
};

const maybeRunNext = () => {
  while (runningTasks.size < config.maxRunning && waitingQueue.length > 0) {
    const nextId = waitingQueue.shift();
    if (!nextId) continue;
    const task = tasks.get(nextId);
    if (!task) continue;
    if (task.status !== "waiting") continue;
    startTask(task);
  }
};

const startTask = (task: Task) => {
  const child = spawn(task.command, task.args, {
    cwd: task.cwd ?? config.path,
    env: { ...process.env, ...(task.env ?? {}) },
    stdio: ["ignore", "pipe", "pipe"],
  });
  task.process = child;
  task.status = "running";
  task.startedAt = new Date();
  task.pid = child.pid ?? null;
  runningTasks.add(task.id);

  child.stdout?.on("data", (chunk: Buffer) =>
    appendOutput(task, "stdout", chunk),
  );
  child.stderr?.on("data", (chunk: Buffer) =>
    appendOutput(task, "stderr", chunk),
  );

  child.once("error", (err) => {
    appendOutput(task, "stderr", Buffer.from(String(err)));
    finalizeTask(task, null, null);
    maybeRunNext();
  });

  child.once("exit", (code, signal) => {
    finalizeTask(task, code, signal);
    maybeRunNext();
  });

  const timeout = task.timeoutMs ?? config.timeout;
  if (timeout && Number.isFinite(timeout)) {
    const handle = setTimeout(() => {
      if (task.process) {
        task.process.kill("SIGTERM");
      }
    }, timeout);
    handle.unref();
    task.timeoutHandle = handle;
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
  const id = `task-${++taskCounter}`;
  const task: Task = {
    id,
    command: input.command,
    args: input.args,
    createdAt: new Date(),
    name: input.name,
    status: "waiting",
    cwd: input.cwd,
    env: input.env,
    pid: null,
    timeoutMs: input.timeoutMs,
    stdoutText: "",
    stderrText: "",
    stdoutLines: [],
    stderrLines: [],
    stdoutRemainder: "",
    stderrRemainder: "",
  };
  tasks.set(id, task);
  waitingQueue.push(id);
  return task;
};

const resolveTask = (handle: string | number): Task => {
  if (typeof handle === "number") {
    for (const task of tasks.values()) {
      if (task.pid === handle) return task;
    }
    throw new Error(`No task with pid ${handle}`);
  }
  const byId = tasks.get(handle);
  if (byId) return byId;
  for (const task of tasks.values()) {
    if (task.name === handle) return task;
  }
  throw new Error(`No task with handle ${handle}`);
};

const linesFor = (task: Task, kind: "stdout" | "stderr") => {
  const base = kind === "stdout" ? task.stdoutLines : task.stderrLines;
  const remainder =
    kind === "stdout" ? task.stdoutRemainder : task.stderrRemainder;
  return remainder ? [...base, remainder] : [...base];
};

const getLogs = (
  task: Task,
  kind: "stdout" | "stderr",
  input: {
    startLine?: number;
    count?: number;
    pageNumber?: number;
    length?: number;
  },
) => {
  const lines = linesFor(task, kind);
  if (lines.length === 0) {
    return {
      start: 0,
      end: 0,
      pagenumber: input.pageNumber ?? null,
      lastPage: true,
      logs: "",
    } as const;
  }
  if (typeof input.startLine === "number") {
    const startIndex = Math.max(0, input.startLine - 1);
    const count = input.count ?? lines.length;
    const slice = lines.slice(startIndex, startIndex + count);
    const endLine = slice.length ? startIndex + slice.length : startIndex;
    return {
      start: startIndex + 1,
      end: endLine,
      pagenumber: null,
      lastPage: endLine >= lines.length,
      logs: slice.join("\n"),
    } as const;
  }
  const pageNumber = input.pageNumber ?? 1;
  const length = input.length ?? lines.length;
  const startIndex = (pageNumber - 1) * length;
  const slice = lines.slice(startIndex, startIndex + length);
  const endLine = slice.length ? startIndex + slice.length : startIndex;
  return {
    start: startIndex + 1,
    end: endLine,
    pagenumber: pageNumber,
    lastPage: endLine >= lines.length,
    logs: slice.join("\n"),
  } as const;
};

const TERMINATE_GRACE_PERIOD_MS = 5_000;
const TERMINATE_FORCE_TIMEOUT_MS = 2_000;

const stopTask = async (
  handle: string | number,
  tail: number,
  signal?: NodeJS.Signals,
) => {
  const task = resolveTask(handle);
  if (task.status === "waiting") {
    const index = waitingQueue.indexOf(task.id);
    if (index >= 0) waitingQueue.splice(index, 1);
    task.status = "completed";
    task.completedAt = new Date();
    if (!completedTasks.includes(task.id)) completedTasks.push(task.id);
    return { tail: "" } as const;
  }
  if (task.status === "completed" || !task.process) {
    const combined = `${task.stdoutText}${task.stderrText}`;
    const tailText = combined.slice(-tail);
    return { tail: tailText } as const;
  }
  const proc = task.process;
  proc.kill(signal ?? "SIGTERM");
  const exitPromise = once(proc, "exit");

  const guard = new Promise<never>((_resolve, reject) => {
    const terminateTimer = setTimeout(() => {
      if (!proc.killed) {
        proc.kill("SIGKILL");
      }
      const forceTimer = setTimeout(() => {
        reject(
          new Error(
            `Process ${proc.pid ?? "<unknown>"} failed to exit after SIGKILL`,
          ),
        );
      }, TERMINATE_FORCE_TIMEOUT_MS);
      forceTimer.unref();
      void exitPromise.finally(() => {
        clearTimeout(forceTimer);
      });
    }, TERMINATE_GRACE_PERIOD_MS);
    terminateTimer.unref();
    void exitPromise.finally(() => {
      clearTimeout(terminateTimer);
    });
  });

  await Promise.race([exitPromise, guard]);
  await exitPromise;

  const combined = `${task.stdoutText}${task.stderrText}`;
  const tailText = combined.slice(-tail);
  return { tail: tailText } as const;
};

const EnqueueSchema = z.object({
  command: z.string(),
  args: z.array(z.string()).default([]),
  opts: z
    .object({
      name: z.string().optional(),
      cwd: z.string().optional(),
      env: z.record(z.string()).optional(),
      timeoutDuration: z.number().positive().optional(),
    })
    .optional(),
  name: z.string().optional(),
  cwd: z.string().optional(),
  env: z.record(z.string()).optional(),
  timeout: z.boolean().optional(),
  timeoutDuration: z.number().positive().optional(),
});

export const processGetTaskRunnerConfig: ToolFactory = () => ({
  spec: {
    name: "process.getTaskRunnerConfig",
    description: "Return the current task runner configuration.",
  },
  invoke: async () => ({ config: getConfig() }),
});

export const processUpdateTaskRunnerConfig: ToolFactory = () => {
  const Schema = z.object({
    key: z.enum(["path", "maxRunning", "timeout"]),
    value: z.union([z.string(), z.number()]).optional(),
  });
  return {
    spec: {
      name: "process.updateTaskRunnerConfig",
      description: "Update a single key in the task runner configuration.",
      inputSchema: {
        key: Schema.shape.key,
        value: Schema.shape.value,
      },
    },
    invoke: async (raw: unknown) => {
      const { key, value } = Schema.parse(raw);
      const cfg = updateConfig(key, value);
      return { config: cfg };
    },
  };
};

export const processEnqueueTask: ToolFactory = () => ({
  spec: {
    name: "process.enqueueTask",
    description:
      "Enqueue a command for execution respecting concurrency limits.",
    inputSchema: {
      command: z.string(),
      args: z.array(z.string()).optional(),
      opts: z
        .object({
          name: z.string().optional(),
          cwd: z.string().optional(),
          env: z.record(z.string()).optional(),
          timeoutDuration: z.number().optional(),
        })
        .optional(),
      name: z.string().optional(),
      cwd: z.string().optional(),
      env: z.record(z.string()).optional(),
      timeout: z.boolean().optional(),
      timeoutDuration: z.number().optional(),
    },
  },
  invoke: async (raw: unknown) => {
    const parsed = EnqueueSchema.parse(raw);
    const taskName = parsed.name ?? parsed.opts?.name;
    const cwd = parsed.cwd ?? parsed.opts?.cwd;
    const env = parsed.env ?? parsed.opts?.env;
    const timeoutDuration =
      parsed.timeoutDuration ?? parsed.opts?.timeoutDuration;
    const timeoutMs = parsed.timeout
      ? timeoutDuration ?? config.timeout
      : timeoutDuration;
    const task = createTask({
      command: parsed.command,
      args: parsed.args,
      name: taskName,
      cwd,
      env,
      timeoutMs: timeoutMs,
    });
    maybeRunNext();
    return { name: task.name, pid: task.pid };
  },
});

export const processStopTask: ToolFactory = () => {
  const Schema = z.object({
    handle: z.union([z.string(), z.number()]),
    tail: z.number().int().min(0).default(0),
    signal: z.string().optional(),
  });
  return {
    spec: {
      name: "process.stop",
      description:
        "Stop a running task via pid or name and return trailing output.",
      inputSchema: {
        handle: Schema.shape.handle,
        tail: Schema.shape.tail,
        signal: Schema.shape.signal,
      },
    },
    invoke: async (raw: unknown) => {
      const { handle, tail, signal } = Schema.parse(raw);
      const result = await stopTask(
        handle,
        tail,
        signal as NodeJS.Signals | undefined,
      );
      return result;
    },
  };
};

export const processGetQueue: ToolFactory = () => ({
  spec: {
    name: "process.getQueue",
    description: "Return waiting, running, and completed task summaries.",
  },
  invoke: async () => ({
    waiting: waitingQueue
      .map((id) => tasks.get(id))
      .filter((task): task is Task => Boolean(task))
      .map(buildSummary),
    running: Array.from(runningTasks)
      .map((id) => tasks.get(id))
      .filter((task): task is Task => Boolean(task))
      .map(buildSummary),
    completed: completedTasks
      .map((id) => tasks.get(id))
      .filter((task): task is Task => Boolean(task))
      .map(buildSummary),
  }),
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

const buildLogSpec = (name: string) => ({
  name,
  description: "Retrieve task output with pagination or explicit line ranges.",
  inputSchema: {
    handle: z.union([z.string(), z.number()]),
    pagenumber: z.number().optional(),
    length: z.number().optional(),
    startLine: z.number().optional(),
    count: z.number().optional(),
  },
});

export const processGetStdout: ToolFactory = () => ({
  spec: buildLogSpec("process.getStdout"),
  invoke: async (raw: unknown) => {
    const parsed = LogSchema.parse(raw);
    const task = resolveTask(parsed.handle);
    if ("startLine" in parsed) {
      return getLogs(task, "stdout", {
        startLine: parsed.startLine,
        count: parsed.count,
      });
    }
    return getLogs(task, "stdout", {
      pageNumber: parsed.pagenumber,
      length: parsed.length,
    });
  },
});

export const processGetStderr: ToolFactory = () => ({
  spec: buildLogSpec("process.getStderr"),
  invoke: async (raw: unknown) => {
    const parsed = LogSchema.parse(raw);
    const task = resolveTask(parsed.handle);
    if ("startLine" in parsed) {
      return getLogs(task, "stderr", {
        startLine: parsed.startLine,
        count: parsed.count,
      });
    }
    return getLogs(task, "stderr", {
      pageNumber: parsed.pagenumber,
      length: parsed.length,
    });
  },
});

export const __resetProcessManagerForTests = () => {
  for (const task of tasks.values()) {
    if (task.process && task.status === "running") {
      task.process.kill("SIGTERM");
    }
  }
  tasks.clear();
  waitingQueue.length = 0;
  runningTasks.clear();
  completedTasks.length = 0;
  taskCounter = 0;
  config = {
    path: process.cwd(),
    maxRunning: 1,
  };
};
