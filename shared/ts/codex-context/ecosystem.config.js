// PM2 ecosystem configuration for Promethean SmartGPT Bridge
// Usage:
//   ROOT_PATH=/abs/path/to/repo pnpm dlx pm2 start ecosystem.config.js --env production
//   pm2 status
//   pm2 logs smartgpt-bridge

import path from "path";
import { fileURLToPath } from "url";
import { defineApp } from "../../../dev/pm2Helpers.js";
// import deps from './ecosystem.dependencies.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __rootpath = path.join(__dirname, "../../..");

export const apps = [
  defineApp("codex-context", "dist/index.js", [], {
    cwd: __dirname,

    time: true,
    log_date_format: "YYYY-MM-DD HH:mm:ss.SSS",

    watch: [path.join(__dirname, "src")],
  }),
];

export default { apps };
