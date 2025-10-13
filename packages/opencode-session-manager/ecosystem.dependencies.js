// OpenCode session manager dependencies
// This file can be used to declare additional PM2 apps that should run alongside the main opencode service

export default {
  apps: [
    // Add any dependent services here
    // Example:
    // {
    //   name: "opencode-worker",
    //   script: "src/worker.js",
    //   instances: 1,
    //   autorestart: true,
    //   watch: false,
    //   max_memory_restart: "1G",
    //   env: {
    //     NODE_ENV: "development"
    //   }
    // }
  ]
};