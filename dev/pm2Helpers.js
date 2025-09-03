// SPDX-License-Identifier: GPL-3.0-only
// pm2Helpers.js (updated)
import path from "path";

import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function defineApp(name, script, args = [], opts = {}) {
  const {
    cwd,
    watch,
    ignore_watch,
    env_file,
    env = {},
    instances = 1,
    exec_mode = "fork",
  } = opts;

  const out = {
    name,
    script,
    args,
    exec_mode,
    cwd,
    watch: [...(watch || [])],
    ignore_watch: [...(ignore_watch || []), "**/*.log"],
    env_file,
    out_file: `./logs/${name}-out.log`,
    error_file: `./logs/${name}-err.log`,
    merge_logs: true,
    instances,
    autorestart: true,
    restart_delay: 10000,
    kill_timeout: 10000,
    env: {
      ...env,
      PM2_PROCESS_NAME: name,
      HEARTBEAT_PORT: defineApp.HEARTBEAT_PORT,
      PYTHONUNBUFFERED: "1",
      PYTHONPATH: defineApp.PYTHONPATH,
      CHECK_INTERVAL: 1000 * 60 * 5,
      HEARTBEAT_TIMEOUT: 1000 * 60 * 10,
    },
  };

  if (script === "uv") {
    out.interpreter = "none";
  }
  return out;
}

defineApp.HEARTBEAT_PORT = 5005;
defineApp.PYTHONPATH = path.resolve(__dirname, "..");

export function definePythonService(name, serviceDir, opts = {}) {
  return defineApp(name, "uv", ["run", "python", "-m", "main"], {
    interpreter: "none",
    cwd: serviceDir,
    ...opts,
  });
}

export function defineNodeService(name, serviceDir, opts = {}) {
  return defineApp(name, ".", [], {
    cwd: serviceDir,
    ...opts,
  });
}

export function defineAgent(name, appDefs, opts = {}) {
  return {
    name,
    apps: appDefs.map((app) => ({
      ...app,
      name: `${name}_${app.name}`,
      env: {
        ...(app.env || {}),
        AGENT_NAME: name,
      },
    })),
    ...opts,
  };
}
