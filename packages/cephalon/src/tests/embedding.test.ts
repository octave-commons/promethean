// SPDX-License-Identifier: GPL-3.0-only
import test from "ava";
// import path from "path";
// import { fileURLToPath } from "url";

// const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Use memory broker via BrokerClient
// @ts-ignore dynamic import of JS modules

import { RemoteEmbeddingFunction } from "@promethean/embeddings/remote.js";
const clientModule = await import("@promethean/legacy/brokerClient.js");
const { BrokerClient } = clientModule;

if (process.env.SKIP_NETWORK_TESTS === "1") {
  test("cephalon embedding network tests skipped in sandbox", (t) => t.pass());
} else {
  test("requests embeddings via broker", async (t) => {
    process.env.BROKER_URL = "memory://emb";
    const worker = new BrokerClient({
      url: process.env.BROKER_URL,
      id: "embed-worker",
    });
    await worker.connect();
    worker.onTaskReceived(async (task: any) => {
      await worker.ack(task.id);
      const items = task.payload.items || [];
      const embeddings = items.map((_: unknown, i: number) => [i]);
      await worker.publish(
        "embedding.result",
        { embeddings },
        {
          replyTo: task.payload.replyTo,
          correlationId: task.id,
        },
      );
      await worker.ready(task.queue);
    });
    await worker.ready("embedding.generate");
    const fn = new RemoteEmbeddingFunction();
    const result = await fn.generate(["a", "b"]);
    t.deepEqual(result, [[0], [1]]);
    fn.broker.socket?.close();
    worker.socket?.close();
  });
}
