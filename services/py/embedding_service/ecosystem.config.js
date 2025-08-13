import path from "path";
import { fileURLToPath } from "url";
import { defineApp } from "../../../dev/pm2Helpers.js";
import deps from "./ecosystem.dependencies.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, "../../..");

if (!process.env.PROMETHEAN_ROOT_ECOSYSTEM) {
  defineApp.PYTHONPATH = root;
  defineApp.HEARTBEAT_PORT = 5005;
}

const apps = [
  defineApp("embeddings_provider", "pipenv", ["run", "python", "-m", "main"], {
    cwd: __dirname,
    watch: [__dirname],
    env: {
      EMBEDDING_DRIVER: "ollama",
      EMBEDDING_FUNCTION: "nomic-embed-text",
    },
  }),
];

const allApps = !process.env.PROMETHEAN_ROOT_ECOSYSTEM
  ? [...apps, ...(deps?.apps || [])]
  : apps;

export default { apps: allApps };
