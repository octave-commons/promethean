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

  if (outputs.length === 1) return outputs[0] as NodeJS.WritableStream;

  return new Writable({
    write(chunk, _enc, cb) {
      const targets = outputs.slice();
      let pending = targets.length;
      let firstErr: unknown = null;
      const done = () => {
        pending -= 1;
        if (pending === 0) cb(firstErr instanceof Error ? firstErr : undefined);
      };
      for (const out of targets) {
        const onError = (err: unknown) => {
          if (firstErr === null) firstErr = err;
          out.off("drain", onDrain);
          done();
        };
        const onDrain = () => {
          out.off("error", onError);
          done();
        };
        out.once("error", onError);
        try {
          if (out.write(chunk) === false) {
            out.once("drain", onDrain);
          } else {
            out.off("error", onError);
            done();
          }
        } catch (err) {
          if (firstErr === null) firstErr = err;
          out.off("error", onError);
          out.off("drain", onDrain);
          done();
        }
      }
    },
  });
}

export const logStream = buildLogStream();
