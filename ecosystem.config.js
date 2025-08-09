const { defineApp } = require("./dev/pm2Helpers.js");
defineApp.PYTHONPATH = __dirname;
defineApp.HEARTBEAT_PORT = 5005;
process.env.PROMETHEAN_ROOT_ECOSYSTEM = "1";

const duck = require("./agents/duck/ecosystem.config.js");

const services = [
  require("./services/py/embedding_service/ecosystem.config.js"),
  require("./services/py/tts/ecosystem.config.js"),
  require("./services/py/stt/ecosystem.config.js"),
  require("./services/ts/file-watcher/ecosystem.config.js"),
  require("./services/js/vision/ecosystem.config.js"),
  require("./services/ts/llm/ecosystem.config.js"),
  require("./services/js/heartbeat/ecosystem.config.js"),
  require("./services/js/proxy/ecosystem.config.js"),
  require("./services/js/eidolon-field/ecosystem.config.js"),
  require("./services/ts/markdown-graph/ecosystem.config.js"),
];

module.exports = {
  apps: [...duck.apps, ...services.flatMap((svc) => svc.apps)],
};
