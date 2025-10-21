#!/usr/bin/env node

/**
 * Main CLI entry point for OpenCode Unified
 */

import { Command } from 'commander';
import { startServer } from './server/index.js';
import { createClient } from './client/index.js';

const program = new Command();

program.name('opencode-unified').description('Promethean OpenCode Unified CLI').version('1.0.0');

// Server command
program
  .command('server')
  .description('Start the OpenCode server')
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

// Client command
program
  .command('client')
  .description('Run OpenCode client')
  .option('-e, --endpoint <string>', 'Server endpoint', 'http://localhost:3000')
  .option('-t, --timeout <number>', 'Request timeout in ms', '30000')
  .action(async (options) => {
    try {
      const clientInstance = createClient({
        endpoint: options.endpoint,
        timeout: parseInt(options.timeout),
      });
      console.log('OpenCode client started');
      console.log('Connected to:', options.endpoint);

      // Test connection
      const health = await clientInstance.healthCheck();
      console.log('Server health:', health);
    } catch (error) {
      console.error('Failed to start client:', error);
      process.exit(1);
    }
  });

// Default action - start server
program.action(async () => {
  try {
    await startServer();
  } catch (error) {
    console.error('Failed to start OpenCode:', error);
    process.exit(1);
  }
});

program.parse();
