const path = require("path");
const cwd = __dirname;

module.exports = {
  apps: [
    {
      name: "proxy-dev",
      script: "node",
      args: ["--env-file-if-exists=.env", "dist/main.js"],
      cwd,
      env: {
        NODE_ENV: "development",
        PROXY_HOST: "127.0.0.1",
        PROXY_PORT: "8795",
        PORT: "8795",
        PROXY_ALLOW_UNAUTHENTICATED: "true",
      },
      autorestart: false,
      watch: false,
      time: true,
      kill_timeout: 3000,
    },
    {
      name: "proxy-dev-web",
      script: "pnpm",
      args: ["exec", "vite", "preview", "--config", "web/vite.config.ts", "--host", "127.0.0.1", "--port", "5175"],
      cwd,
      env: {
        NODE_ENV: "development",
      },
      autorestart: false,
      watch: false,
      time: true,
      kill_timeout: 3000,
    },
  ],
};
