import path from "path";
import { fileURLToPath } from "url";
import { defineApp } from "@promethean/pm2-helpers";
import deps from "../../../packages/file-watcher/ecosystem.dependencies.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageDir = path.resolve(__dirname, "../../../packages/file-watcher");
const root = path.resolve(packageDir, "../..");

if (!process.env.PROMETHEAN_ROOT_ECOSYSTEM) {
  defineApp.PYTHONPATH = root;
  defineApp.HEARTBEAT_PORT = 5005;
}

const apps = [
  defineApp("file-watcher", "dist/index.js", [], {
    cwd: packageDir,
    watch: [packageDir],
    env: {
      NODE_ENV: "production",
      REPO_ROOT: root,
    },
  }),
];

const allApps = !process.env.PROMETHEAN_ROOT_ECOSYSTEM
  ? [...apps, ...(deps?.apps || [])]
  : apps;

export default { apps: allApps };
