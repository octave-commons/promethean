#!/usr/bin/env node

/**
 * Simple Integration Test Runner
 * Tests one integration environment at a time
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const log = (message, level = 'info') => {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  console.log(`${prefix} ${message}`);
};

const executeCommand = async (command, cwd = process.cwd()) => {
  return new Promise((resolve) => {
    try {
      log(`Executing: ${command}`, 'debug');
      const result = execSync(command, {
        cwd,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 300000,
      });
      resolve({ stdout: result, stderr: '', exitCode: 0 });
    } catch (error) {
      resolve({
        stdout: error.stdout || '',
        stderr: error.stderr || error.message,
        exitCode: error.status || 1,
      });
    }
  });
};

const createEnvFile = () => {
  const envContent = `
NODE_ENV=test
LOG_LEVEL=info
JWT_SECRET=integration-test-jwt-secret-change-in-production
REDIS_URL=redis://redis-security:6379
GIT_SERVER_URL=http://git-server:3002
AUTH_SERVICE_URL=http://auth-service:3003
FASTIFY_GATEWAY_URL=http://fastify-gateway:3000
`.trim();

  fs.writeFileSync('.env.security.test', envContent);
  log('Created .env.security.test');
};

const runSecurityTest = async () => {
  log('🧪 Running Security Integration Tests', 'info');
  log('📝 Description: HTTP client → auth middleware → git driver flow', 'info');

  try {
    // Create environment file
    createEnvFile();

    // Cleanup any existing containers
    log('🧹 Cleaning up existing containers...');
    await executeCommand(
      'docker compose -f security/docker-compose.security.fixed.yml down -v --remove-orphans',
    );

    // Start the test environment
    log('🚀 Starting security test environment...');
    const upResult = await executeCommand(
      'docker compose -f security/docker-compose.security.fixed.yml up --build -d',
    );

    if (upResult.exitCode !== 0) {
      throw new Error(`Failed to start environment: ${upResult.stderr}`);
    }

    // Wait for services to be healthy
    log('⏳ Waiting for services to be healthy...');
    await waitForHealth('security/docker-compose.security.fixed.yml');

    // Run the security tests
    log('🧪 Running security integration tests...');
    const testResult = await executeCommand(
      'docker compose -f security/docker-compose.security.fixed.yml logs -f security-test-runner',
    );

    // Check test results
    const success = testResult.stdout.includes('🎉 All security integration tests passed!');

    if (success) {
      log('✅ Security integration tests passed', 'info');
    } else {
      log('❌ Security integration tests failed', 'error');
      log('Test output:', 'error');
      console.log(testResult.stdout);
      if (testResult.stderr) {
        log('Test errors:', 'error');
        console.log(testResult.stderr);
      }
    }

    // Cleanup
    log('🧹 Cleaning up...');
    await executeCommand(
      'docker compose -f security/docker-compose.security.fixed.yml down -v --remove-orphans',
    );

    return success;
  } catch (error) {
    log(`❌ Security test failed: ${error.message}`, 'error');

    // Try to cleanup even on failure
    try {
      await executeCommand(
        'docker compose -f security/docker-compose.security.fixed.yml down -v --remove-orphans',
      );
    } catch (cleanupError) {
      log(`Cleanup failed: ${cleanupError.message}`, 'warn');
    }

    return false;
  }
};

const waitForHealth = async (composeFile, maxWaitTime = 120000) => {
  const checkInterval = 5000;
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitTime) {
    try {
      const healthResult = await executeCommand(
        `docker compose -f ${composeFile} ps --format "table {{.Name}}\t{{.Status}}"`,
      );

      const lines = healthResult.stdout.split('\n').slice(1);
      const containers = lines.filter((line) => line.trim());

      const healthyContainers = containers.filter(
        (container) => container.includes('healthy') || container.includes('running'),
      );

      if (healthyContainers.length === containers.length && containers.length > 0) {
        log(`✅ All ${containers.length} services are healthy`);
        return;
      }

      log(`⏳ Waiting for services... (${healthyContainers.length}/${containers.length} healthy)`);
    } catch (error) {
      log(`Health check error: ${error.message}`, 'warn');
    }

    await new Promise((resolve) => setTimeout(resolve, checkInterval));
  }

  throw new Error('Health check timeout - services not ready within expected time');
};

// Main execution
const main = async () => {
  log('🚀 Starting Simple Integration Test Runner', 'info');
  log('=============================================', 'info');

  try {
    // Check Docker availability
    log('🔍 Checking Docker availability...');
    const dockerVersion = await executeCommand('docker --version');
    const composeVersion = await executeCommand('docker compose version');

    if (dockerVersion.exitCode !== 0 || composeVersion.exitCode !== 0) {
      throw new Error('Docker or Docker Compose not available');
    }

    log('✅ Docker is available', 'info');

    // Run security integration test
    const success = await runSecurityTest();

    if (success) {
      log('\n🎉 Integration test completed successfully!', 'info');
      process.exit(0);
    } else {
      log('\n❌ Integration test failed', 'error');
      process.exit(1);
    }
  } catch (error) {
    log(`💥 Integration test runner failed: ${error.message}`, 'error');
    process.exit(1);
  }
};

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
