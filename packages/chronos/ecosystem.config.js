module.exports = {
  apps: [{
    name: 'chronos',
    script: 'bun',
    args: 'run src/index.ts',
    cwd: '/home/err/devel/packages/chronos',
    env: {
      CHRONOS_PORT: 5199
    },
    watch: false,
    autorestart: true,
    max_restarts: 3,
    restart_delay: 1000,
    log_file: '/home/err/.chronos/chronos.log',
    error_file: '/home/err/.chronos/chronos-error.log',
    out_file: '/home/err/.chronos/chronos-out.log'
  }]
};