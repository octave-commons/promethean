import path from "path";
import { fileURLToPath } from "url";
import { defineApp } from "@promethean/pm2-helpers";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageDir = path.resolve(__dirname, "../../../packages/auth-service");
const root = path.resolve(packageDir, "../..");

if (!process.env.PROMETHEAN_ROOT_ECOSYSTEM) {
  defineApp.PYTHONPATH = root;
  defineApp.HEARTBEAT_PORT = 5005;
}

const scriptPath = path.join(packageDir, "dist/index.js");

const apps = [
  defineApp("auth-service", scriptPath, [], {
    cwd: packageDir,
    watch: [packageDir],
    env: {
      NODE_ENV: "production",
      PORT: process.env.PORT || 8088,
      AUTH_ISSUER: process.env.AUTH_ISSUER || "http://localhost:8088",
    },
  }),
];

export default { apps };
