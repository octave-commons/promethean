#!/usr/bin/env node

// Promethean CLI Entrypoint

import { existsSync } from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const bundlePath = path.resolve(
  __dirname,
  "../packages/promethean-cli/dist/promethean_cli.cjs",
);

async function run() {
  if (!existsSync(bundlePath)) {
    console.error(
      "Promethean CLI bundle not found. Run `pnpm --filter @promethean/promethean-cli build` first.",
    );
    process.exit(1);
  }

  try {
    await import(pathToFileURL(bundlePath).href);
  } catch (error) {
    console.error("Failed to load Promethean CLI bundle.");
    console.error(error);
    process.exit(1);
  }
}

await run();
