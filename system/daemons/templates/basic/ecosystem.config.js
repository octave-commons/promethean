import path from "path";
import { fileURLToPath } from "url";
import { defineApp } from "@promethean/pm2-helpers";
import deps from "../../../templates/basic/ecosystem.dependencies.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templateDir = path.resolve(__dirname, "../../../templates/basic");
const root = path.resolve(templateDir, "../..");

if (!process.env.PROMETHEAN_ROOT_ECOSYSTEM) {
  defineApp.PYTHONPATH = root;
  defineApp.HEARTBEAT_PORT = 5005;
}

const apps = [
  defineApp("broker", "index.js", [], {
    cwd: templateDir,
    watch: [templateDir],
  }),
];

const allApps = !process.env.PROMETHEAN_ROOT_ECOSYSTEM
  ? [...apps, ...(deps?.apps || [])]
  : apps;

export default { apps: allApps };
