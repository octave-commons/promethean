// Standardized Agent Ecosystem Configuration
// This config focuses on core agents with consistent patterns

import { config as configDotenv } from 'dotenv';

configDotenv();

const agentDefaults = {
  exec_mode: 'fork',
  instances: 1,
  autorestart: true,
  restart_delay: 10000,
  kill_timeout: 10000,
  merge_logs: true,
  watch: false, // Disabled in production
  ignore_watch: ['node_modules', 'logs', 'tmp', '.git', 'dist'],
  env: {
    NODE_ENV: 'production',
    PYTHONUNBUFFERED: '1',
    PYTHONPATH: './packages/pm2-helpers',
    CHECK_INTERVAL: '300000', // 5 minutes
    HEARTBEAT_TIMEOUT: '600000', // 10 minutes
  },
};

const developmentOverrides = {
  watch: true,
  ignore_watch: ['node_modules', 'logs', 'tmp', '.git'],
  env: {
    NODE_ENV: 'development',
    LOG_LEVEL: 'debug',
  },
};

export const apps = [
  // Core Discord Agent
  {
    name: 'cephalon',
    script: 'dist/index.js',
    cwd: './packages/cephalon',
    out_file: './logs/cephalon-out.log',
    error_file: './logs/cephalon-err.log',
    env: {
      ...agentDefaults.env,
      PM2_PROCESS_NAME: 'cephalon',
      PORT: '8081',
    },
    ...agentDefaults,
  },

  // Web Interface
  {
    name: 'duck-web',
    script: 'dist/index.js', // Vite build output
    cwd: './packages/duck-web',
    out_file: './logs/duck-web-out.log',
    error_file: './logs/duck-web-err.log',
    env: {
      ...agentDefaults.env,
      PM2_PROCESS_NAME: 'duck-web',
      PORT: '3000',
      HOST: '0.0.0.0',
    },
    ...agentDefaults,
  },

  // ENSO Browser Gateway
  {
    name: 'enso-browser-gateway',
    script: 'src/server.mjs',
    cwd: './packages/enso-browser-gateway',
    out_file: './logs/enso-gateway-out.log',
    error_file: './logs/enso-gateway-err.log',
    env: {
      ...agentDefaults.env,
      PM2_PROCESS_NAME: 'enso-browser-gateway',
      PORT: '8082',
      HOST: '0.0.0.0',
    },
    ...agentDefaults,
  },

  // SmartGPT Bridge
  {
    name: 'smartgpt-bridge',
    script: 'dist/fastifyServer.js',
    cwd: './packages/smartgpt-bridge',
    out_file: './logs/smartgpt-bridge-out.log',
    error_file: './logs/smartgpt-bridge-err.log',
    env: {
      ...agentDefaults.env,
      PM2_PROCESS_NAME: 'smartgpt-bridge',
      NODE_ENV: 'development', // Bridge typically runs in dev mode
      HOST: '0.0.0.0',
      PORT: '3210',
      BROKER_URL: 'ws://localhost:7000',
      EMBEDDING_DRIVER: 'ollama',
      EMBEDDING_FUNCTION: 'nomic-embed-text',
    },
    ...agentDefaults,
  },

  // Supporting Services
  {
    name: 'broker',
    script: 'dist/index.js',
    cwd: './packages/broker',
    out_file: './logs/broker-out.log',
    error_file: './logs/broker-err.log',
    env: {
      ...agentDefaults.env,
      PM2_PROCESS_NAME: 'broker',
      PORT: '7000',
    },
    ...agentDefaults,
  },

  {
    name: 'llm-service',
    script: 'dist/index.js',
    cwd: './packages/llm',
    out_file: './logs/llm-service-out.log',
    error_file: './logs/llm-service-err.log',
    env: {
      ...agentDefaults.env,
      PM2_PROCESS_NAME: 'llm-service',
      PORT: '8888',
    },
    ...agentDefaults,
  },

  {
    name: 'voice-service',
    script: 'dist/index.js',
    cwd: './packages/voice',
    out_file: './logs/voice-service-out.log',
    error_file: './logs/voice-service-err.log',
    env: {
      ...agentDefaults.env,
      PM2_PROCESS_NAME: 'voice-service',
      PORT: '8083',
    },
    ...agentDefaults,
  },
];

// Development configuration with hot reload
export const development = apps.map((app) => ({
  ...app,
  ...developmentOverrides,
  env: {
    ...app.env,
    ...developmentOverrides.env,
  },
}));

// Production configuration optimized for stability
export const production = apps.map((app) => ({
  ...app,
  watch: false,
  max_memory_restart: '1G',
  min_uptime: '10s',
}));

export default {
  apps,
  development,
  production,
};
