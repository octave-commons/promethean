/**
 * Enhanced PM2 Ecosystem Configuration for Promethean Monorepo
 * Integrates with Nx for intelligent affected project detection and automated testing/building
 *
 * Features:
 * - Monitors file changes across all packages and services
 * - Automatically runs tests/builds on affected projects using Nx
 * - Comprehensive logging and error handling
 * - Performance optimization with debouncing and caching
 * - Support for all cacheable operations defined in nx.json
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Load environment variables
try {
  dotenv.config();
} catch (error) {
  if (error?.code !== 'ERR_MODULE_NOT_FOUND') {
    throw error;
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = __dirname;

// Configuration constants
const CONFIG = {
  // Nx cacheable operations from nx.json
  CACHEABLE_OPERATIONS: [
    'build',
    'test',
    'test:unit',
    'test:integration',
    'test:e2e',
    'lint',
    'typecheck',
    'coverage',
  ],

  // Workspace layout from nx.json
  WORKSPACE_LAYOUT: {
    appsDir: 'services',
    libsDir: 'packages',
  },

  // Watch configuration
  WATCH: {
    debounceDelay: 2000, // 2 seconds debounce for file changes
    batchDelay: 5000, // 5 seconds to batch multiple operations
    maxConcurrentOps: 3, // Maximum concurrent Nx operations
  },

  // Logging configuration
  LOGGING: {
    dir: join(PROJECT_ROOT, 'logs'),
    dateFormat: 'YYYY-MM-DD HH:mm:ss Z',
    maxFiles: 10,
    maxSize: '10M',
  },

  // Performance settings
  PERFORMANCE: {
    maxMemoryRestart: '1G',
    killTimeout: 15000,
    restartDelay: 5000,
    maxRestarts: 10,
    minUptime: 10000,
  },
};

// Helper function to create log file paths
function createLogPaths(name) {
  return {
    out_file: join(CONFIG.LOGGING.dir, `${name}-out.log`),
    error_file: join(CONFIG.LOGGING.dir, `${name}-err.log`),
    log_file: join(CONFIG.LOGGING.dir, `${name}-combined.log`),
    pid_file: join(CONFIG.LOGGING.dir, `${name}.pid`),
  };
}

// Base configuration for all processes
function createBaseConfig(name, options = {}) {
  const logPaths = createLogPaths(name);

  return {
    name,
    script: 'node',
    interpreter: '/usr/bin/env',
    merge_logs: true,
    instances: 1,
    autorestart: true,
    watch: false,
    ...CONFIG.PERFORMANCE,
    ...logPaths,
    log_date_format: CONFIG.LOGGING.dateFormat,
    time: true,
    env: {
      NODE_ENV: 'production',
      PM2_PROCESS_NAME: name,
      PROJECT_ROOT,
      ...options.env,
    },
    ...options,
  };
}

// Nx-aware watcher process configuration
function createNxWatcherConfig() {
  return createBaseConfig('nx-watcher', {
    description: 'Intelligent file watcher that triggers Nx operations on affected projects',
    script: join(PROJECT_ROOT, 'scripts', 'nx-watcher.mjs'),
    args: [
      '--watch-dirs',
      'packages/*/src',
      'services/*/src',
      'shared/*/src',
      '--operations',
      ...CONFIG.CACHEABLE_OPERATIONS,
      '--debounce',
      CONFIG.WATCH.debounceDelay,
      '--batch-delay',
      CONFIG.WATCH.batchDelay,
      '--max-concurrent',
      CONFIG.WATCH.maxConcurrentOps,
      '--workspace-layout',
      JSON.stringify(CONFIG.WORKSPACE_LAYOUT),
    ],
    watch: [
      'packages/*/src/**/*',
      'services/*/src/**/*',
      'shared/*/src/**/*',
      'tools/**/*',
      'scripts/**/*',
    ],
    ignore_watch: [
      'node_modules/**/*',
      'dist/**/*',
      'build/**/*',
      'coverage/**/*',
      'logs/**/*',
      '.git/**/*',
      '**/*.log',
      '**/*.tmp',
      '.nx/cache/**/*',
    ],
    max_memory_restart: '512M',
    env: {
      NX_VERBOSE_LOGGING: process.env.NX_VERBOSE_LOGGING || 'false',
      NX_DAEMON: process.env.NX_DAEMON || 'true',
      NX_PERF_LOGGING: process.env.NX_PERF_LOGGING || 'false',
    },
  });
}

// Development server configurations for different project types
function createDevServerConfigs() {
  const configs = [];

  // Frontend development servers
  const frontendProjects = [
    'health-dashboard-frontend',
    'llm-chat-frontend',
    'markdown-graph-frontend',
    'portfolio-frontend',
    'smart-chat-frontend',
    'smartgpt-dashboard-frontend',
  ];

  frontendProjects.forEach((project) => {
    configs.push(
      createBaseConfig(`dev-${project}`, {
        description: `Development server for ${project}`,
        script: 'pnpm',
        args: ['--filter', `@promethean/${project}`, 'dev'],
        cwd: PROJECT_ROOT,
        watch: [`packages/frontends/${project}/**/*`],
        ignore_watch: ['node_modules/**/*', 'dist/**/*', 'build/**/*'],
        env: {
          NODE_ENV: 'development',
          PORT: getPortForProject(project),
        },
      }),
    );
  });

  // Service development servers
  const serviceProjects = ['dualstore-http', 'frontend-service', 'openai-server'];

  serviceProjects.forEach((project) => {
    configs.push(
      createBaseConfig(`dev-${project}`, {
        description: `Development server for ${project}`,
        script: 'node',
        args: ['-r', 'esbuild-register', `packages/${project}/dist/index.js`],
        cwd: PROJECT_ROOT,
        watch: [`packages/${project}/src/**/*`],
        env: {
          NODE_ENV: 'development',
          PORT: getPortForProject(project),
          LOG_LEVEL: 'debug',
        },
      }),
    );
  });

  return configs;
}

// Utility function to assign ports to projects
function getPortForProject(project) {
  const portMap = {
    'health-dashboard-frontend': 3000,
    'llm-chat-frontend': 3001,
    'markdown-graph-frontend': 3002,
    'portfolio-frontend': 3003,
    'smart-chat-frontend': 3004,
    'smartgpt-dashboard-frontend': 3005,
    'dualstore-http': 3010,
    'frontend-service': 3011,
    'openai-server': 3012,
  };
  return portMap[project] || 3000;
}

// Background task configurations
function createBackgroundTaskConfigs() {
  return [
    // Auto-commit service
    createBaseConfig('autocommit', {
      description: 'Automatic commit service with AI-generated commit messages',
      script: 'pnpm',
      args: ['autocommit', '--path', '.', '--debounce-ms', '10000', '--model', 'llama3.1:8b'],
      watch: ['./packages/autocommit/dist'],
      env: {
        OPENAI_BASE_URL: 'http://localhost:11434',
        AUTOCOMMIT_MODEL: 'error/qwen3:4b-instruct-100k',
      },
    }),

    // MCP development server
    createBaseConfig('promethean-mcp-dev', {
      description: 'Promethean MCP development server',
      script: 'pnpm',
      args: ['--filter', '@promethean/mcp', 'dev'],
      env: {
        MCP_USER_ROLE: 'developer',
      },
    }),

    // OpenCode unified server
    createBaseConfig('opencode-unified', {
      description: 'OpenCode unified development environment',
      script: 'pnpm',
      args: ['--filter', '@promethean/opencode-unified', 'dev'],
      watch: ['packages/opencode-unified/**/*'],
    }),

    // Playwright MCP server
    createBaseConfig('playwright-mcp', {
      description: 'Playwright MCP server for browser automation',
      script: 'npx',
      args: ['@playwright/mcp@latest', '--port', '8931'],
      env: {
        PLAYWRIGHT_BROWSERS_PATH: process.env.PLAYWRIGHT_BROWSERS_PATH || '0',
      },
    }),
  ];
}

// Monitoring and health check configurations
function createMonitoringConfigs() {
  return [
    // Health monitor
    createBaseConfig('health-monitor', {
      description: 'System health monitoring service',
      script: 'node',
      args: ['packages/health/index.js'],
      cwd: PROJECT_ROOT,
      watch: ['packages/health/**/*'],
      env: {
        CHECK_INTERVAL: '300000', // 5 minutes
        HEARTBEAT_TIMEOUT: '600000', // 10 minutes
      },
    }),

    // Heartbeat service
    createBaseConfig('heartbeat', {
      description: 'Heartbeat service for process monitoring',
      script: 'node',
      args: ['packages/heartbeat/index.js'],
      cwd: PROJECT_ROOT,
      watch: ['packages/heartbeat/**/*'],
      env: {
        CHECK_INTERVAL: '300000',
        HEARTBEAT_TIMEOUT: '600000',
      },
    }),

    // Message broker
    createBaseConfig('message-broker', {
      description: 'Message broker for inter-service communication',
      script: 'node',
      args: ['packages/broker/index.js'],
      cwd: PROJECT_ROOT,
      watch: ['packages/broker/**/*'],
      env: {
        HEARTBEAT_PORT: '5005',
      },
    }),
  ];
}

// Build and test automation configurations
function createAutomationConfigs() {
  return [
    // Periodic full build
    createBaseConfig('periodic-build', {
      description: 'Periodic full workspace build',
      script: 'pnpm',
      args: ['build:all'],
      autorestart: false,
      cron: '0 */6 * * *', // Every 6 hours
    }),

    // Periodic test suite
    createBaseConfig('periodic-test', {
      description: 'Periodic full test suite execution',
      script: 'pnpm',
      args: ['test:all'],
      autorestart: false,
      cron: '0 2 * * *', // Daily at 2 AM
    }),

    // Coverage report generation
    createBaseConfig('coverage-report', {
      description: 'Generate and update coverage reports',
      script: 'pnpm',
      args: ['coverage:separate'],
      autorestart: false,
      cron: '0 3 * * 0', // Weekly on Sunday at 3 AM
    }),
  ];
}

// Export complete ecosystem configuration
export const apps = [
  // Core Nx watcher (always running)
  createNxWatcherConfig(),

  // Development servers (conditional based on NODE_ENV)
  ...(process.env.NODE_ENV === 'development' ? createDevServerConfigs() : []),

  // Background tasks
  ...createBackgroundTaskConfigs(),

  // Monitoring services
  ...createMonitoringConfigs(),

  // Automation tasks
  ...createAutomationConfigs(),
];

// PM2 deployment configuration
export const deploy = {
  production: {
    user: 'deploy',
    host: ['promethean.example.com'],
    ref: 'origin/main',
    repo: 'git@github.com:promethean/promethean.git',
    path: '/var/www/promethean',
    'pre-deploy-local': '',
    'post-deploy':
      'pnpm install && pnpm build:all && pm2 reload ecosystem.config.enhanced.mjs --env production',
    'pre-setup': '',
  },

  staging: {
    user: 'deploy',
    host: ['staging.promethean.example.com'],
    ref: 'origin/develop',
    repo: 'git@github.com:promethean/promethean.git',
    path: '/var/www/promethean-staging',
    'post-deploy':
      'pnpm install && pnpm build:affected && pm2 reload ecosystem.config.enhanced.mjs --env staging',
  },
};

// PM2 actions for custom operations
export const actions = {
  // Trigger build for affected projects
  'build-affected': {
    script: 'node',
    args: [join(PROJECT_ROOT, 'scripts', 'run-nx-task.mjs'), 'build', 'affected'],
  },

  // Trigger tests for affected projects
  'test-affected': {
    script: 'node',
    args: [join(PROJECT_ROOT, 'scripts', 'run-nx-task.mjs'), 'test', 'affected'],
  },

  // Generate comprehensive report
  'generate-report': {
    script: 'node',
    args: [join(PROJECT_ROOT, 'scripts', 'generate-status-report.mjs')],
  },

  // Clean up old logs and cache
  cleanup: {
    script: 'node',
    args: [join(PROJECT_ROOT, 'scripts', 'cleanup.mjs')],
  },
};

// PM2 schedules for periodic tasks
export const schedules = [
  {
    name: 'daily-health-check',
    script: 'node',
    args: [join(PROJECT_ROOT, 'scripts', 'health-check.mjs')],
    cron: '0 6 * * *', // Daily at 6 AM
  },

  {
    name: 'weekly-cleanup',
    script: 'node',
    args: [join(PROJECT_ROOT, 'scripts', 'cleanup.mjs'), '--weekly'],
    cron: '0 2 * * 0', // Weekly on Sunday at 2 AM
  },
];

console.log(`🚀 Enhanced PM2 ecosystem configuration loaded`);
console.log(`📊 Total processes configured: ${apps.length}`);
console.log(`📁 Logs directory: ${CONFIG.LOGGING.dir}`);
console.log(`🔧 Cacheable operations: ${CONFIG.CACHEABLE_OPERATIONS.join(', ')}`);

export default {
  apps,
  deploy,
  actions,
  schedules,
};
