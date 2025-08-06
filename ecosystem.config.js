const { defineApp } = require("./dev/pm2Helpers.js");
const {
  apps: [embeddingService],
} = require("./ecosystem.embedder.js");
defineApp.PYTHONPATH = __dirname;
const duck = require("./agents/duck/ecosystem.config.js");
defineApp.HEARTBEAT_PORT = 5005;

module.exports = {
  apps: [
    ...duck.apps,
    embeddingService,
    defineApp(
      "tts",
      "pipenv",
      ["run", "uvicorn", "--host", "0.0.0.0", "--port", "5001", "app:app"],
      {
        cwd: "./services/py/tts",
        watch: ["./services/py/tts"],

        env: {},
      },
    ),
    defineApp(
      "stt",
      "pipenv",
      ["run", "uvicorn", "--host", "0.0.0.0", "--port", "5002", "app:app"],
      {
        cwd: "./services/py/stt",
        watch: ["./services/py/stt"],
        env: {
          FLASK_APP: "app.py",
          FLASK_ENV: "production",
        },
      },
    ),
    defineApp("file-watcher", ".", [], {
      cwd: "./services/ts/file-watcher",
      watch: ["./services/ts/file-watcher"],
      env: {
        NODE_ENV: "production",
        REPO_ROOT: __dirname,
      },
    }),

    defineApp("vision", ".", [], {
      cwd: "./services/js/vision",
      watch: ["./services/js/vision/"],
      env: { PORT: 9999 },
    }),
    defineApp("llm", ".", [], {
      cwd: "./services/ts/llm",
      watch: ["./services/ts/llm/src"],
      env: { LLM_PORT: 8888 },
    }),
    defineApp("heartbeat", ".", [], {
      cwd: "./services/js/heartbeat",
      watch: ["./services/js/heartbeat/"],
      env: {
        PORT: defineApp.HEARTBEAT_PORT,
      },
    }),
  ],
};
