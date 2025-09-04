import test from "ava";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

test("writes logs to file when LOG_FILE is set", async (t) => {
  const file = path.join(os.tmpdir(), `smartgpt-log-${Date.now()}.log`);
  process.env.LOG_FILE = file;
  const { logger } = await import("../../logger.js?" + Date.now());
  logger.info("hello-file");
  await delay(20);
  const contents = await fs.readFile(file, "utf8");
  t.true(contents.includes("hello-file"));
  await fs.unlink(file);
  delete process.env.LOG_FILE;
});
