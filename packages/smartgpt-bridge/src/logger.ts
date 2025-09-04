import fs from "node:fs";
import path from "node:path";
import { Writable } from "node:stream";

import { createLogger } from "@promethean/utils/logger.js";

function buildStream(): NodeJS.WritableStream {
  const outputs: NodeJS.WritableStream[] = [process.stdout];
  const logFile = process.env.LOG_FILE;

  if (logFile) {
    try {
      fs.mkdirSync(path.dirname(logFile), { recursive: true });
      outputs.push(fs.createWriteStream(logFile, { flags: "a" }));
    } catch {
      // ignore file errors and fall back to stdout only
    }
  }

  if (outputs.length === 1) return outputs[0]!;

  return new Writable({
    write(chunk, _enc, cb) {
      for (const out of outputs) out.write(chunk);
      cb();
    },
  });
}

export const logger = createLogger({ service: "smartgpt-bridge", stream: buildStream() });
