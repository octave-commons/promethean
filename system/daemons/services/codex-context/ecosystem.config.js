// PM2 ecosystem configuration for Promethean SmartGPT Bridge
// Usage:
//   ROOT_PATH=/abs/path/to/repo pnpm dlx pm2 start system/daemons/services/codex-context/ecosystem.config.js --env production
//   pm2 status
//   pm2 logs smartgpt-bridge

import path from "path";
import { fileURLToPath } from "url";
import { defineApp } from "@promethean/pm2-helpers";
// import deps from '../../../packages/codex-context/ecosystem.dependencies.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageDir = path.resolve(__dirname, "../../../packages/codex-context");
const __rootpath = path.resolve(packageDir, "../..");

export const apps = [
  defineApp("codex-context", "dist/index.js", [], {
    cwd: packageDir,

    time: true,
    log_date_format: "YYYY-MM-DD HH:mm:ss.SSS",

    watch: [path.join(packageDir, "src")],
  }),
];

export default { apps };
