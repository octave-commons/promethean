import test from "ava";
import { Writable } from "stream";
import { createLogger } from "../logger.js";

class MemoryStream extends Writable {
  chunks: string[] = [];
  override _write(chunk: any, _enc: BufferEncoding, cb: (error?: Error | null) => void) {
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
  const log = createLogger({ service: "t", level: "error", json: true, stream });
  log.audit("auth", { user: 1 });
  const obj = JSON.parse(stream.chunks[0]!);
  t.is(obj.msg, "auth");
  t.is(obj.user, 1);
});
