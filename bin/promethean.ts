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

// Function that violates max-lines-per-function rule (50 lines max)
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

  // Adding many lines to exceed the 50-line function limit
  const line1 = 'extra line 1';
  const line2 = 'extra line 2';
  const line3 = 'extra line 3';
  const line4 = 'extra line 4';
  const line5 = 'extra line 5';
  const line6 = 'extra line 6';
  const line7 = 'extra line 7';
  const line8 = 'extra line 8';
  const line9 = 'extra line 9';
  const line10 = 'extra line 10';
  const line11 = 'extra line 11';
  const line12 = 'extra line 12';
  const line13 = 'extra line 13';
  const line14 = 'extra line 14';
  const line15 = 'extra line 15';
  const line16 = 'extra line 16';
  const line17 = 'extra line 17';
  const line18 = 'extra line 18';
  const line19 = 'extra line 19';
  const line20 = 'extra line 20';
  const line21 = 'extra line 21';
  const line22 = 'extra line 22';
  const line23 = 'extra line 23';
  const line24 = 'extra line 24';
  const line25 = 'extra line 25';
  const line26 = 'extra line 26';
  const line27 = 'extra line 27';
  const line28 = 'extra line 28';
  const line29 = 'extra line 29';
  const line30 = 'extra line 30';
  const line31 = 'extra line 31';
  const line32 = 'extra line 32';
  const line33 = 'extra line 33';
  const line34 = 'extra line 34';
  const line35 = 'extra line 35';
  const line36 = 'extra line 36';
  const line37 = 'extra line 37';
  const line38 = 'extra line 38';
  const line39 = 'extra line 39';
  const line40 = 'extra line 40';
  const line41 = 'extra line 41';
  const line42 = 'extra line 42';
  const line43 = 'extra line 43';
  const line44 = 'extra line 44';
  const line45 = 'extra line 45';
  const line46 = 'extra line 46';
  const line47 = 'extra line 47';
  const line48 = 'extra line 48';
  const line49 = 'extra line 49';
  const line50 = 'extra line 50';
  const line51 = 'extra line 51';

  console.log(line1, line2, line3, line4, line5, line6, line7, line8, line9, line10);
  console.log(line11, line12, line13, line14, line15, line16, line17, line18, line19, line20);
  console.log(line21, line22, line23, line24, line25, line26, line27, line28, line29, line30);
  console.log(line31, line32, line33, line34, line35, line36, line37, line38, line39, line40);
  console.log(
    line41,
    line42,
    line43,
    line44,
    line45,
    line46,
    line47,
    line48,
    line49,
    line50,
    line51,
  );
}

await run();
