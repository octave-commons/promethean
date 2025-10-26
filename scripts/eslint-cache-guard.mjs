#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';

const ESLINT_CACHE_DIR = '.cache/eslint';

async function ensureCacheDir() {
  try {
    await fs.access(ESLINT_CACHE_DIR);
    console.log('✓ ESLint cache directory exists');
    return true;
  } catch {
    console.log('✗ ESLint cache directory missing');
    return false;
  }
}

async function createCacheDir() {
  try {
    await fs.mkdir(ESLINT_CACHE_DIR, { recursive: true });
    console.log('✓ Created ESLint cache directory');
    return true;
  } catch (error) {
    console.error('✗ Failed to create ESLint cache directory:', error.message);
    return false;
  }
}

async function testCacheDirCreation() {
  // Remove existing directory to test fresh creation
  try {
    await fs.rm(ESLINT_CACHE_DIR, { recursive: true });
  } catch {
    // Directory doesn't exist, which is fine for this test
  }

  const created = await createCacheDir();
  if (!created) {
    process.exit(1);
  }

  const exists = await ensureCacheDir();
  if (!exists) {
    console.error('✗ Cache directory creation verification failed');
    process.exit(1);
  }

  console.log('✓ Regression guard passed: cache directory can be created successfully');
}

// Command line interface
const command = process.argv[2];

switch (command) {
  case 'check':
    ensureCacheDir().then((exists) => process.exit(exists ? 0 : 1));
    break;
  case 'create':
    createCacheDir().then((created) => process.exit(created ? 0 : 1));
    break;
  case 'test':
    testCacheDirCreation();
    break;
  default:
    console.log('Usage: node eslint-cache-guard.mjs [check|create|test]');
    console.log('  check  - Verify cache directory exists');
    console.log('  create - Create cache directory if missing');
    console.log('  test   - Test cache directory creation (removes existing)');
    process.exit(1);
}
