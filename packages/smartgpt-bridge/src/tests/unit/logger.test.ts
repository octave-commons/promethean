import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Writable } from "node:stream";

import test from "ava";

import { sleep } from "@promethean/test-utils/sleep";

test("writes logs to file when LOG_FILE is set", async (t) => {
  const file = path.join(os.tmpdir(), `smartgpt-log-${Date.now()}.log`);
  process.env.LOG_FILE = file;
  const { logger } = await import("../../logger.js?" + Date.now());
  logger.info("hello-file");
  await sleep(20);
  const contents = await fsp.readFile(file, "utf8");
  t.true(contents.includes("hello-file"));
  await fsp.unlink(file);
  delete process.env.LOG_FILE;
});

test("falls back to stdout when log file stream errors", async (t) => {
  process.env.LOG_FILE = path.join(os.tmpdir(), `smartgpt-log-${Date.now()}.log`);

  const originalCreate = fs.createWriteStream;
  fs.createWriteStream = () => {
    const stream = new Writable({
      write(_chunk, _enc, cb) {
        cb();
      },
    });
    setImmediate(() => stream.emit("error", new Error("disk full")));
    return stream as unknown as fs.WriteStream;
  };

  let errorLogged = false;
  const originalError = console.error;
  console.error = () => {
    errorLogged = true;
  };

  const { logger } = await import("../../logger.js?" + Date.now());
  t.notThrows(() => logger.info("hello-error"));
  await sleep(20);
  t.true(errorLogged);

  console.error = originalError;
  fs.createWriteStream = originalCreate;
  delete process.env.LOG_FILE;
});
