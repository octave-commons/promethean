import { startHarness } from "../dev/harness";

test("harness end-to-end", async () => {
  const h = await startHarness({ wsPort: 9190, httpPort: 9191 });

  // publish a heartbeat and wait a tick
  await h.bus.publish("heartbeat.received", {
    pid: 1,
    name: "stt",
    host: "local",
    cpu_pct: 1,
    mem_mb: 2,
  });
  await new Promise((r) => setTimeout(r, 200));

  // ensure projector emitted process.state
  const events = await (h.bus as any).store.scan("process.state", { ts: 0 });
  expect(events.length).toBe(1);
  const cur = await h.bus.getCursor("heartbeat.received", "process-projector");
  expect(cur).toBeTruthy();

  await h.stop();
}, 10_000);
