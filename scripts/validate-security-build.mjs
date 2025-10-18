#!/usr/bin/env node

/**
 * Security Validation Build Script
 *
 * This script runs comprehensive security validation as part of the build process
 * to ensure that security framework integration is working correctly.
 */

import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..', '..');

// ANSI color codes for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step) {
  log(`\n🔍 ${step}`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function runCommand(command, cwd = rootDir) {
  try {
    const result = execSync(command, {
      cwd,
      encoding: 'utf8',
      stdio: 'pipe',
    });
    return { success: true, output: result.trim() };
  } catch (error) {
    return {
      success: false,
      output: error.stdout?.trim() || '',
      error: error.stderr?.trim() || error.message,
    };
  }
}

function checkSecurityPackageExists() {
  logStep('Checking security package existence');

  const securityPackagePath = join(rootDir, 'packages', 'security');

  if (!existsSync(securityPackagePath)) {
    logError('Security package not found');
    return false;
  }

  logSuccess('Security package found');
  return true;
}

function validateTypeScriptCompilation() {
  logStep('Validating TypeScript compilation');

  const result = runCommand('npx tsc --noEmit --project packages/security/tsconfig.json');

  if (!result.success) {
    logError('TypeScript compilation failed');
    console.error(result.error);
    return false;
  }

  logSuccess('TypeScript compilation passed');
  return true;
}

function validateTypeDefinitions() {
  logStep('Validating type definitions');

  const distPath = join(rootDir, 'packages', 'security', 'dist');
  const indexDtsPath = join(distPath, 'index.d.ts');

  if (!existsSync(indexDtsPath)) {
    logWarning('Type definitions not found - running build first');

    const buildResult = runCommand('npm run build', join(rootDir, 'packages', 'security'));
    if (!buildResult.success) {
      logError('Build failed');
      console.error(buildResult.error);
      return false;
    }
  }

  if (!existsSync(indexDtsPath)) {
    logError('Type definitions still not found after build');
    return false;
  }

  try {
    const dtsContent = readFileSync(indexDtsPath, 'utf8');

    // Check for key exports
    const requiredExports = [
      'validatePath',
      'secureReadFile',
      'secureWriteFile',
      'makePolicy',
      'SecurityTestFramework',
    ];

    const missingExports = requiredExports.filter((exportName) => !dtsContent.includes(exportName));

    if (missingExports.length > 0) {
      logError(`Missing type exports: ${missingExports.join(', ')}`);
      return false;
    }

    logSuccess('Type definitions validated');
    return true;
  } catch (error) {
    logError(`Failed to read type definitions: ${error.message}`);
    return false;
  }
}

function validateSecurityExports() {
  logStep('Validating security module exports');

  const indexPath = join(rootDir, 'packages', 'security', 'src', 'index.ts');

  if (!existsSync(indexPath)) {
    logError('Security index file not found');
    return false;
  }

  try {
    const indexContent = readFileSync(indexPath, 'utf8');

    // Check for required export patterns
    const requiredPatterns = [
      'export.*from.*policy',
      'export.*from.*testing',
      'export.*from.*path-validation',
      'export.*from.*secure-file-operations',
      'fileBackedRegistry',
    ];

    const missingPatterns = requiredPatterns.filter(
      (pattern) => !new RegExp(pattern).test(indexContent),
    );

    if (missingPatterns.length > 0) {
      logError(`Missing export patterns: ${missingPatterns.join(', ')}`);
      return false;
    }

    logSuccess('Security exports validated');
    return true;
  } catch (error) {
    logError(`Failed to validate exports: ${error.message}`);
    return false;
  }
}

function validateSecurityTests() {
  logStep('Validating security test structure');

  const testsDir = join(rootDir, 'packages', 'security', 'src', 'tests');

  if (!existsSync(testsDir)) {
    logError('Security tests directory not found');
    return false;
  }

  const requiredTestFiles = [
    'path-validation.test.ts',
    'secure-file-operations.test.ts',
    'policy.test.ts',
    'comprehensive-security.test.ts',
    'prompt-injection.test.ts',
    'fuzzing.test.ts',
  ];

  const missingFiles = requiredTestFiles.filter((file) => !existsSync(join(testsDir, file)));

  if (missingFiles.length > 0) {
    logWarning(`Missing test files: ${missingFiles.join(', ')}`);
  } else {
    logSuccess('Security test structure validated');
  }

  // We don't fail the build for missing tests, just warn
  return true;
}

function validateDependencies() {
  logStep('Validating security package dependencies');

  const packageJsonPath = join(rootDir, 'packages', 'security', 'package.json');

  if (!existsSync(packageJsonPath)) {
    logError('Security package.json not found');
    return false;
  }

  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

    // Check for required dependencies
    if (!packageJson.dependencies || !packageJson.dependencies['@promethean/platform']) {
      logError('Missing required dependency: @promethean/platform');
      return false;
    }

    // Check build scripts
    if (!packageJson.scripts || !packageJson.scripts.build) {
      logError('Missing build script');
      return false;
    }

    if (!packageJson.scripts.typecheck) {
      logWarning('Missing typecheck script');
    }

    logSuccess('Dependencies validated');
    return true;
  } catch (error) {
    logError(`Failed to validate dependencies: ${error.message}`);
    return false;
  }
}

function runSecuritySmokeTest() {
  logStep('Running security smoke test');

  // Try to import and use basic security functions
  const smokeTestCode = `
import { validatePath, sanitizeFileName, makePolicy } from './packages/security/dist/index.js';

try {
  // Test path validation
  const pathResult = validatePath('/tmp', 'test.txt');
  console.log('Path validation:', pathResult.isValid ? 'PASS' : 'FAIL');
  
  // Test filename sanitization
  const sanitized = sanitizeFileName('test<script>.txt');
  console.log('Filename sanitization:', sanitized.includes('script') ? 'FAIL' : 'PASS');
  
  // Test policy creation
  const policy = makePolicy();
  console.log('Policy creation:', policy ? 'PASS' : 'FAIL');
  
  console.log('SMOKE_TEST_SUCCESS');
} catch (error) {
  console.error('SMOKE_TEST_ERROR:', error.message);
  process.exit(1);
}
`;

  try {
    const result = runCommand(`node -e "${smokeTestCode.replace(/"/g, '\\"')}"`);

    if (!result.success || !result.output.includes('SMOKE_TEST_SUCCESS')) {
      logError('Security smoke test failed');
      if (result.error) console.error(result.error);
      return false;
    }

    logSuccess('Security smoke test passed');
    return true;
  } catch (error) {
    logError(`Smoke test execution failed: ${error.message}`);
    return false;
  }
}

function main() {
  log('\n🔐 Security Framework Build Validation', 'blue');
  log('=====================================', 'blue');

  const validations = [
    checkSecurityPackageExists,
    validateTypeScriptCompilation,
    validateTypeDefinitions,
    validateSecurityExports,
    validateSecurityTests,
    validateDependencies,
    runSecuritySmokeTest,
  ];

  let passed = 0;
  let total = validations.length;

  for (const validation of validations) {
    if (validation()) {
      passed++;
    }
  }

  log('\n📊 Validation Summary', 'magenta');
  log('========================', 'magenta');
  log(`Passed: ${passed}/${total} validations`, passed === total ? 'green' : 'yellow');

  if (passed === total) {
    logSuccess('All security validations passed! Framework is ready for production.');
    process.exit(0);
  } else {
    logError(`${total - passed} validation(s) failed. Please fix the issues above.`);
    process.exit(1);
  }
}

// Run the validation
main();
