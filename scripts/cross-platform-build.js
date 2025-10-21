#!/usr/bin/env node

/**
 * Cross-platform build helper script
 * Handles platform-specific operations for consistent builds across Windows, macOS, and Linux
 */

import { execSync } from 'child_process';
import { platform } from 'os';
import { join, resolve } from 'path';

const currentPlatform = platform();
const isWindows = currentPlatform === 'win32';
const isMacOS = currentPlatform === 'darwin';
const isLinux = currentPlatform === 'linux';

console.log(`🔨 Cross-platform build running on: ${currentPlatform}`);

/**
 * Execute a command with proper error handling and platform-specific adjustments
 */
function execCommand(command, options = {}) {
  try {
    console.log(`📝 Executing: ${command}`);
    const result = execSync(command, {
      stdio: 'inherit',
      shell: true,
      ...options,
    });
    return result;
  } catch (error) {
    console.error(`❌ Command failed: ${command}`);
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Get platform-specific environment variables
 */
function getPlatformEnv() {
  const env = { ...process.env };

  if (isWindows) {
    // Windows-specific environment variables
    env.npm_config_target_platform = 'Windows';
    env.PATH = `${env.PATH};C:\\Program Files\\clojure\\bin`;
  } else if (isMacOS) {
    env.npm_config_target_platform = 'macOS';
  } else if (isLinux) {
    env.npm_config_target_platform = 'Linux';
  }

  return env;
}

/**
 * Install dependencies with platform-specific handling
 */
function installDependencies() {
  console.log('📦 Installing dependencies...');

  const env = getPlatformEnv();

  // Install pnpm dependencies
  execCommand('pnpm install --frozen-lockfile', { env });

  // Install Clojure toolchain if not on Windows (handled separately in CI)
  if (!isWindows) {
    try {
      execCommand('which clojure', { stdio: 'pipe' });
      console.log('✅ Clojure already installed');
    } catch {
      console.log('🔧 Installing Clojure toolchain...');
      execCommand('bash run/install-clojure.sh', { env });
    }
  }
}

/**
 * Run type checking with platform-specific adjustments
 */
function runTypeCheck() {
  console.log('🔍 Running type checking...');

  const env = getPlatformEnv();
  const { NX_BASE, NX_HEAD } = process.env;

  if (NX_BASE && NX_HEAD) {
    execCommand(
      `pnpm exec nx affected -t typecheck --parallel --base="${NX_BASE}" --head="${NX_HEAD}"`,
      { env },
    );
  } else {
    execCommand('pnpm -r exec tsc --noEmit --strict', { env });
  }
}

/**
 * Run linting with platform-specific adjustments
 */
function runLinting() {
  console.log('🧹 Running linting...');

  const env = getPlatformEnv();
  const { NX_BASE, NX_HEAD } = process.env;

  if (NX_BASE && NX_HEAD) {
    execCommand(
      `pnpm exec nx affected -t lint --parallel --base="${NX_BASE}" --head="${NX_HEAD}"`,
      { env },
    );
  } else {
    execCommand('pnpm -r lint', { env });
  }
}

/**
 * Run builds with platform-specific adjustments
 */
function runBuilds() {
  console.log('🏗️ Running builds...');

  const env = getPlatformEnv();
  const { NX_BASE, NX_HEAD } = process.env;

  if (NX_BASE && NX_HEAD) {
    execCommand(
      `pnpm exec nx affected -t build --parallel --base="${NX_BASE}" --head="${NX_HEAD}"`,
      { env },
    );
  } else {
    execCommand('pnpm exec nx affected -t build --parallel', { env });
  }
}

/**
 * Main execution function
 */
function main() {
  const command = process.argv[2];

  switch (command) {
    case 'install':
      installDependencies();
      break;
    case 'typecheck':
      runTypeCheck();
      break;
    case 'lint':
      runLinting();
      break;
    case 'build':
      runBuilds();
      break;
    case 'all':
      installDependencies();
      runTypeCheck();
      runLinting();
      runBuilds();
      break;
    default:
      console.log(`
🔨 Cross-platform Build Helper

Usage: node scripts/cross-platform-build.js <command>

Commands:
  install    - Install dependencies
  typecheck  - Run type checking
  lint       - Run linting
  build      - Run builds
  all        - Run all steps (default)

Current platform: ${currentPlatform}
      `);
      process.exit(0);
  }
}

// Run main function if called directly
if (require.main === module) {
  main();
}

module.exports = {
  execCommand,
  getPlatformEnv,
  installDependencies,
  runTypeCheck,
  runLinting,
  runBuilds,
  isWindows,
  isMacOS,
  isLinux,
};
