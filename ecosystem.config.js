// ecosystem.config.js (generated wrapper)
import { defineApp } from "./dev/pm2Helpers.js";
import { fileURLToPath } from "url";
import path from "path";
import { configDotenv } from "dotenv";
configDotenv();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

defineApp.PYTHONPATH = __dirname;
defineApp.HEARTBEAT_PORT = 5005;
process.env.PROMETHEAN_ROOT_ECOSYSTEM = "1";

export { apps } from "./ecosystem.generated.mjs";
