import path from "path";
import { fileURLToPath } from "url";
import { defineApp } from "@promethean/pm2-helpers";
import deps from "../../../packages/proxy/ecosystem.dependencies.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageDir = path.resolve(__dirname, "../../../packages/proxy");
const root = path.resolve(packageDir, "../..");

if (!process.env.PROMETHEAN_ROOT_ECOSYSTEM) {
  defineApp.PYTHONPATH = root;
  defineApp.HEARTBEAT_PORT = 5005;
}

const apps = [
  defineApp("proxy", "index.js", [], {
    cwd: packageDir,
    watch: [packageDir],
    env: { PORT: 8080 },
  }),
];

const allApps = !process.env.PROMETHEAN_ROOT_ECOSYSTEM
  ? [...apps, ...(deps?.apps || [])]
  : apps;

export default { apps: allApps };
