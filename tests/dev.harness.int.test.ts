import { startHarness } from "../shared/js/prom-lib/dev/harness";

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
  await new Promise((r) => setTimeout(r, 50));

  // ensure projector emitted process.state
  const cur = await h.bus.getCursor("process.state", "process-projector");
  expect(cur).toBeTruthy();

  await h.stop();
}, 10_000);
