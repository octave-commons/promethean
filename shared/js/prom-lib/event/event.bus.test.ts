import { InMemoryEventBus } from "./memory";

test("publish -> subscribe (earliest) delivers and advances cursor", async () => {
  const bus = new InMemoryEventBus();
  const seen: string[] = [];

  await bus.subscribe(
    "t.a",
    "g1",
    async (e) => {
      seen.push(e.payload as string);
    },
    { from: "earliest" },
  );

  await bus.publish("t.a", "one");
  await bus.publish("t.a", "two");

  await new Promise((r) => setTimeout(r, 50));
  expect(seen).toEqual(["one", "two"]);

  const cur = await bus.getCursor("t.a", "g1");
  expect(cur?.lastId).toBeTruthy();
});

test("nack leaves cursor; event is retried", async () => {
  const bus = new InMemoryEventBus();
  let attempts = 0;

  await bus.subscribe(
    "t.b",
    "g1",
    async (e) => {
      attempts++;
      if (attempts === 1) throw new Error("boom");
    },
    { from: "earliest" },
  );

  await bus.publish("t.b", "x");
  await new Promise((r) => setTimeout(r, 80));
  expect(attempts).toBeGreaterThanOrEqual(2);
});
