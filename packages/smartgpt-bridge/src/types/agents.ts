import type { ChildProcessWithoutNullStreams } from "child_process";
import type { Readable, Writable } from "stream";

export type AgentMeta = {
  readonly id: string;
  readonly mode: "agent" | "pty";
  readonly cmd: string;
  readonly args: readonly string[];
  readonly cwd: string;
  readonly startedAt: number;
  readonly prompt: string;
  readonly finishedAt?: number;
  readonly code?: number | null;
  readonly signal?: string | null;
  readonly cols?: number;
  readonly rows?: number;
};

export type AgentLogEvent = {
  readonly text: string;
};

export type AgentGuardEvent = {
  readonly paused: boolean;
  readonly reason?: string;
};

export type AgentErrorEvent = {
  readonly message: string;
};

export type AgentExitEvent = {
  readonly code: number | null;
  readonly signal: string | null;
};

export type AgentEventPayloadMap = {
  readonly stdout: AgentLogEvent;
  readonly stderr: AgentLogEvent;
  readonly guard: AgentGuardEvent;
  readonly error: AgentErrorEvent;
  readonly exit: AgentExitEvent;
};

export type AgentEventName = keyof AgentEventPayloadMap;

export type SseClient = {
  writeHead(
    statusCode: number,
    headers: Readonly<Record<string, string>>,
  ): void;
  write(chunk: string): void;
  readonly flushHeaders?: () => void;
  on(event: "close", listener: () => void): void;
};

export type PtyExitEvent = {
  readonly exitCode: number;
  readonly signal?: number | string;
};

export type PtyProcess = {
  readonly pid: number;
  write(data: string): void;
  resize(columns: number, rows: number): void;
  onData(handler: (chunk: string) => void): void;
  onExit(handler: (event: PtyExitEvent) => void): void;
};

export type PtyModule = {
  spawn(
    file: string,
    args: ReadonlyArray<string>,
    options: Readonly<{
      name: string;
      cols: number;
      rows: number;
      cwd: string;
      env: Record<string, string | undefined>;
    }>,
  ): PtyProcess;
};

export type AgentChildProcess = ChildProcessWithoutNullStreams & {
  readonly stdout: Readable;
  readonly stderr: Readable;
  readonly stdin: Writable;
};

type AgentProcessBase = {
  readonly id: string;
  readonly cmd: string;
  readonly args: readonly string[];
  readonly cwd: string;
  readonly startedAt: number;
  readonly exited: boolean;
  readonly code: number | null;
  readonly signal: string | null;
  readonly paused_by_guard: boolean;
  readonly log: Buffer;
  readonly prompt: string;
};

export type AgentProcessAgent = AgentProcessBase & {
  readonly mode: "agent";
  readonly proc: AgentChildProcess | null;
};

export type AgentProcessPty = AgentProcessBase & {
  readonly mode: "pty";
  readonly proc: PtyProcess | null;
  readonly cols: number;
  readonly rows: number;
};

export type AgentProcess = AgentProcessAgent | AgentProcessPty;

export type ChromaQueryResult = {
  readonly ids: readonly string[];
  readonly metadatas?: ReadonlyArray<{ readonly timestamp?: number }>;
};

export type ChromaCollection = {
  get(
    query: Readonly<{
      where?: { readonly timestamp?: { readonly $lt?: number } };
      include?: readonly ["metadatas"];
    }>,
  ): Promise<ChromaQueryResult>;
  delete(query: Readonly<{ ids: ReadonlyArray<string> }>): Promise<void>;
  count(): Promise<number>;
};

export type ChromaCleanupResult = {
  readonly deleted: number;
};
