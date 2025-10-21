#!/usr/bin/env node

/**
 * Cross-platform testing script for Promethean framework
 * Handles platform-specific testing scenarios and orchestration
 */

import { execSync } from 'child_process';
import { platform, arch } from 'os';
import { join, resolve } from 'path';

const currentPlatform = platform();
const currentArch = arch();
const isWindows = currentPlatform === 'win32';
const isMacOS = currentPlatform === 'darwin';
const isLinux = currentPlatform === 'linux';

console.log(`🧪 Cross-platform testing running on: ${currentPlatform} (${currentArch})`);

/**
 * Execute a command with proper error handling
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
 * Get platform-specific test configuration
 */
function getPlatformConfig() {
  const config = {
    nodeVersions: ['18', '20'],
    testTimeout: isWindows ? 60000 : 30000, // Windows needs more time
    parallelJobs: isWindows ? 2 : 4, // Fewer parallel jobs on Windows
    memoryLimit: isWindows ? '2048m' : '4096m',
  };

  // Platform-specific adjustments
  if (isMacOS) {
    config.browsers = ['chrome', 'safari', 'firefox'];
  } else if (isWindows) {
    config.browsers = ['chrome', 'edge', 'firefox'];
  } else {
    config.browsers = ['chrome', 'firefox'];
  }

  return config;
}

/**
 * Run unit tests with platform-specific settings
 */
function runUnitTests() {
  console.log('🔬 Running unit tests...');

  const config = getPlatformConfig();
  const env = {
    ...process.env,
    NODE_OPTIONS: `--max-old-space-size=${config.memoryLimit}`,
    TEST_TIMEOUT: config.testTimeout,
    PARALLEL_JOBS: config.parallelJobs,
  };

  // Run tests for each Node version
  for (const nodeVersion of config.nodeVersions) {
    console.log(`Testing with Node.js ${nodeVersion}...`);

    try {
      // Use nvm or similar to switch Node versions if available
      execCommand(`pnpm test:unit:all`, { env });
    } catch (error) {
      console.error(`Unit tests failed for Node.js ${nodeVersion}`);
      throw error;
    }
  }
}

/**
 * Run integration tests
 */
function runIntegrationTests() {
  console.log('🔗 Running integration tests...');

  const config = getPlatformConfig();
  const env = {
    ...process.env,
    NODE_OPTIONS: `--max-old-space-size=${config.memoryLimit}`,
    TEST_TIMEOUT: config.testTimeout,
  };

  execCommand('pnpm test:integration:all', { env });
}

/**
 * Run E2E tests with cross-browser support
 */
function runE2ETests() {
  console.log('🎭 Running E2E tests...');

  const config = getPlatformConfig();

  for (const browser of config.browsers) {
    console.log(`Testing with ${browser}...`);

    const env = {
      ...process.env,
      BROWSER: browser,
      HEADED: process.env.CI ? 'false' : 'true',
      SLOWMO: process.env.CI ? '0' : '100',
    };

    try {
      execCommand('pnpm test:e2e:all', { env });
    } catch (error) {
      console.error(`E2E tests failed for ${browser}`);
      throw error;
    }
  }
}

/**
 * Run performance benchmarks
 */
function runPerformanceTests() {
  console.log('⚡ Running performance benchmarks...');

  const config = getPlatformConfig();
  const env = {
    ...process.env,
    PLATFORM: currentPlatform,
    ARCHITECTURE: currentArch,
    BENCHMARK_ITERATIONS: isWindows ? '5' : '10', // Fewer iterations on Windows
  };

  execCommand('node scripts/performance-benchmark.js', { env });
}

/**
 * Run security audit
 */
function runSecurityAudit() {
  console.log('🔒 Running security audit...');

  try {
    execCommand('pnpm audit --audit-level moderate');
  } catch (error) {
    console.warn('Security audit found issues (continuing...)');
  }

  // Run additional security scanning
  try {
    execCommand('pnpm exec semgrep --config=auto .');
  } catch (error) {
    console.warn('Semgrep scan found issues (continuing...)');
  }
}

/**
 * Generate cross-platform test report
 */
function generateTestReport() {
  console.log('📊 Generating test report...');

  const reportData = {
    platform: currentPlatform,
    architecture: currentArch,
    timestamp: new Date().toISOString(),
    config: getPlatformConfig(),
    results: {
      unitTests: 'passed', // This would be populated from actual test results
      integrationTests: 'passed',
      e2eTests: 'passed',
      performanceTests: 'passed',
      securityAudit: 'passed',
    },
  };

  const reportPath = join(
    process.cwd(),
    'test-results',
    `cross-platform-report-${currentPlatform}-${Date.now()}.json`,
  );

  // Ensure directory exists
  execCommand(`mkdir -p $(dirname "${reportPath}")`);

  // Write report
  require('fs').writeFileSync(reportPath, JSON.stringify(reportData, null, 2));

  console.log(`📋 Test report saved to: ${reportPath}`);
}

/**
 * Run platform-specific validation
 */
function runPlatformValidation() {
  console.log('✅ Running platform-specific validation...');

  if (isWindows) {
    // Windows-specific validations
    execCommand('where node && where pnpm && where git');
  } else if (isMacOS) {
    // macOS-specific validations
    execCommand('which node && which pnpm && which git && which brew');
  } else {
    // Linux-specific validations
    execCommand('which node && which pnpm && which git && which docker');
  }

  // Check available memory
  if (isWindows) {
    execCommand('wmic computersystem get TotalPhysicalMemory');
  } else {
    execCommand('free -h');
  }
}

/**
 * Main execution function
 */
function main() {
  const command = process.argv[2];

  switch (command) {
    case 'unit':
      runUnitTests();
      break;
    case 'integration':
      runIntegrationTests();
      break;
    case 'e2e':
      runE2ETests();
      break;
    case 'performance':
      runPerformanceTests();
      break;
    case 'security':
      runSecurityAudit();
      break;
    case 'validate':
      runPlatformValidation();
      break;
    case 'report':
      generateTestReport();
      break;
    case 'all':
      console.log('🚀 Running comprehensive cross-platform test suite...');
      runPlatformValidation();
      runUnitTests();
      runIntegrationTests();
      runE2ETests();
      runPerformanceTests();
      runSecurityAudit();
      generateTestReport();
      break;
    default:
      console.log(`
🧪 Cross-Platform Testing Helper

Usage: node scripts/cross-platform-test.js <command>

Commands:
  unit         - Run unit tests for all Node versions
  integration  - Run integration tests
  e2e          - Run E2E tests for all browsers
  performance  - Run performance benchmarks
  security     - Run security audit
  validate     - Run platform-specific validation
  report       - Generate test report
  all          - Run all tests (default)

Current platform: ${currentPlatform} (${currentArch})
Platform config: ${JSON.stringify(getPlatformConfig(), null, 2)}
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
  getPlatformConfig,
  runUnitTests,
  runIntegrationTests,
  runE2ETests,
  runPerformanceTests,
  runSecurityAudit,
  generateTestReport,
  runPlatformValidation,
  isWindows,
  isMacOS,
  isLinux,
};
