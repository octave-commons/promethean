import { buildApp } from "./app.js";
import { loadConfig } from "./lib/config.js";

const cfg = loadConfig();
const app = await buildApp(cfg);

await app.listen({ host: cfg.host, port: cfg.port });
app.log.info({ host: cfg.host, port: cfg.port }, "openplanner listening");
