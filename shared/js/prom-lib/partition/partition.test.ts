import { InMemoryEventBus } from "../event/memory";
import { jumpHash } from "./jump";
import { PartitionCoordinator } from "./coordinator";
import { subscribePartitioned } from "./subscribe";

test("jumpHash is deterministic", () => {
  expect(jumpHash("foo", 8)).toBe(jumpHash("foo", 8));
});

test("subscribePartitioned routes events to owners and rebalances", async () => {
  const bus = new InMemoryEventBus();
  const coord = new PartitionCoordinator();
  const eventsA: string[] = [];
  const eventsB: string[] = [];

  const unsubA = await subscribePartitioned(
    bus,
    "t",
    async (e) => {
      eventsA.push(e.id);
    },
    coord,
    { group: "g", memberId: "A", partitions: 4, rebalanceEveryMs: 50 },
  );
  const unsubB = await subscribePartitioned(
    bus,
    "t",
    async (e) => {
      eventsB.push(e.id);
    },
    coord,
    { group: "g", memberId: "B", partitions: 4, rebalanceEveryMs: 50 },
  );

  await new Promise((r) => setTimeout(r, 100));
  const assign1 = coord.assign("g", 4);
  const findKey = (p: number) => {
    let i = 0;
    while (true) {
      const k = `k${p}-${i++}`;
      if (jumpHash(k, 4) === p) return k;
    }
  };
  const partB = Number(
    Object.keys(assign1.owners).find((p) => assign1.owners[Number(p)] === "B")!,
  );
  const keyB = findKey(partB);
  await bus.publish("t", { foo: 1 }, { key: keyB });
  await new Promise((r) => setTimeout(r, 50));
  expect(eventsB.length).toBe(1);
  expect(eventsA.length).toBe(0);

  await unsubB();
  await new Promise((r) => setTimeout(r, 100));
  const assign2 = coord.assign("g", 4);
  expect(assign2.owners[partB]).toBe("A");
  await bus.publish("t", { foo: 2 }, { key: keyB });
  await new Promise((r) => setTimeout(r, 50));
  expect(eventsA.length).toBe(1);
  await unsubA();
});
