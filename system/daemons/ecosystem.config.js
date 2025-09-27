// ecosystem.config.js (ESM, but NO top-level await)
import { defineApp } from "@promethean/pm2-helpers";
import { fileURLToPath } from "url";
import path from "path";
import { configDotenv } from "dotenv";
configDotenv();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

defineApp.PYTHONPATH = repoRoot;
defineApp.HEARTBEAT_PORT = 5005;
process.env.PROMETHEAN_ROOT_ECOSYSTEM = "1";

export { apps } from "../ecosystem.generated.mjs";
