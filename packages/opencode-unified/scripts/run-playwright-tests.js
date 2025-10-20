#!/usr/bin/env node

/**
 * Comprehensive Playwright test runner for Opencode Unified Editor
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const TEST_CATEGORIES = {
  'application-load': 'Application Load and Initialization',
  'evil-mode': 'Evil Mode Integration',
  'command-palette': 'Command Palette Integration',
  'buffer-management': 'Buffer Management',
  'plugin-system': 'Plugin System',
  'opencode-integration': 'Opencode SDK Integration',
  'workspace-persistence': 'Workspace Persistence',
};

function runCommand(command, options = {}) {
  try {
    console.log(`🔧 Running: ${command}`);
    const result = execSync(command, {
      stdio: 'inherit',
      encoding: 'utf8',
      ...options,
    });
    return { success: true, output: result };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      output: error.stdout,
    };
  }
}

function ensureDirectories() {
  const dirs = [
    'test-results',
    'test-results/screenshots',
    'test-results/videos',
    'test-results/traces',
    'playwright-report',
  ];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  });
}

function installPlaywright() {
  console.log('🎭 Installing Playwright browsers...');
  const result = runCommand('npx playwright install', { cwd: __dirname });

  if (!result.success) {
    console.error('❌ Failed to install Playwright browsers');
    process.exit(1);
  }

  console.log('✅ Playwright browsers installed successfully');
}

function buildApplication() {
  console.log('🏗️  Building application for testing...');

  // Build TypeScript
  const tsResult = runCommand('pnpm build:typescript');
  if (!tsResult.success) {
    console.error('❌ TypeScript build failed');
    process.exit(1);
  }

  // Build ClojureScript
  const cljsResult = runCommand('pnpm build:clojurescript');
  if (!cljsResult.success) {
    console.error('❌ ClojureScript build failed');
    process.exit(1);
  }

  console.log('✅ Application built successfully');
}

function runTestCategory(category, options = {}) {
  const testName = TEST_CATEGORIES[category];
  console.log(`\n🧪 Running ${testName} Tests`);
  console.log('='.repeat(50));

  const testPattern = `tests/e2e/${category}.playwright.spec.ts`;
  let command = `npx playwright test ${testPattern}`;

  if (options.headed) {
    command += ' --headed';
  }

  if (options.debug) {
    command += ' --debug';
  }

  if (options.ui) {
    command += ' --ui';
  }

  if (options.browser) {
    command += ` --project=${options.browser}`;
  }

  const result = runCommand(command);

  if (result.success) {
    console.log(`✅ ${testName} tests passed`);
  } else {
    console.log(`❌ ${testName} tests failed`);
  }

  return result.success;
}

function runAllTests(options = {}) {
  console.log('🚀 Running all Playwright integration tests');
  console.log('='.repeat(60));

  const results = {};
  let totalPassed = 0;
  let totalFailed = 0;

  for (const [category, name] of Object.entries(TEST_CATEGORIES)) {
    const passed = runTestCategory(category, options);
    results[category] = passed;

    if (passed) {
      totalPassed++;
    } else {
      totalFailed++;
    }
  }

  // Print summary
  console.log('\n📊 Test Results Summary');
  console.log('='.repeat(30));

  for (const [category, name] of Object.entries(TEST_CATEGORIES)) {
    const status = results[category] ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${name}`);
  }

  console.log(`\n📈 Total: ${totalPassed + totalFailed} tests`);
  console.log(`✅ Passed: ${totalPassed}`);
  console.log(`❌ Failed: ${totalFailed}`);

  if (totalFailed > 0) {
    console.log('\n🔍 Check the following for details:');
    console.log('  - playwright-report/index.html (HTML report)');
    console.log('  - test-results/ (screenshots, videos, traces)');
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed!');
  }
}

function generateReport() {
  console.log('\n📋 Generating comprehensive test report...');

  const reportData = {
    timestamp: new Date().toISOString(),
    environment: {
      node: process.version,
      platform: process.platform,
      arch: process.arch,
    },
    testCategories: Object.keys(TEST_CATEGORIES),
    results: {},
  };

  // Try to read test results if available
  try {
    if (fs.existsSync('test-results.json')) {
      const testResults = JSON.parse(fs.readFileSync('test-results.json', 'utf8'));
      reportData.results = testResults;
    }
  } catch (error) {
    console.warn('⚠️  Could not read test results JSON');
  }

  const reportPath = 'test-results/integration-test-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
  console.log(`📄 Report saved to: ${reportPath}`);
}

function main() {
  const args = process.argv.slice(2);
  const options = {
    headed: args.includes('--headed'),
    debug: args.includes('--debug'),
    ui: args.includes('--ui'),
    install: args.includes('--install'),
    build: args.includes('--build') || !args.includes('--no-build'),
  };

  // Extract browser option
  const browserIndex = args.findIndex((arg) => arg.startsWith('--browser='));
  if (browserIndex !== -1) {
    options.browser = args[browserIndex].split('=')[1];
  }

  // Extract specific test category
  const categoryIndex = args.findIndex((arg) => !arg.startsWith('--'));
  const specificCategory = categoryIndex !== -1 ? args[categoryIndex] : null;

  console.log('🎭 Opencode Unified Editor - Playwright Integration Tests');
  console.log('='.repeat(60));

  // Setup
  ensureDirectories();

  if (options.install) {
    installPlaywright();
  }

  if (options.build) {
    buildApplication();
  }

  // Run tests
  if (specificCategory && TEST_CATEGORIES[specificCategory]) {
    const passed = runTestCategory(specificCategory, options);
    process.exit(passed ? 0 : 1);
  } else {
    runAllTests(options);
  }

  // Generate report
  generateReport();

  console.log('\n🏁 Integration testing complete!');
}

if (require.main === module) {
  main();
}

module.exports = {
  runAllTests,
  runTestCategory,
  installPlaywright,
  buildApplication,
};
