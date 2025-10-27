export default {
  apps: [
    {
      name: 'frontend-main',
      script: 'shadow-cljs',
      args: 'watch main',
      cwd: '/home/err/devel/promethean/packages/frontend',
      interpreter: 'node',
      interpreter_args: '--max-old-space-size=4096',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/main-error.log',
      out_file: './logs/main-out.log',
      log_file: './logs/main-combined.log',
      time: true,
    },
    {
      name: 'frontend-pantheon',
      script: 'vite',
      args: '--port 3001 --host 0.0.0.0',
      cwd: '/home/err/devel/promethean/packages/frontend',
      interpreter: 'node',
      interpreter_args: '--max-old-space-size=4096',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 3001,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/pantheon-error.log',
      out_file: './logs/pantheon-out.log',
      log_file: './logs/pantheon-combined.log',
      time: true,
    },
  ],

  deploy: {
    production: {
      user: 'deploy',
      host: 'localhost',
      ref: 'origin/main',
      repo: 'git@github.com:promethean/frontend.git',
      path: '/var/www/promethean/frontend',
      'pre-deploy-local': '',
      'post-deploy': 'pnpm install && pnpm run build',
      'pre-setup': '',
    },
  },
};
