import { Writable } from "stream";

import test from "ava";

import { createLogger } from "../logger.js";

class MemoryStream extends Writable {
  chunks: string[] = [];
  override _write(
    chunk: any,
    _enc: BufferEncoding,
    cb: (error?: Error | null) => void,
  ) {
    this.chunks.push(chunk.toString());
    cb();
  }
}

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
  const obj = JSON.parse(stream.chunks[0]!);
  t.is(obj.msg, "hi");
  t.is(obj.service, "t");
});

test("child logger merges fields", (t) => {
  const stream = new MemoryStream();
  const log = createLogger({ service: "t", json: true, stream });
  log.child({ comp: "c" }).info("ok");
  const obj = JSON.parse(stream.chunks[0]!);
  t.is(obj.comp, "c");
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
  const obj = JSON.parse(stream.chunks[0]!);
  t.is(obj.msg, "auth");
  t.is(obj.user, 1);
});

test.serial("defaults to silent when NODE_ENV=test", (t) => {
  const prevNodeEnv = process.env.NODE_ENV;
  const prevLogSilent = process.env.LOG_SILENT;
  process.env.NODE_ENV = "test";
  delete process.env.LOG_SILENT;

  let called = false;
  const stdout = process.stdout;
  const originalWrite = stdout.write;
  stdout.write = ((..._args: Parameters<typeof originalWrite>) => {
    called = true;
    return true;
  }) as typeof originalWrite;

  try {
    const log = createLogger({ service: "t" });
    log.info("quiet");
  } finally {
    stdout.write = originalWrite;
    if (prevNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = prevNodeEnv;
    if (prevLogSilent === undefined) delete process.env.LOG_SILENT;
    else process.env.LOG_SILENT = prevLogSilent;
  }

  t.false(called);
});

test.serial("LOG_SILENT=false opt-in re-enables output", (t) => {
  const prevNodeEnv = process.env.NODE_ENV;
  const prevLogSilent = process.env.LOG_SILENT;
  process.env.NODE_ENV = "test";
  process.env.LOG_SILENT = "false";

  let called = false;
  const stdout = process.stdout;
  const originalWrite = stdout.write;
  stdout.write = ((..._args: Parameters<typeof originalWrite>) => {
    called = true;
    return true;
  }) as typeof originalWrite;

  try {
    const log = createLogger({ service: "t" });
    log.info("loud");
  } finally {
    stdout.write = originalWrite;
    if (prevNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = prevNodeEnv;
    if (prevLogSilent === undefined) delete process.env.LOG_SILENT;
    else process.env.LOG_SILENT = prevLogSilent;
  }

  t.true(called);
});
