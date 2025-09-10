import fs from "node:fs";
import path from "node:path";
import { Writable } from "node:stream";

export function buildLogStream(fsMod: typeof fs = fs): NodeJS.WritableStream {
  const outputs: NodeJS.WritableStream[] = [process.stdout];
  const logFile = process.env.LOG_FILE;

  if (logFile) {
    try {
      fsMod.mkdirSync(path.dirname(logFile), { recursive: true });
      const fileStream = fsMod.createWriteStream(logFile, { flags: "a" });
      fileStream.on("error", (error) => {
        console.error("log file stream error", error);
        const idx = outputs.indexOf(fileStream);
        if (idx !== -1) outputs.splice(idx, 1);
        try {
          if (typeof (fileStream as any).destroy === "function") {
            (fileStream as any).destroy();
          }
        } catch {
          // ignore destroy errors
        }
      });
      outputs.push(fileStream);
    } catch {
      // ignore file errors and fall back to stdout only
    }
  }

  if (outputs.length === 1) return outputs[0]!;

  return new Writable({
    write(chunk, _enc, cb) {
      let pending = outputs.length;
      const done = () => {
        pending -= 1;
        if (pending === 0) cb();
      };
      for (const out of outputs) {
        if (out.write(chunk) === false) out.once("drain", done);
        else done();
      }
    },
  });
}

export const logStream = buildLogStream();
