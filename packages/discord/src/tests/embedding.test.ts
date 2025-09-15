import test from "ava";
import { RemoteEmbeddingFunction } from "@promethean/embedding";
import type { BrokerClient } from "@promethean/legacy/brokerClient.js";

type BrokerEvent = { replyTo: string; payload: { embeddings: number[][] } };
type BrokerClientLike = {
  connect(): Promise<void>;
  subscribe(topic: string, cb: (e: BrokerEvent) => void): void;
  enqueue(queue: string, payload: { items: unknown[]; replyTo: string }): void;
  socket: { close: () => void };
};

class MockBrokerClient implements BrokerClientLike {
  handlers: Record<string, Array<(e: BrokerEvent) => void>> = {};
  socket = { close: () => {} };
  async connect() {}
  subscribe(topic: string, cb: (e: BrokerEvent) => void) {
    if (!this.handlers[topic]) this.handlers[topic] = [];
    // eslint-disable-next-line functional/immutable-data
    this.handlers[topic]!.push(cb);
  }
  enqueue(queue: string, payload: { items: unknown[]; replyTo: string }) {
    if (queue !== "embedding.generate") return;
    const embeddings = payload.items.map((_, i) => [i]);
    const ev = { replyTo: payload.replyTo, payload: { embeddings } };
    (this.handlers["embedding.result"] || []).forEach((cb) => cb(ev));
  }
}

test("requests embeddings via mocked broker", async (t) => {
  const mock = new MockBrokerClient();
  const fn = new RemoteEmbeddingFunction(
    undefined,
    undefined,
    undefined,
    mock as unknown as BrokerClient,
  );
  const result = await fn.generate(["a", "b"]);
  t.deepEqual(result, [[0], [1]]);
});
