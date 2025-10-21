#!/usr/bin/env node

/**
 * Server CLI entry point for OpenCode Unified
 */

import { Command } from 'commander';
import { startServer } from './index.js';

const program = new Command();

program.name('opencode-server').description('OpenCode Unified Server CLI').version('1.0.0');

program
  .option('-p, --port <number>', 'Port to run the server on', '3000')
  .option('-h, --host <string>', 'Host to bind the server to', '0.0.0.0')
  .option('--no-cors', 'Disable CORS')
  .option('--no-swagger', 'Disable Swagger documentation')
  .action(async (options) => {
    try {
      await startServer({
        port: parseInt(options.port),
        host: options.host,
        cors: options.cors,
        swagger: options.swagger,
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  });

program.parse();
