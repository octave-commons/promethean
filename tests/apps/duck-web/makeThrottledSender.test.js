import test from "ava";
import { randomUUID } from "node:crypto";
import { readFile, unlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import ts from "typescript";
import { pathToFileURL } from "node:url";

const loadSender = async () => {
  const sourceUrl = new URL(
    "../../../apps/duck-web/src/net/send.ts",
    import.meta.url,
  );
  const sourceCode = await readFile(sourceUrl, "utf8");
  const { outputText } = ts.transpileModule(sourceCode, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      sourceMap: true,
      inlineSourceMap: true,
      inlineSources: true,
    },
    fileName: "send.ts",
  });
  const tmpFile = path.join(
    os.tmpdir(),
    `makeThrottledSender-${randomUUID()}.mjs`,
  );
  await writeFile(tmpFile, outputText, "utf8");
  try {
    return await import(pathToFileURL(tmpFile).href);
  } finally {
    await unlink(tmpFile).catch(() => {
      // ignore cleanup failures in CI environments without write permissions
    });
  }
};

let makeThrottledSender;

test.before(async () => {
  ({ makeThrottledSender } = await loadSender());
});

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class FakeDataChannel {
  constructor() {
    this.bufferedAmount = 0;
    this.bufferedAmountLowThreshold = 0;
    this.readyState = "open";
    this.sent = [];
    this.listeners = [];
  }

  addEventListener(type, listener) {
    if (type !== "bufferedamountlow") {
      return;
    }

    this.listeners = [...this.listeners, listener];
  }

  send(data) {
    this.sent = [...this.sent, data];
  }

  emitBufferedAmountLow() {
    const queue = [...this.listeners];
    queue.forEach((listener) => listener());
  }
}

const toByteArray = (value) => {
  if (value instanceof Uint8Array) {
    return [...value];
  }

  return [...new Uint8Array(value)];
};

test("makeThrottledSender waits for bufferedamountlow before sending", async (t) => {
  const channel = new FakeDataChannel();
  channel.bufferedAmount = 8;
  const send = makeThrottledSender(channel, 1);

  const payload = new Uint8Array([1, 2, 3]);
  const sendPromise = send(payload);

  const raceResult = await Promise.race([
    sendPromise.then(() => "sent"),
    delay(10).then(() => "pending"),
  ]);

  t.is(raceResult, "pending");
  t.deepEqual(channel.sent, []);

  channel.bufferedAmount = 0;
  channel.emitBufferedAmountLow();
  await sendPromise;

  t.is(channel.sent.length, 1);
  t.deepEqual(toByteArray(channel.sent[0]), [1, 2, 3]);
  t.is(channel.bufferedAmountLowThreshold, 1);
});

test("makeThrottledSender skips send when channel is not open", async (t) => {
  const channel = new FakeDataChannel();
  channel.readyState = "closing";
  const send = makeThrottledSender(channel, 1);

  await send(new Uint8Array([4, 5, 6]));

  t.deepEqual(channel.sent, []);
});
