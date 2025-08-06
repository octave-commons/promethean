const { defineApp } = require("./dev/pm2Helpers.js");
defineApp.PYTHONPATH = __dirname;
const duck = require("./agents/duck/ecosystem.config.js");
defineApp.HEARTBEAT_PORT = 5005;

module.exports = {
  apps: [
    defineApp(
      "embeddings_provider",
      "pipenv",
      ["run", "python", "-m", "main"],
      {
        cwd: "./services/py/embedding_service",
        watch: ["./services/py/embedding_service"],
      },
    ),
  ],
};
