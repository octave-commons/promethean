import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Writable } from "node:stream";

import test from "ava";
import { createLogger, sleep } from "@promethean/utils";

test.serial("writes logs to file when LOG_FILE is set", async (t) => {
  const file = path.join(os.tmpdir(), `smartgpt-log-${Date.now()}.log`);
  process.env.LOG_FILE = file;
  const { buildLogStream } = await import(`../../log-stream.js?${Date.now()}`);
  const logger = createLogger({
    service: "smartgpt-bridge",
    stream: buildLogStream(),
  });
  logger.info("hello-file");
  await sleep(300);
  // Retry read to allow async file open/flush
  let contents = "";
  for (let i = 0; i < 50; i++) {
    try {
      contents = await fsp.readFile(file, "utf8");
      if (contents) break;
    } catch {}
    await sleep(100);
  }
  t.true(contents.includes("hello-file"));
  await fsp.unlink(file);
  delete process.env.LOG_FILE;
});

test.serial("falls back to stdout when log file stream errors", async (t) => {
  process.env.LOG_FILE = path.join(
    os.tmpdir(),
    `smartgpt-log-${Date.now()}.log`,
  );
  // Build stream with a stubbed fs that emits async error
  const stubFs = {
    ...fs,
    createWriteStream: () => {
      const stream = new Writable({
        write(_c, _e, cb) {
          cb();
        },
      });
      setImmediate(() => stream.emit("error", new Error("disk full")));
      return stream as unknown as fs.WriteStream;
    },
  } as typeof fs;
  const { buildLogStream } = await import(`../../log-stream.js?${Date.now()}`);

  let errorLogged = false;
  const originalError = console.error;
  console.error = () => {
    errorLogged = true;
  };
  t.teardown(() => {
    console.error = originalError;
    delete process.env.LOG_FILE;
  });

  const logger = createLogger({
    service: "smartgpt-bridge",
    stream: buildLogStream(stubFs),
  });
  t.notThrows(() => logger.info("hello-error"));
  await sleep(60);
  t.true(errorLogged);
});
