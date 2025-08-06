exports.defineApp = function defineApp(name, script, args = [], opts = {}) {
  return {
    name,
    exec_mode: "fork",
    script,
    args,
    ...opts,
    out_file: `./logs/${name}-out.log`,
    error_file: `./logs/${name}-err.log`,
    merge_logs: true,
    instances: 1,
    autorestart: true,
    env: {
      ...opts.env,
      PM2_PROCESS_NAME: name,
      HEARTBEAT_PORT: defineApp.HEARTBEAT_PORT,
      PYTHONUNBUFFERED: "1",
      PYTHONPATH: defineApp.PYTHONPATH,
      CHECK_INTERVAL: 1000 * 60 * 5,
      HEARTBEAT_TIMEOUT: 1000 * 60 * 10,
    },
    restart_delay: 10000,
    kill_timeout: 10000,
  };
};
