// ecosystem.config.js (ESM, but NO top-level await)
import { defineApp } from "./dev/pm2Helpers.js";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

defineApp.PYTHONPATH = __dirname;
defineApp.HEARTBEAT_PORT = 5005;
process.env.PROMETHEAN_ROOT_ECOSYSTEM = "1";

// Agents
import duck from "./agents/duck/ecosystem.config.js";

// Services (static imports, no await)
import svc_embed from "./services/py/embedding_service/ecosystem.config.js";
import svc_tts from "./services/py/tts/ecosystem.config.js";
import svc_stt from "./services/py/stt/ecosystem.config.js";
import svc_filewatch from "./services/ts/file-watcher/ecosystem.config.js";
import svc_vision from "./services/js/vision/ecosystem.config.js";
import svc_llm from "./services/ts/llm/ecosystem.config.js";
import svc_heartbeat from "./services/js/heartbeat/ecosystem.config.js";
import svc_proxy from "./services/js/proxy/ecosystem.config.js";
import svc_eidolon from "./services/js/eidolon-field/ecosystem.config.js";
import svc_mdgraph from "./services/ts/markdown-graph/ecosystem.config.js";

const duckApps = duck.default?.apps ?? duck.apps ?? [];
const svcMods = [
  svc_embed, svc_tts, svc_stt, svc_filewatch, svc_vision,
  svc_llm, svc_heartbeat, svc_proxy, svc_eidolon, svc_mdgraph,
];
const serviceApps = svcMods.flatMap(m => m?.default?.apps ?? m?.apps ?? []);

const apps = [...duckApps, ...serviceApps];

// Optional sanity check; fails fast if any entry is missing a script
for (const [i, app] of apps.entries()) {
  if (!app?.script && !app?.pm_exec_path) {
    console.error("PM2 config error: app missing 'script'", app?.name || `#${i}`, app);
    process.exit(1);
  }
}

export default { apps };
