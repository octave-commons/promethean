import test from "ava";
import { startReplayAPI } from "../shared/ts/dist/http/replay.js";

class FakeStore {
  constructor(events) {
    this.events = events;
  }
  async scan(topic, { ts = 0, afterId, limit = 1000 }) {
    let arr = this.events.filter((e) => e.topic === topic && e.ts >= ts);
    if (afterId) arr = arr.filter((e) => e.id > afterId);
    return arr.slice(0, limit);
  }
}

test("Replay API returns events and NDJSON", async (t) => {
  const events = [
    { id: "1", topic: "foo", ts: 1, payload: { a: 1 } },
    { id: "2", topic: "foo", ts: 2, payload: { a: 2 } },
  ];
  const store = new FakeStore(events);
  const server = startReplayAPI({ store, port: 0 });
  const port = server.address().port;

  const r1 = await fetch(`http://localhost:${port}/replay?topic=foo`);
  const j1 = await r1.json();
  t.is(j1.count, 2);

  const r2 = await fetch(
    `http://localhost:${port}/export?topic=foo&fromTs=1&toTs=2&ndjson=1`,
  );
  const text = await r2.text();
  t.is(text.trim().split("\n").length, 2);

  await new Promise((res) => server.close(res));
});
