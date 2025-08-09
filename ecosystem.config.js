import { defineApp } from "./dev/pm2Helpers.js";
defineApp.PYTHONPATH = __dirname;
defineApp.HEARTBEAT_PORT = 5005;
process.env.PROMETHEAN_ROOT_ECOSYSTEM = "1";

import duck from "./agents/duck/ecosystem.config.js";

const services = Promise.all([
  import("./services/py/embedding_service/ecosystem.config.js"),
  import("./services/py/tts/ecosystem.config.js"),
  import("./services/py/stt/ecosystem.config.js"),
  import("./services/ts/file-watcher/ecosystem.config.js"),
  import("./services/js/vision/ecosystem.config.js"),
  import("./services/ts/llm/ecosystem.config.js"),
  import("./services/js/heartbeat/ecosystem.config.js"),
  import("./services/js/proxy/ecosystem.config.js"),
  import("./services/js/eidolon-field/ecosystem.config.js"),
  import("./services/ts/markdown-graph/ecosystem.config.js"),
]);

export default {
  apps: [...duck.apps, ...services.flatMap((svc) => svc.apps)],
};
