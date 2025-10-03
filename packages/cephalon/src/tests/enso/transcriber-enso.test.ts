import test from "ava";

import { ToPcm16kMono } from "../../enso/transcriber-enso.js";

function runThroughDownmix(samples: readonly number[]) {
  return new Promise<Int16Array>((resolve, reject) => {
    const transform = new ToPcm16kMono();
    const outputs: number[] = [];
    transform.on("data", (chunk) => {
      for (let i = 0; i < chunk.length; i += 2) {
        outputs.push(chunk.readInt16LE(i));
      }
    });
    transform.on("error", reject);
    transform.on("end", () => resolve(Int16Array.from(outputs)));

    const buffer = Buffer.alloc(samples.length * 2);
    samples.forEach((value, idx) => {
      buffer.writeInt16LE(value, idx * 2);
    });

    transform.end(buffer);
  });
}

test("ToPcm16kMono clamps extreme sample values without wrapping", async (t) => {
  const negative = await runThroughDownmix(new Array(6).fill(-32768));
  t.deepEqual([...negative], [-32768]);

  const positive = await runThroughDownmix(new Array(6).fill(32767));
  t.deepEqual([...positive], [32767]);
});
