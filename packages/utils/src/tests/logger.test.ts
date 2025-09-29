import { Writable } from "stream";

import test from "ava";

import { createLogger, type LogFields } from "../logger.js";

class MemoryStream extends Writable {
  readonly chunks: string[] = [];
  override _write(
    chunk: Buffer | string,
    _enc: BufferEncoding,
    cb: (error?: Error | null) => void,
  ): void {
    const value = typeof chunk === "string" ? chunk : chunk.toString();
    this.chunks.push(value);
    cb();
  }
}

const parseJsonLine = (line: string): Record<string, unknown> => {
  const parsed = JSON.parse(line) as unknown;
  if (typeof parsed !== "object" || parsed === null) {
    throw new TypeError("expected log line to decode to an object");
  }
  return parsed as Record<string, unknown>;
};

const expectStringField = (
  obj: Record<string, unknown>,
  key: string,
): string => {
  const value = obj[key];
  if (typeof value !== "string") {
    throw new TypeError(`expected \`${key}\` to be a string`);
  }
  return value;
};

const expectFields = (
  obj: Record<string, unknown>,
  fields: LogFields,
): void => {
  for (const [key, expected] of Object.entries(fields)) {
    if (obj[key] !== expected) {
      throw new TypeError(`expected field ${key} to match`);
    }
  }
};

test("filters by level", (t) => {
  const stream = new MemoryStream();
  const log = createLogger({ service: "t", level: "info", stream });
  log.debug("ignore");
  log.info("hello");
  t.is(stream.chunks.length, 1);
  const line = stream.chunks[0]!;
  t.true(line.includes("hello"));
});

test("json output", (t) => {
  const stream = new MemoryStream();
  const log = createLogger({ service: "t", json: true, stream });
  log.info("hi");
  const obj = parseJsonLine(stream.chunks[0]!);
  t.is(expectStringField(obj, "msg"), "hi");
  t.is(expectStringField(obj, "service"), "t");
});

test("child logger merges fields", (t) => {
  const stream = new MemoryStream();
  const log = createLogger({ service: "t", json: true, stream });
  log.child({ comp: "c" }).info("ok");
  const obj = parseJsonLine(stream.chunks[0]!);
  expectFields(obj, { comp: "c" });
  t.is(expectStringField(obj, "msg"), "ok");
});

test("audit bypasses level filter", (t) => {
  const stream = new MemoryStream();
  const log = createLogger({
    service: "t",
    level: "error",
    json: true,
    stream,
  });
  log.audit("auth", { user: 1 });
  const obj = parseJsonLine(stream.chunks[0]!);
  t.is(expectStringField(obj, "msg"), "auth");
  t.is(obj.user, 1);
});

test.serial("defaults to silent when NODE_ENV=test", (t) => {
  const prevNodeEnv = process.env.NODE_ENV;
  const prevLogSilent = process.env.LOG_SILENT;
  process.env.NODE_ENV = "test";
  delete process.env.LOG_SILENT;

  const stdout = process.stdout;
  const originalWrite = stdout.write;
  const sentinel = new Error("stdout-write-called");
  stdout.write = ((..._args: Parameters<typeof originalWrite>) => {
    throw sentinel;
  }) as typeof originalWrite;

  try {
    const log = createLogger({ service: "t" });
    t.notThrows(() => {
      log.info("quiet");
    });
  } finally {
    stdout.write = originalWrite;
    if (prevNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = prevNodeEnv;
    if (prevLogSilent === undefined) delete process.env.LOG_SILENT;
    else process.env.LOG_SILENT = prevLogSilent;
  }
});

test.serial("LOG_SILENT=false opt-in re-enables output", (t) => {
  const prevNodeEnv = process.env.NODE_ENV;
  const prevLogSilent = process.env.LOG_SILENT;
  process.env.NODE_ENV = "test";
  process.env.LOG_SILENT = "false";

  const stdout = process.stdout;
  const originalWrite = stdout.write;
  const sentinel = new Error("stdout-write-called");
  stdout.write = ((..._args: Parameters<typeof originalWrite>) => {
    throw sentinel;
  }) as typeof originalWrite;

  try {
    const log = createLogger({ service: "t" });
    t.throws(
      () => {
        log.info("loud");
      },
      { is: sentinel },
    );
  } finally {
    stdout.write = originalWrite;
    if (prevNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = prevNodeEnv;
    if (prevLogSilent === undefined) delete process.env.LOG_SILENT;
    else process.env.LOG_SILENT = prevLogSilent;
  }
});
