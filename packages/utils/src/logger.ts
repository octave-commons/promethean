import { Writable } from "node:stream";

export type LogFields = Record<string, unknown>;
export type Level = "debug" | "info" | "warn" | "error";
export type LogMethod = (msg: string, fields?: LogFields) => void;
export type Logger = {
  readonly debug: LogMethod;
  readonly info: LogMethod;
  readonly warn: LogMethod;
  readonly error: LogMethod;
  readonly audit: LogMethod;
  readonly child: (extra: LogFields) => Logger;
};

const levelOrder: Record<Level, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const NULL_STREAM = new Writable({
  write(_chunk, _encoding, callback) {
    callback();
  },
});

export type LoggerConfig = {
  readonly service: string;
  readonly level?: Level;
  readonly json?: boolean;
  readonly base?: LogFields;
  readonly stream?: NodeJS.WritableStream;
  readonly silent?: boolean;
};

function parseLevel(l?: Level | string): Level {
  const raw = (l || process.env.LOG_LEVEL || "info").toLowerCase();
  if (raw === "debug" || raw === "info" || raw === "warn" || raw === "error")
    return raw;
  return "info";
}

function parseJson(flag?: boolean): boolean {
  if (typeof flag === "boolean") return flag;
  return /^true$/i.test(process.env.LOG_JSON || "false");
}

function parseBoolEnv(value: string | undefined): boolean | undefined {
  if (value === undefined) return undefined;
  if (/^(1|true|yes)$/i.test(value)) return true;
  if (/^(0|false|no)$/i.test(value)) return false;
  return undefined;
}

function resolveSilent(
  explicit: boolean | undefined,
  hasCustomStream: boolean,
): boolean {
  if (typeof explicit === "boolean") return explicit;
  const fromEnv = parseBoolEnv(process.env.LOG_SILENT);
  if (typeof fromEnv === "boolean") return fromEnv;
  if (process.env.NODE_ENV === "test" && !hasCustomStream) return true;
  return false;
}

function now(): string {
  return new Date().toISOString();
}

type LoggerContext = {
  readonly base: LogFields;
  readonly json: boolean;
  readonly level: Level;
  readonly service: string;
  readonly stream: NodeJS.WritableStream;
};

type LevelOrAudit = Level | "audit";

const formatLine = (
  json: boolean,
  payload: LogFields & {
    ts: string;
    level: string;
    service: string;
    msg: string;
  },
): string =>
  json
    ? JSON.stringify(payload)
    : `[${payload.ts}] ${payload.service} ${payload.level.toUpperCase()}: ${
        payload.msg
      }`;

const createEmitter =
  (context: LoggerContext) =>
  (lvl: LevelOrAudit, msg: string, fields?: LogFields, force = false): void => {
    if (
      !force &&
      lvl !== "audit" &&
      levelOrder[lvl] < levelOrder[context.level]
    ) {
      return;
    }
    const payload = {
      ts: now(),
      level: lvl,
      service: context.service,
      ...context.base,
      ...(fields ?? {}),
      msg,
    };
    try {
      const line = formatLine(context.json, payload);
      context.stream.write(`${line}\n`);
    } catch {
      // ignore stream errors
    }
  };

const resolveStream = (
  silent: boolean,
  stream: NodeJS.WritableStream | undefined,
): NodeJS.WritableStream => {
  if (stream) return stream;
  return silent ? NULL_STREAM : process.stdout;
};

export function createLogger(config: LoggerConfig): Logger {
  const { service, base = {} } = config;
  const hasCustomStream = config.stream !== undefined;
  const silent = resolveSilent(config.silent, hasCustomStream);
  const level = config.level ?? parseLevel();
  const json = config.json ?? parseJson();
  const stream = resolveStream(silent, config.stream);
  const context: LoggerContext = { base, json, level, service, stream };
  const emit = createEmitter(context);
  return {
    debug: (msg, fields) => emit("debug", msg, fields),
    info: (msg, fields) => emit("info", msg, fields),
    warn: (msg, fields) => emit("warn", msg, fields),
    error: (msg, fields) => emit("error", msg, fields),
    audit: (msg, fields) => emit("audit", msg, fields, true),
    child: (extra) =>
      createLogger({
        service,
        level,
        json,
        base: { ...base, ...extra },
        stream,
        silent,
      }),
  };
}
