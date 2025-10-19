#!/usr/bin/env node

/**
 * Client CLI entry point for OpenCode Unified
 */

import { Command } from 'commander';
import { createClient } from './index.js';

const program = new Command();

program.name('opencode-client').description('OpenCode Unified Client CLI').version('1.0.0');

program
  .option('-e, --endpoint <string>', 'Server endpoint', 'http://localhost:3000')
  .option('-t, --timeout <number>', 'Request timeout in ms', '30000')
  .action(async (options) => {
    try {
      const client = createClient({
        endpoint: options.endpoint,
        timeout: parseInt(options.timeout),
      });

      console.log('OpenCode client started');
      console.log('Connected to:', options.endpoint);

      // Test connection
      const health = await client.healthCheck();
      console.log('Server health:', health);

      const info = await client.getInfo();
      console.log('Server info:', info);
    } catch (error) {
      console.error('Failed to connect to server:', error);
      process.exit(1);
    }
  });

program.parse();
