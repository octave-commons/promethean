#!/usr/bin/env node

/**
 * Nx-Aware File Watcher for Promethean Monorepo
 *
 * This script monitors file changes across the monorepo and intelligently
 * triggers Nx operations on affected projects only, leveraging Nx's dependency
 * graph and caching capabilities.
 *
 * Features:
 * - Debounced file watching to prevent excessive operations
 * - Intelligent affected project detection using Nx
 * - Batched operations for better performance
 * - Comprehensive logging and error handling
 * - Support for all cacheable operations from nx.json
 */

import { execSync } from 'node:child_process';
import { existsSync, watchFile, statSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, '..');

// Parse command line arguments
const args = process.argv.slice(2);
const parsedArgs = {
  watchDirs: [],
  operations: [],
  debounce: 2000,
  batchDelay: 5000,
  maxConcurrent: 3,
  workspaceLayout: { appsDir: 'services', libsDir: 'packages' },
  verbose: false,
  dryRun: false,
};

// Parse arguments
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  const nextArg = args[i + 1];

  switch (arg) {
    case '--watch-dirs':
      parsedArgs.watchDirs = nextArg ? nextArg.split(',') : [];
      i++;
      break;
    case '--operations':
      parsedArgs.operations = nextArg ? nextArg.split(',') : [];
      i++;
      break;
    case '--debounce':
      parsedArgs.debounce = parseInt(nextArg) || 2000;
      i++;
      break;
    case '--batch-delay':
      parsedArgs.batchDelay = parseInt(nextArg) || 5000;
      i++;
      break;
    case '--max-concurrent':
      parsedArgs.maxConcurrent = parseInt(nextArg) || 3;
      i++;
      break;
    case '--workspace-layout':
      try {
        parsedArgs.workspaceLayout = JSON.parse(nextArg);
      } catch (e) {
        console.warn('Invalid workspace layout JSON, using default');
      }
      i++;
      break;
    case '--verbose':
      parsedArgs.verbose = true;
      break;
    case '--dry-run':
      parsedArgs.dryRun = true;
      break;
    case '--help':
      console.log(`
Nx Watcher - Intelligent file watcher for Nx monorepos

Usage: node nx-watcher.mjs [options]

Options:
  --watch-dirs <dirs>     Comma-separated list of directories to watch
  --operations <ops>      Comma-separated list of Nx operations to run
  --debounce <ms>         Debounce delay in milliseconds (default: 2000)
  --batch-delay <ms>      Batch operation delay in milliseconds (default: 5000)
  --max-concurrent <num>  Maximum concurrent operations (default: 3)
  --workspace-layout <json> Workspace layout configuration
  --verbose               Enable verbose logging
  --dry-run               Show what would be executed without running
  --help                  Show this help message

Example:
  node nx-watcher.mjs \\
    --watch-dirs "packages/*/src,services/*/src" \\
    --operations "build,test,lint" \\
    --debounce 3000 \\
    --verbose
      `);
      process.exit(0);
  }
}

// Configuration validation
if (parsedArgs.watchDirs.length === 0) {
  parsedArgs.watchDirs = [
    'packages/*/src',
    'services/*/src',
    'shared/*/src',
    'tools/**/*',
    'scripts/**/*',
  ];
}

if (parsedArgs.operations.length === 0) {
  parsedArgs.operations = [
    'build',
    'test',
    'test:unit',
    'test:integration',
    'test:e2e',
    'lint',
    'typecheck',
    'coverage',
  ];
}

// Global state
const state = {
  changedFiles: new Set(),
  pendingOperations: new Map(),
  runningOperations: new Set(),
  debounceTimer: null,
  batchTimer: null,
  operationQueue: [],
  stats: {
    filesChanged: 0,
    operationsRun: 0,
    operationsSucceeded: 0,
    operationsFailed: 0,
    startTime: Date.now(),
  },
};

// Logging utilities
function log(level, message, ...args) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}] [Nx-Watcher]`;

  if (level === 'error') {
    console.error(prefix, message, ...args);
  } else if (level === 'warn') {
    console.warn(prefix, message, ...args);
  } else if (parsedArgs.verbose || level === 'info') {
    console.log(prefix, message, ...args);
  }
}

function logOperation(operation, affectedProjects, duration, success) {
  const status = success ? '✅' : '❌';
  const durationStr = duration ? ` (${duration}ms)` : '';
  const projectsStr = affectedProjects.length > 0 ? affectedProjects.join(', ') : 'none';

  log('info', `${status} ${operation} on ${projectsStr}${durationStr}`);
}

// Nx command execution utilities
function executeNxCommand(command, args = []) {
  const fullCommand = `pnpm nx ${command} ${args.join(' ')}`;

  if (parsedArgs.dryRun) {
    log('info', `DRY RUN: ${fullCommand}`);
    return { success: true, output: '', duration: 0 };
  }

  const startTime = Date.now();

  try {
    log('debug', `Executing: ${fullCommand}`);
    const output = execSync(fullCommand, {
      cwd: PROJECT_ROOT,
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      stdio: parsedArgs.verbose ? 'inherit' : 'pipe',
    });

    const duration = Date.now() - startTime;
    return { success: true, output, duration };
  } catch (error) {
    const duration = Date.now() - startTime;
    log('error', `Command failed: ${fullCommand}`, error.message);
    return {
      success: false,
      output: error.stdout || '',
      error: error.message,
      duration,
    };
  }
}

// Get affected projects for a list of files
function getAffectedProjects(files) {
  if (files.length === 0) return [];

  const filesArg = files.map((f) => relative(PROJECT_ROOT, f)).join(',');
  const result = executeNxCommand('graph', ['--affected', '--files', filesArg]);

  if (!result.success) {
    log('warn', 'Failed to get affected projects, assuming all projects');
    return []; // Will trigger operations on all projects
  }

  try {
    // Parse Nx graph output to extract project names
    const graphData = JSON.parse(result.output);
    const affectedProjects = Object.keys(graphData.graph.nodes);

    log(
      'debug',
      `Found ${affectedProjects.length} affected projects: ${affectedProjects.join(', ')}`,
    );
    return affectedProjects;
  } catch (e) {
    log('warn', 'Failed to parse Nx graph output', e.message);
    return [];
  }
}

// Execute an Nx operation on affected projects
async function executeOperation(operation, affectedProjects) {
  const operationId = `${operation}-${Date.now()}`;
  state.runningOperations.add(operationId);

  try {
    const startTime = Date.now();

    let result;
    if (affectedProjects.length > 0) {
      result = executeNxCommand(operation, affectedProjects);
    } else {
      // Run on all projects if we can't determine affected ones
      result = executeNxCommand(operation);
    }

    const duration = Date.now() - startTime;
    state.stats.operationsRun++;

    if (result.success) {
      state.stats.operationsSucceeded++;
      logOperation(operation, affectedProjects, duration, true);
    } else {
      state.stats.operationsFailed++;
      logOperation(operation, affectedProjects, duration, false);
      log('error', `Operation output:`, result.output);
      if (result.error) {
        log('error', `Operation error:`, result.error);
      }
    }

    return result;
  } finally {
    state.runningOperations.delete(operationId);
  }
}

// Batch operation execution with concurrency control
async function executeBatchOperations() {
  if (state.operationQueue.length === 0) return;

  const batch = state.operationQueue.splice(0, parsedArgs.maxConcurrent);
  log('info', `Executing batch of ${batch.length} operations`);

  const promises = batch.map(async ({ operation, affectedProjects }) => {
    try {
      return await executeOperation(operation, affectedProjects);
    } catch (error) {
      log('error', `Batch operation failed:`, error);
      return { success: false, error };
    }
  });

  await Promise.allSettled(promises);

  // Schedule next batch if there are more operations
  if (state.operationQueue.length > 0) {
    state.batchTimer = setTimeout(executeBatchOperations, parsedArgs.batchDelay);
  }
}

// Queue an operation for execution
function queueOperation(operation, affectedProjects) {
  const key = `${operation}-${affectedProjects.sort().join(',')}`;

  if (!state.pendingOperations.has(key)) {
    state.pendingOperations.set(key, { operation, affectedProjects });
    state.operationQueue.push({ operation, affectedProjects });

    log('debug', `Queued ${operation} for ${affectedProjects.length} projects`);
  }
}

// Process file changes and queue appropriate operations
function processFileChanges() {
  if (state.changedFiles.size === 0) return;

  const changedFiles = Array.from(state.changedFiles);
  state.changedFiles.clear();
  state.stats.filesChanged += changedFiles.length;

  log('info', `Processing ${changedFiles.length} changed files`);

  // Get affected projects
  const affectedProjects = getAffectedProjects(changedFiles);

  // Queue operations based on file types and patterns
  for (const operation of parsedArgs.operations) {
    // Determine if this operation should run based on file patterns
    let shouldRun = false;

    if (operation.includes('build')) {
      shouldRun = changedFiles.some(
        (file) =>
          file.includes('/src/') &&
          (file.endsWith('.ts') ||
            file.endsWith('.js') ||
            file.endsWith('.tsx') ||
            file.endsWith('.jsx')),
      );
    } else if (operation.includes('test')) {
      shouldRun = changedFiles.some(
        (file) =>
          file.includes('/src/') ||
          file.includes('/test/') ||
          file.includes('.test.') ||
          file.includes('.spec.'),
      );
    } else if (operation.includes('lint')) {
      shouldRun = changedFiles.some(
        (file) =>
          file.endsWith('.ts') ||
          file.endsWith('.js') ||
          file.endsWith('.tsx') ||
          file.endsWith('.jsx'),
      );
    } else if (operation.includes('typecheck')) {
      shouldRun = changedFiles.some((file) => file.endsWith('.ts') || file.endsWith('.tsx'));
    } else {
      shouldRun = true; // Default to running for other operations
    }

    if (shouldRun) {
      queueOperation(operation, affectedProjects);
    }
  }

  // Start batch execution if not already running
  if (state.operationQueue.length > 0 && !state.batchTimer) {
    state.batchTimer = setTimeout(executeBatchOperations, parsedArgs.batchDelay);
  }
}

// Debounced file change handler
function handleFileChange() {
  if (state.debounceTimer) {
    clearTimeout(state.debounceTimer);
  }

  state.debounceTimer = setTimeout(() => {
    processFileChanges();
    state.debounceTimer = null;
  }, parsedArgs.debounce);
}

// File watching setup
async function setupFileWatching() {
  const watchPatterns = parsedArgs.watchDirs.map((pattern) => {
    // Convert glob patterns to actual directories
    const resolvedPattern = resolve(PROJECT_ROOT, pattern);
    return resolvedPattern;
  });

  log('info', `Setting up file watching for patterns:`, watchPatterns);

  // For simplicity, we'll use chokidar if available, otherwise fallback to basic watching
  try {
    // Try to use chokidar for better file watching
    const chokidarModule = await import('chokidar');
    const chokidar = chokidarModule.default;

    const watcher = chokidar.watch(watchPatterns, {
      ignored: [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/coverage/**',
        '**/.git/**',
        '**/logs/**',
        '**/.nx/cache/**',
      ],
      persistent: true,
      ignoreInitial: true,
    });

    watcher.on('all', (event, filePath) => {
      log('debug', `File ${event}: ${filePath}`);
      state.changedFiles.add(filePath);
      handleFileChange();
    });

    watcher.on('ready', () => {
      log('info', 'File watcher is ready');
    });

    watcher.on('error', (error) => {
      log('error', 'File watcher error:', error);
    });
  } catch (error) {
    log('warn', 'Chokidar not available, using basic file watching');

    // Fallback to basic Node.js file watching
    watchPatterns.forEach((pattern) => {
      try {
        if (existsSync(pattern)) {
          const stat = statSync(pattern);
          if (stat.isDirectory()) {
            watchFile(pattern, { interval: 1000 }, () => {
              state.changedFiles.add(pattern);
              handleFileChange();
            });
          }
        }
      } catch (e) {
        log('warn', `Cannot watch ${pattern}:`, e.message);
      }
    });
  }
}

// Statistics and monitoring
function printStats() {
  const uptime = Date.now() - state.stats.startTime;
  const uptimeMinutes = Math.floor(uptime / 60000);

  console.log(`
📊 Nx Watcher Statistics:
⏱️  Uptime: ${uptimeMinutes} minutes
📁 Files changed: ${state.stats.filesChanged}
🔧 Operations run: ${state.stats.operationsRun}
✅ Operations succeeded: ${state.stats.operationsSucceeded}
❌ Operations failed: ${state.stats.operationsFailed}
🔄 Currently running: ${state.runningOperations.size}
⏳ Queued operations: ${state.operationQueue.length}
  `);
}

// Graceful shutdown
function shutdown() {
  log('info', 'Shutting down Nx watcher...');

  if (state.debounceTimer) {
    clearTimeout(state.debounceTimer);
  }

  if (state.batchTimer) {
    clearTimeout(state.batchTimer);
  }

  printStats();
  process.exit(0);
}

// Main execution
async function main() {
  log('info', 'Starting Nx watcher with configuration:', parsedArgs);

  // Setup signal handlers
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // Setup file watching
  await setupFileWatching();

  // Print stats periodically
  setInterval(printStats, 60000); // Every minute

  log('info', 'Nx watcher is running. Press Ctrl+C to stop.');
}

// Error handling
process.on('uncaughtException', (error) => {
  log('error', 'Uncaught exception:', error);
  shutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  log('error', 'Unhandled rejection at:', promise, 'reason:', reason);
});

// Start the watcher
main().catch((error) => {
  log('error', 'Failed to start Nx watcher:', error);
  process.exit(1);
});
