#!/usr/bin/env node

/**
 * CLI interface for pipeline automation
 */

import { readFile } from 'fs/promises';
import { createOrchestratorFromPipelineConfig } from './index.js';

interface CLIOptions {
  pipeline: string;
  config?: string;
  buildFix?: boolean;
  monitoring?: boolean;
  parallel?: boolean;
  verbose?: boolean;
  help?: boolean;
}

function parseArgs(): CLIOptions {
  const args = process.argv.slice(2);
  const options: CLIOptions = {
    pipeline: '',
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--pipeline':
      case '-p':
        options.pipeline = args[++i] || '';
        break;
      case '--config':
      case '-c':
        options.config = args[++i];
        break;
      case '--build-fix':
        options.buildFix = true;
        break;
      case '--no-build-fix':
        options.buildFix = false;
        break;
      case '--monitoring':
        options.monitoring = true;
        break;
      case '--no-monitoring':
        options.monitoring = false;
        break;
      case '--parallel':
        options.parallel = true;
        break;
      case '--no-parallel':
        options.parallel = false;
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
      default:
        if (!options.pipeline && arg && !arg.startsWith('--')) {
          options.pipeline = arg;
        }
        break;
    }
  }

  return options;
}

function showHelp(): void {
  console.log(`
Pipeline Automation CLI

Usage:
  pipeline-automation [options] <pipeline-name>

Options:
  -p, --pipeline <name>     Pipeline to execute (required)
  -c, --config <path>       Custom configuration file
  --build-fix              Enable BuildFix (default: enabled)
  --no-build-fix           Disable BuildFix
  --monitoring             Enable resource monitoring (default: enabled)
  --no-monitoring          Disable resource monitoring
  --parallel               Enable parallel execution (default: enabled)
  --no-parallel            Disable parallel execution
  -v, --verbose            Enable verbose logging
  -h, --help               Show this help message

Examples:
  pipeline-automation buildfix
  pipeline-automation --pipeline symdocs --no-parallel
  pipeline-automation --pipeline codemods --verbose --config custom.json
  pipeline-automation --pipeline buildfix --build-fix --monitoring

Available Pipelines:
  - symdocs        Documentation generation
  - simtasks       Task similarity analysis
  - codemods       Automated code modifications
  - semver-guard   Version management
  - board-review   Kanban board review
  - sonar          Code quality analysis
  - readmes        README generation
  - buildfix       Build error fixing
  - test-gap       Test coverage analysis
  - docops         Documentation operations
  - eslint-tasks   ESLint task generation
`);
}

async function loadPipelinesConfig(configPath?: string): Promise<any> {
  const defaultPath = 'pipelines.json';
  const path = configPath || defaultPath;

  try {
    const content = await readFile(path, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error loading pipelines config from ${path}:`, error);
    process.exit(1);
  }
}

function setupLogging(verbose: boolean): void {
  if (verbose) {
    process.env.DEBUG = 'pipeline-automation:*';
  }

  // Set up console logging with timestamps
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;

  const timestamp = () => new Date().toISOString();

  console.log = (...args: any[]) => originalLog(`[${timestamp()}]`, ...args);
  console.error = (...args: any[]) => originalError(`[${timestamp()}]`, ...args);
  console.warn = (...args: any[]) => originalWarn(`[${timestamp()}]`, ...args);
}

async function main(): Promise<void> {
  const options = parseArgs();

  if (options.help || !options.pipeline) {
    showHelp();
    process.exit(options.help ? 0 : 1);
  }

  setupLogging(options.verbose || false);

  try {
    console.log(`🚀 Starting pipeline automation for: ${options.pipeline}`);

    // Load configurations
    const pipelinesConfig = await loadPipelinesConfig(options.config);

    // Create custom automation config based on CLI options
    const automationOverrides: any = {};

    if (options.buildFix !== undefined) {
      automationOverrides.buildFix = { enabled: options.buildFix };
    }

    if (options.monitoring !== undefined) {
      automationOverrides.resourceMonitor = { enabled: options.monitoring };
      automationOverrides.monitoring = { enabled: options.monitoring };
    }

    if (options.parallel !== undefined) {
      automationOverrides.parallel = { enabled: options.parallel };
    }

    // Create orchestrator
    const orchestrator = createOrchestratorFromPipelineConfig(
      options.pipeline,
      pipelinesConfig,
      automationOverrides,
    );

    console.log('📊 Checking system health...');
    const healthStatus = await orchestrator.getHealthStatus();
    console.log('Health Status:', healthStatus);

    console.log('🎯 Starting pipeline execution...');
    const startTime = Date.now();

    // Execute pipeline
    const result = await orchestrator.execute();

    const duration = Date.now() - startTime;
    console.log(`\n✅ Pipeline completed in ${duration}ms`);

    if (result.success) {
      console.log('🎉 All steps completed successfully!');
      console.log(`📈 Executed ${result.steps.length} steps`);

      if (result.metrics) {
        console.log('📊 Pipeline Metrics:');
        console.log(`  Memory Usage: ${result.metrics.memoryUsage.toFixed(2)} MB`);
        console.log(`  CPU Usage: ${result.metrics.cpuUsage.toFixed(2)}%`);
        console.log(`  Disk Usage: ${result.metrics.diskUsage.toFixed(2)} MB`);
      }

      if (result.buildFixResults && result.buildFixResults.length > 0) {
        const totalFixed = result.buildFixResults.reduce(
          (sum: number, r: any) => sum + r.errorsResolved,
          0,
        );
        const totalPatches = result.buildFixResults.reduce(
          (sum: number, r: any) => sum + r.patchesGenerated,
          0,
        );
        console.log('🔧 BuildFix Summary:');
        console.log(`  Errors Resolved: ${totalFixed}`);
        console.log(`  Patches Generated: ${totalPatches}`);
      }
    } else {
      console.log('❌ Pipeline failed!');
      console.log('Failed Steps:');
      result.steps
        .filter((step: any) => !step.success)
        .forEach((step: any) => {
          console.log(`  - ${step.name}: ${step.error}`);
        });

      if (result.errors && result.errors.length > 0) {
        console.log('Errors:', result.errors);
      }

      process.exit(1);
    }

    // Show final state
    const finalState = orchestrator.getState();
    console.log('\n📋 Final State:', finalState);
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Run main function
main().catch((error) => {
  console.error('💥 Unhandled error:', error);
  process.exit(1);
});
