// SPDX-License-Identifier: GPL-3.0-only
import path from "path";
import { fileURLToPath } from "url";
import { defineApp } from "../../dev/pm2Helpers.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, "../../..");

if (!process.env.PROMETHEAN_ROOT_ECOSYSTEM) {
  defineApp.PYTHONPATH = root;
  defineApp.HEARTBEAT_PORT = 5005;
}

const apps = [
  defineApp("auth-service", "dist/index.js", [], {
    cwd: __dirname,
    watch: [__dirname],
    env: {
      NODE_ENV: "production",
      PORT: process.env.PORT || 8088,
      AUTH_ISSUER: process.env.AUTH_ISSUER || "http://localhost:8088",
    },
  }),
];

export default { apps };
