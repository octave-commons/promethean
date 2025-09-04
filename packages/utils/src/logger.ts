export type Level = "debug" | "info" | "warn" | "error";

const levelOrder: Record<Level, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

export type LogFields = Record<string, unknown>;

export interface LoggerConfig {
  service: string;
  level?: Level;
  json?: boolean;
  base?: LogFields;
  stream?: NodeJS.WritableStream;
}

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

function now() {
  return new Date().toISOString();
}

export function createLogger(config: LoggerConfig) {
  const {
    service,
    level = parseLevel(config.level),
    json = parseJson(config.json),
    base = {},
    stream = process.stdout,
  } = config;

  function emit(lvl: string, msg: string, fields?: LogFields, force = false) {
    if (!force && levelOrder[lvl as Level] < levelOrder[level]) return;
    const payload = { ts: now(), level: lvl, service, ...base, ...(fields || {}), msg };
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
    audit: (msg: string, fields?: LogFields) => emit("audit", msg, fields, true),
    child(extra: LogFields) {
      return createLogger({ service, level, json, base: { ...base, ...extra }, stream });
    },
  };
}

export type Logger = ReturnType<typeof createLogger>;
