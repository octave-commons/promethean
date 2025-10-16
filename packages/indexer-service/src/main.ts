#!/usr/bin/env node
import { buildServer } from './server.js';

async function start() {
  try {
    const { app, config } = await buildServer();
    await app.listen({ port: config.port, host: config.host });
    app.log.info({ port: config.port, host: config.host }, 'Indexer service started');
  } catch (error) {
    console.error('Failed to start indexer service', error);
    process.exitCode = 1;
  }
}

void start();
