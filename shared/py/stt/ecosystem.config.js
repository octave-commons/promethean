import path from "path";
import { fileURLToPath } from "url";
import { defineApp } from "../../../dev/pm2Helpers.js";
import deps from "../../shared/ecosystem.dependencies.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, "../../..");

if (!process.env.PROMETHEAN_ROOT_ECOSYSTEM) {
  defineApp.PYTHONPATH = [root, path.join(root, "services/py/shared")].join(
    ":",
  );
  defineApp.HEARTBEAT_PORT = 5005;
}

const apps = [
  defineApp("stt", "uv", ["run", "python", "-m", "service"], {
    cwd: __dirname,
    watch: [__dirname],
    env: {
      FLASK_APP: "app.py",
      FLASK_ENV: "production",
    },
  }),
];

const allApps = !process.env.PROMETHEAN_ROOT_ECOSYSTEM
  ? [...apps, ...(deps?.apps || [])]
  : apps;

export default { apps: allApps };
