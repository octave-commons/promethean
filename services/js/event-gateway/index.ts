import { InMemoryEventBus } from "../../shared/ts/prom-lib/event/memory";
import { startWSGateway } from "../../shared/ts/prom-lib/ws/server";
import { startHttpPublisher } from "../../shared/ts/prom-lib/http/publish";
import { startProcessProjector } from "../../shared/ts/prom-lib/examples/process/projector";
import { Topics } from "../../shared/ts/prom-lib/event/topics";

async function main() {
  const bus = new InMemoryEventBus();

  // gateway(s)
  startWSGateway(bus, Number(process.env.WS_PORT ?? 8090), {
    auth: async (token) =>
      token === process.env.WS_TOKEN
        ? { ok: true }
        : { ok: false, code: "bad_token", msg: "nope" },
  });
  startHttpPublisher(bus, Number(process.env.HTTP_PORT ?? 8081));

  // projector
  await startProcessProjector(bus);

  // sample heartbeat tick
  setInterval(() => {
    bus.publish(Topics.HeartbeatReceived, {
      pid: 1234,
      name: "stt",
      host: "local",
      cpu_pct: Math.random() * 50,
      mem_mb: 200 + Math.random() * 50,
    });
  }, 1000);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
