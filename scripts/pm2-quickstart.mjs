#!/usr/bin/env node

/**
 * PM2 Quick Start Script for Promethean
 *
 * This script provides an easy way to get started with the enhanced PM2 ecosystem.
 * It handles setup, startup, and basic management operations.
 */

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = dirname(__dirname);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function showBanner() {
  colorLog(
    'cyan',
    `
╔══════════════════════════════════════════════════════════════╗
║                    Promethean PM2 Quick Start                 ║
║              Enhanced Monorepo Process Management              ║
╚══════════════════════════════════════════════════════════════╝
`,
  );
}

function showUsage() {
  colorLog(
    'yellow',
    `
Usage: node pm2-quickstart.mjs [command] [options]

Commands:
  setup       Setup logging infrastructure and dependencies
  start       Start the enhanced PM2 ecosystem
  stop        Stop all PM2 processes
  restart     Restart all PM2 processes
  status      Show current PM2 status
  logs        Show PM2 logs
  monitor     Start the log monitoring dashboard
  cleanup     Clean up old logs and cache
  help        Show this help message

Options:
  --env <env>     Environment to use (development, staging, production)
  --verbose       Enable verbose output
  --dry-run       Show what would be executed without running

Examples:
  node pm2-quickstart.mjs setup
  node pm2-quickstart.mjs start --env development
  node pm2-quickstart.mjs status
  node pm2-quickstart.mjs logs --verbose
  `,
  );
}

function runCommand(command, description, options = {}) {
  const { dryRun = false, verbose = false } = options;

  if (dryRun) {
    colorLog('yellow', `DRY RUN: ${description}`);
    colorLog('blue', `Command: ${command}`);
    return;
  }

  if (verbose) {
    colorLog('blue', `Running: ${command}`);
  }

  try {
    const result = execSync(command, {
      cwd: PROJECT_ROOT,
      encoding: 'utf8',
      stdio: verbose ? 'inherit' : 'pipe',
    });

    if (verbose && result) {
      console.log(result);
    }

    colorLog('green', `✅ ${description}`);
    return result;
  } catch (error) {
    colorLog('red', `❌ Failed to ${description.toLowerCase()}`);
    if (verbose) {
      console.error(error.message);
    }
    throw error;
  }
}

async function setup(options = {}) {
  colorLog('cyan', '🔧 Setting up Promethean PM2 ecosystem...');

  // Check if required dependencies are available
  const requiredPackages = ['pm2', 'nx'];
  for (const pkg of requiredPackages) {
    try {
      execSync(`${pkg} --version`, { stdio: 'ignore' });
    } catch (e) {
      colorLog('red', `❌ Required package '${pkg}' not found. Please install it first.`);
      colorLog('yellow', `Run: pnpm add -g ${pkg}`);
      process.exit(1);
    }
  }

  // Setup logging infrastructure
  if (existsSync('scripts/setup-logging.mjs')) {
    runCommand('node scripts/setup-logging.mjs', 'Setup logging infrastructure', options);
  }

  // Create logs directory if it doesn't exist
  runCommand('mkdir -p logs', 'Create logs directory', options);

  // Check if ecosystem config exists
  if (!existsSync('ecosystem.config.enhanced.mjs')) {
    colorLog('red', '❌ Enhanced ecosystem configuration not found!');
    colorLog('yellow', 'Please ensure ecosystem.config.enhanced.mjs exists in the project root.');
    process.exit(1);
  }

  colorLog('green', '✅ Setup complete!');
}

function start(options = {}) {
  const env = options.env || 'development';
  colorLog('cyan', `🚀 Starting PM2 ecosystem in ${env} mode...`);

  const command = `pm2 start ecosystem.config.enhanced.mjs --env ${env}`;
  runCommand(command, 'Start PM2 ecosystem', options);

  // Show status after starting
  setTimeout(() => {
    status(options);
  }, 2000);
}

function stop(options = {}) {
  colorLog('cyan', '🛑 Stopping PM2 ecosystem...');
  runCommand('pm2 stop all', 'Stop all PM2 processes', options);
}

function restart(options = {}) {
  colorLog('cyan', '🔄 Restarting PM2 ecosystem...');
  runCommand('pm2 restart all', 'Restart all PM2 processes', options);
}

function status(options = {}) {
  colorLog('cyan', '📊 PM2 Status:');
  runCommand('pm2 status', 'Show PM2 status', options);
}

function logs(options = {}) {
  colorLog('cyan', '📋 PM2 Logs:');
  const command = options.verbose ? 'pm2 logs --lines 50' : 'pm2 logs';
  runCommand(command, 'Show PM2 logs', options);
}

function monitor(options = {}) {
  colorLog('cyan', '📈 Starting log monitoring dashboard...');

  if (existsSync('scripts/log-monitor.mjs')) {
    runCommand('node scripts/log-monitor.mjs', 'Start log monitor', options);
  } else {
    colorLog('yellow', '📊 Log monitor not available. Using PM2 monitoring instead.');
    runCommand('pm2 monit', 'Start PM2 monitoring', options);
  }
}

function cleanup(options = {}) {
  colorLog('cyan', '🧹 Cleaning up PM2 ecosystem...');

  // Clean PM2 logs
  runCommand('pm2 flush', 'Flush PM2 logs', options);

  // Clean old log files
  runCommand(
    "find logs -name '*.log.old' -delete 2>/dev/null || true",
    'Clean old log files',
    options,
  );

  // Reset Nx cache
  runCommand('pnpm nx reset', 'Reset Nx cache', options);

  colorLog('green', '✅ Cleanup complete!');
}

// Parse command line arguments
const args = process.argv.slice(2);
const parsedArgs = {
  command: args[0] || 'help',
  env: null,
  verbose: false,
  dryRun: false,
};

for (let i = 1; i < args.length; i++) {
  const arg = args[i];
  switch (arg) {
    case '--env':
      parsedArgs.env = args[i + 1];
      i++;
      break;
    case '--verbose':
      parsedArgs.verbose = true;
      break;
    case '--dry-run':
      parsedArgs.dryRun = true;
      break;
  }
}

// Main execution logic
async function main() {
  showBanner();

  const { command, env, verbose, dryRun } = parsedArgs;
  const options = { verbose, dryRun };

  try {
    switch (command) {
      case 'setup':
        await setup(options);
        break;

      case 'start':
        await setup(options); // Ensure setup is complete
        start({ ...options, env });
        break;

      case 'stop':
        stop(options);
        break;

      case 'restart':
        restart(options);
        break;

      case 'status':
        status(options);
        break;

      case 'logs':
        logs(options);
        break;

      case 'monitor':
        monitor(options);
        break;

      case 'cleanup':
        cleanup(options);
        break;

      case 'help':
      default:
        showUsage();
        break;
    }

    // Show next steps
    if (command === 'start') {
      colorLog(
        'cyan',
        `
🎉 PM2 ecosystem is now running!

Next steps:
• View status:     node pm2-quickstart.mjs status
• View logs:       node pm2-quickstart.mjs logs
• Monitor:         node pm2-quickstart.mjs monitor
• Stop:            node pm2-quickstart.mjs stop
• Restart:         node pm2-quickstart.mjs restart

Web interfaces:
• PM2 monitoring:  http://localhost:8080 (if pm2-server is running)
• Log dashboard:   http://localhost:3099 (when monitor is running)
      `,
      );
    }
  } catch (error) {
    colorLog('red', `❌ Command failed: ${error.message}`);
    if (verbose) {
      console.error(error);
    }
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  colorLog('yellow', '\n👋 Goodbye!');
  process.exit(0);
});

// Run the main function
main();
