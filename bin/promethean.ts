#!/usr/bin/env node

// Promethean CLI Entrypoint

import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

interface CliError extends Error {
  code?: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const bundlePath = path.resolve(__dirname, '../packages/promethean-cli/dist/promethean_cli.cjs');

async function run(): Promise<void> {
  if (!existsSync(bundlePath)) {
    console.error(
      'Promethean CLI bundle not found. Run `pnpm --filter @promethean/promethean-cli build` first.',
    );
    process.exit(1);
  }

  try {
    await import(pathToFileURL(bundlePath).href);
  } catch (error) {
    const cliError = error as CliError;
    console.error('Failed to load Promethean CLI bundle.');
    console.error(cliError);
    process.exit(1);
  }
}

await run();
