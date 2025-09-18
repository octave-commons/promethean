import fs from "node:fs";
import path from "node:path";
import { PassThrough } from "node:stream";

export function buildLogStream(fsMod: typeof fs = fs): NodeJS.WritableStream {
  const logFile = process.env.LOG_FILE;
  if (!logFile) {
    return process.stdout;
  }

  const tee = new PassThrough();
  tee.pipe(process.stdout);

  try {
    fsMod.mkdirSync(path.dirname(logFile), { recursive: true });
    const fileStream = fsMod.createWriteStream(logFile, { flags: "a" });
    fileStream.on("error", (error) => {
      console.error("log file stream error", error);
      tee.unpipe(fileStream);
      try {
        fileStream.destroy();
      } catch {
        // ignore destroy errors
      }
    });
    tee.pipe(fileStream);
  } catch (error) {
    console.error("log file stream setup error", error);
  }

  return tee;
}

export const logStream = buildLogStream();
