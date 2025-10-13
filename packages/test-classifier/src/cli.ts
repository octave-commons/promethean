#!/usr/bin/env node

import { resolve } from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';
import {
  TestClassifier,
  classifyWorkspaceTests,
  generateReport,
  generateTestFileLists,
} from './index.js';

interface CLIOptions {
  workspaceRoot?: string;
  patterns?: string[];
  output?: string;
  format?: 'report' | 'json' | 'lists';
  config?: string;
  verbose?: boolean;
}

function parseArgs(): CLIOptions {
  const args = process.argv.slice(2);
  const options: CLIOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case '--workspace':
      case '-w':
        if (nextArg) {
          options.workspaceRoot = nextArg;
          i++;
        }
        break;
      case '--pattern':
      case '-p':
        if (nextArg) {
          if (!options.patterns) options.patterns = [];
          options.patterns.push(nextArg);
          i++;
        }
        break;
      case '--output':
      case '-o':
        if (nextArg) {
          options.output = nextArg;
          i++;
        }
        break;
      case '--format':
      case '-f':
        if (nextArg && ['report', 'json', 'lists'].includes(nextArg)) {
          options.format = nextArg as 'report' | 'json' | 'lists';
          i++;
        }
        break;
      case '--config':
      case '-c':
        if (nextArg) {
          options.config = nextArg;
          i++;
        }
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--help':
      case '-h':
        showHelp();
        process.exit(0);
    }
  }

  return options;
}

function showHelp(): void {
  console.log(`
Test Classifier CLI

Usage:
  test-classifier [options]

Options:
  -w, --workspace <path>    Workspace root directory (default: current directory)
  -p, --pattern <glob>      File patterns to search for tests (can be used multiple times)
  -o, --output <file>       Output file (default: stdout)
  -f, --format <type>       Output format: report, json, lists (default: report)
  -c, --config <file>       Configuration file for classification rules
  -v, --verbose             Enable verbose output
  -h, --help                Show this help message

Examples:
  test-classifier                                    # Basic classification report
  test-classifier --format json                      # JSON output
  test-classifier --pattern "packages/**/*.test.ts"  # Custom pattern
  test-classifier --output report.md                # Save to file
  test-classifier --format lists --output test-files.json  # Generate file lists
`);
}

function loadConfig(configPath?: string): Partial<import('./types.js').ClassificationConfig> {
  if (!configPath) return {};

  try {
    const configContent = readFileSync(resolve(configPath!), 'utf8');
    return JSON.parse(configContent);
  } catch (error) {
    console.error(`Error loading config file ${configPath}:`, error);
    process.exit(1);
  }
}

function main(): void {
  const options = parseArgs();

  if (options.verbose) {
    console.log('Test Classifier CLI');
    console.log('Options:', options);
  }

  try {
    // Load custom configuration if provided
    const config = loadConfig(options.config);
    const classifier = new TestClassifier(config);

    // Classify tests
    const summary = classifyWorkspaceTests(options.workspaceRoot, options.patterns, classifier);

    if (options.verbose) {
      console.log(`Processed ${summary.totalFiles} test files`);
      console.log(`Average confidence: ${(summary.averageConfidence * 100).toFixed(1)}%`);
    }

    // Generate output
    let output: string;

    switch (options.format) {
      case 'json':
        output = JSON.stringify(summary, null, 2);
        break;
      case 'lists':
        const lists = generateTestFileLists(summary);
        output = JSON.stringify(lists, null, 2);
        break;
      case 'report':
      default:
        output = generateReport(summary);
        break;
    }

    // Write output
    if (options.output) {
      writeFileSync(resolve(options.output), output, 'utf8');
      console.log(`Output written to ${options.output}`);
    } else {
      console.log(output);
    }

    // Exit with error code if there are unclassified files
    if (summary.unclassified > 0) {
      console.warn(`Warning: ${summary.unclassified} files could not be classified`);
      process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
