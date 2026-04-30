import { initTelemetry, shutdownTelemetry } from "./lib/telemetry/otel.js";
import { createApp } from "./app.js";
import { loadConfig } from "./lib/config.js";

const telemetry = initTelemetry();

const config = loadConfig();
const app = await createApp(config);

await app.listen({ host: config.host, port: config.port });
app.log.info({ host: config.host, port: config.port }, "open-hax-openai-proxy listening");

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, async () => {
    await shutdownTelemetry();
    process.exit(0);
  });
}
