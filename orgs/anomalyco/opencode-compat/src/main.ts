import { createApp } from "./app.js";
import { loadConfig } from "./lib/config.js";

const cfg = loadConfig();
const app = await createApp(cfg);

await app.listen({ host: cfg.host, port: cfg.port });
app.log.info({ host: cfg.host, port: cfg.port }, "opencode-compat listening");
