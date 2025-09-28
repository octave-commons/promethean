import { Writable } from "node:stream";

export type Level = "debug" | "info" | "warn" | "error";

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

export type LogFields = Record<string, unknown>;

export type LoggerConfig = {
  service: string;
  level?: Level;
  json?: boolean;
  base?: LogFields;
  stream?: NodeJS.WritableStream;
  silent?: boolean;
};

function parseLevel(l?: string): Level {
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

function now() {
  return new Date().toISOString();
}

export function createLogger(config: LoggerConfig) {
  const { service, base = {} } = config;
  const hasCustomStream = config.stream !== undefined;
  const silent = resolveSilent(config.silent, hasCustomStream);
  const level = config.level ?? parseLevel(undefined);
  const json = config.json ?? parseJson(undefined);
  const stream = hasCustomStream
    ? config.stream!
    : silent
      ? NULL_STREAM
      : process.stdout;

  function emit(lvl: string, msg: string, fields?: LogFields, force = false) {
    if (!force && levelOrder[lvl as Level] < levelOrder[level]) return;
    const payload = {
      ts: now(),
      level: lvl,
      service,
      ...base,
      ...(fields || {}),
      msg,
    };
    try {
      const line = json
        ? JSON.stringify(payload)
        : `[${payload.ts}] ${service} ${lvl.toUpperCase()}: ${msg}`;
      stream.write(line + "\n");
    } catch {
      // ignore stream errors
    }
  }

  return {
    debug: (msg: string, fields?: LogFields) => emit("debug", msg, fields),
    info: (msg: string, fields?: LogFields) => emit("info", msg, fields),
    warn: (msg: string, fields?: LogFields) => emit("warn", msg, fields),
    error: (msg: string, fields?: LogFields) => emit("error", msg, fields),
    audit: (msg: string, fields?: LogFields) =>
      emit("audit", msg, fields, true),
    child(extra: LogFields) {
      return createLogger({
        service,
        level,
        json,
        base: { ...base, ...extra },
        stream,
        silent,
      });
    },
  };
}

export type Logger = ReturnType<typeof createLogger>;
