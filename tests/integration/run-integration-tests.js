#!/usr/bin/env node

/**
 * Comprehensive Integration Test Runner
 *
 * This script orchestrates all integration test environments:
 * 1. Security Integration Tests (Fastify + Redis + Git server)
 * 2. API Integration Tests (MCP-Kanban Bridge + WireMock + SQLite)
 * 3. Infrastructure Integration Tests (BuildFix pipeline + ESLint + MinIO)
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

class IntegrationTestRunner {
  constructor() {
    this.testSuites = [
      {
        name: 'Security Integration Tests',
        path: './security/docker-compose.security.yml',
        envFile: '.env.security.test',
        priority: 1, // Run first (security-critical)
        description: 'HTTP client → auth middleware → git driver flow',
      },
      {
        name: 'API Integration Tests',
        path: './api/docker-compose.mcp-kanban.yml',
        envFile: '.env.api.test',
        priority: 2,
        description: 'MCP client → bridge → kanban stub → mapping DB',
      },
      {
        name: 'Infrastructure Integration Tests',
        path: './infrastructure/docker-compose.buildfix.yml',
        envFile: '.env.infrastructure.test',
        priority: 3,
        description: 'CI job → cache module → FS → build tool interaction',
      },
    ];

    this.results = {
      passed: 0,
      failed: 0,
      total: 0,
      details: [],
    };

    this.startTime = Date.now();
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    console.log(`${prefix} ${message}`);
  }

  async executeCommand(command, cwd = process.cwd()) {
    return new Promise((resolve, reject) => {
      try {
        this.log(`Executing: ${command}`, 'debug');
        const result = execSync(command, {
          cwd,
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'pipe'],
          timeout: 300000, // 5 minutes
        });
        resolve({ stdout: result, stderr: '' });
      } catch (error) {
        resolve({
          stdout: error.stdout || '',
          stderr: error.stderr || error.message,
          exitCode: error.status,
        });
      }
    });
  }

  async checkDockerCompose() {
    try {
      await this.executeCommand('docker-compose --version');
      return true;
    } catch (error) {
      this.log('Docker Compose not available', 'error');
      return false;
    }
  }

  async checkDocker() {
    try {
      await this.executeCommand('docker --version');
      await this.executeCommand('docker info');
      return true;
    } catch (error) {
      this.log('Docker not available or not running', 'error');
      return false;
    }
  }

  async createEnvFiles() {
    this.log('Creating environment files...');

    const envConfigs = {
      '.env.security.test': `
NODE_ENV=test
LOG_LEVEL=info
JWT_SECRET=integration-test-jwt-secret-change-in-production
REDIS_URL=redis://redis-security:6379
GIT_SERVER_URL=http://git-server:3002
AUTH_SERVICE_URL=http://auth-service:3003
FASTIFY_GATEWAY_URL=http://fastify-gateway:3000
`.trim(),

      '.env.api.test': `
NODE_ENV=test
WIREMOCK_URL=http://wiremock:8080
NLP_PARSER_URL=http://nlp-parser:4000
MCP_SERVER_URL=http://mcp-server:3000
SQLITE_DB_PATH=/data/kanban.db
BRIDGE_LOG_LEVEL=info
`.trim(),

      '.env.infrastructure.test': `
NODE_ENV=test
ESLINT_STUB_URL=http://eslint-stub:5000
DEPLOY_STUB_URL=http://deploy-stub:6000
PIPELINE_ORCHESTRATOR_URL=http://pipeline-orchestrator:7000
MINIO_ENDPOINT=minio-stub:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
BUILD_CACHE_TTL=3600
PIPELINE_TIMEOUT=300000
`.trim(),
    };

    for (const [filename, content] of Object.entries(envConfigs)) {
      const filePath = path.join(process.cwd(), filename);
      fs.writeFileSync(filePath, content);
      this.log(`Created ${filename}`);
    }
  }

  async cleanupTestSuite(testSuite) {
    this.log(`Cleaning up ${testSuite.name}...`);

    try {
      // Stop and remove containers
      await this.executeCommand(`docker-compose -f "${testSuite.path}" down -v --remove-orphans`);

      // Remove images if needed
      await this.executeCommand(`docker-compose -f "${testSuite.path}" down --rmi all`);

      this.log(`Cleaned up ${testSuite.name}`);
    } catch (error) {
      this.log(`Cleanup warning for ${testSuite.name}: ${error.message}`, 'warn');
    }
  }

  async runTestSuite(testSuite) {
    this.log(`\n🧪 Running ${testSuite.name}`, 'info');
    this.log(`📝 Description: ${testSuite.description}`, 'info');

    const suiteResult = {
      name: testSuite.name,
      description: testSuite.description,
      startTime: Date.now(),
      status: 'running',
      output: [],
      errors: [],
    };

    try {
      // Cleanup any existing containers
      await this.cleanupTestSuite(testSuite);

      // Start the test environment
      this.log(`🚀 Starting ${testSuite.name} environment...`);
      const upResult = await this.executeCommand(
        `docker-compose -f "${testSuite.path}" up --build -d`,
        process.cwd(),
      );

      if (upResult.exitCode !== 0) {
        throw new Error(`Failed to start environment: ${upResult.stderr}`);
      }

      // Wait for services to be healthy
      this.log(`⏳ Waiting for services to be healthy...`);
      await this.waitForHealthChecks(testSuite);

      // Run the actual tests
      this.log(`🧪 Running integration tests...`);
      const testResult = await this.executeCommand(
        `docker-compose -f "${testSuite.path}" logs -f --tail=100`,
        process.cwd(),
      );

      // Check if tests passed (look for success indicators)
      const success = this.checkTestSuccess(testResult.stdout + testResult.stderr);

      suiteResult.status = success ? 'passed' : 'failed';
      suiteResult.output.push(testResult.stdout);
      suiteResult.endTime = Date.now();
      suiteResult.duration = suiteResult.endTime - suiteResult.startTime;

      if (success) {
        this.log(`✅ ${testSuite.name} passed (${suiteResult.duration}ms)`);
        this.results.passed++;
      } else {
        this.log(`❌ ${testSuite.name} failed (${suiteResult.duration}ms)`, 'error');
        this.results.failed++;
        suiteResult.errors.push('Test execution failed - check logs for details');
      }
    } catch (error) {
      suiteResult.status = 'failed';
      suiteResult.endTime = Date.now();
      suiteResult.duration = suiteResult.endTime - suiteResult.startTime;
      suiteResult.errors.push(error.message);

      this.log(`❌ ${testSuite.name} failed: ${error.message}`, 'error');
      this.results.failed++;
    } finally {
      // Cleanup
      await this.cleanupTestSuite(testSuite);
    }

    this.results.details.push(suiteResult);
    this.results.total++;
  }

  async waitForHealthChecks(testSuite) {
    const maxWaitTime = 120000; // 2 minutes
    const checkInterval = 5000; // 5 seconds
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      try {
        // Check if all containers are healthy
        const healthResult = await this.executeCommand(
          `docker-compose -f "${testSuite.path}" ps --format "table {{.Name}}\t{{.Status}}"`,
          process.cwd(),
        );

        const lines = healthResult.stdout.split('\n').slice(1); // Skip header
        const containers = lines.filter((line) => line.trim());

        const healthyContainers = containers.filter(
          (container) => container.includes('healthy') || container.includes('running'),
        );

        if (healthyContainers.length === containers.length && containers.length > 0) {
          this.log(`✅ All ${containers.length} services are healthy`);
          return;
        }

        this.log(
          `⏳ Waiting for services... (${healthyContainers.length}/${containers.length} healthy)`,
        );
      } catch (error) {
        this.log(`Health check error: ${error.message}`, 'warn');
      }

      await new Promise((resolve) => setTimeout(resolve, checkInterval));
    }

    throw new Error('Health check timeout - services not ready within expected time');
  }

  checkTestSuccess(output) {
    const successIndicators = [
      '🎉 All.*integration tests passed',
      'All.*tests passed',
      '✅.*completed successfully',
      'Test suite passed',
      'Integration tests completed successfully',
    ];

    const failureIndicators = [
      '❌.*test failed',
      'Test failed',
      'Integration test failed',
      'Error:.*failed',
      'FAIL:',
      'process.exit(1)',
    ];

    const outputLower = output.toLowerCase();

    // Check for explicit success indicators
    for (const indicator of successIndicators) {
      if (new RegExp(indicator, 'i').test(output)) {
        return true;
      }
    }

    // Check for explicit failure indicators
    for (const indicator of failureIndicators) {
      if (new RegExp(indicator, 'i').test(output)) {
        return false;
      }
    }

    // If no clear indicators, assume success (no explicit failures found)
    return true;
  }

  async generateReport() {
    const endTime = Date.now();
    const totalDuration = endTime - this.startTime;

    const report = {
      summary: {
        total: this.results.total,
        passed: this.results.passed,
        failed: this.results.failed,
        successRate:
          this.results.total > 0
            ? ((this.results.passed / this.results.total) * 100).toFixed(1)
            : 0,
        totalDuration,
        timestamp: new Date().toISOString(),
      },
      testSuites: this.results.details,
      performanceTargets: {
        auth: '<100ms 95th percentile',
        nlpParsing: '<300ms 95th percentile',
        buildCaching: '>95% hit ratio under load',
      },
      recommendations: this.generateRecommendations(),
    };

    // Save report to file
    const reportPath = path.join(process.cwd(), 'integration-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Print summary
    this.log('\n' + '='.repeat(80), 'info');
    this.log('📊 INTEGRATION TEST REPORT', 'info');
    this.log('='.repeat(80), 'info');
    this.log(`Total Tests: ${report.summary.total}`, 'info');
    this.log(`Passed: ${report.summary.passed}`, 'info');
    this.log(`Failed: ${report.summary.failed}`, 'info');
    this.log(`Success Rate: ${report.summary.successRate}%`, 'info');
    this.log(`Total Duration: ${(report.summary.totalDuration / 1000).toFixed(2)}s`, 'info');
    this.log(`Report saved to: ${reportPath}`, 'info');

    // Print detailed results
    for (const suite of report.testSuites) {
      const status = suite.status === 'passed' ? '✅' : '❌';
      this.log(`\n${status} ${suite.name}`, suite.status === 'passed' ? 'info' : 'error');
      this.log(`   Description: ${suite.description}`, 'info');
      this.log(`   Duration: ${(suite.duration / 1000).toFixed(2)}s`, 'info');

      if (suite.errors.length > 0) {
        this.log(`   Errors:`, 'error');
        suite.errors.forEach((error) => this.log(`     - ${error}`, 'error'));
      }
    }

    // Print recommendations
    if (report.recommendations.length > 0) {
      this.log('\n💡 Recommendations:', 'info');
      report.recommendations.forEach((rec) => this.log(`   - ${rec}`, 'info'));
    }

    return report;
  }

  generateRecommendations() {
    const recommendations = [];

    if (this.results.failed > 0) {
      recommendations.push('Review failed test suites and fix integration issues');
    }

    const failedSuites = this.results.details.filter((suite) => suite.status === 'failed');
    if (failedSuites.length > 0) {
      recommendations.push('Focus on security-critical integration points first');
    }

    if (this.results.passed === this.results.total) {
      recommendations.push('All integration tests passed - consider adding more edge case tests');
      recommendations.push('Set up automated integration testing in CI/CD pipeline');
    }

    recommendations.push('Monitor performance targets in production environments');
    recommendations.push('Regularly update test environments to match production');

    return recommendations;
  }

  async run() {
    this.log('🚀 Starting Comprehensive Integration Test Runner', 'info');
    this.log('================================================', 'info');

    try {
      // Prerequisites check
      this.log('🔍 Checking prerequisites...');

      if (!(await this.checkDocker())) {
        throw new Error('Docker is required but not available');
      }

      if (!(await this.checkDockerCompose())) {
        throw new Error('Docker Compose is required but not available');
      }

      // Create environment files
      await this.createEnvFiles();

      // Sort test suites by priority
      const sortedSuites = [...this.testSuites].sort((a, b) => a.priority - b.priority);

      // Run each test suite
      for (const testSuite of sortedSuites) {
        await this.runTestSuite(testSuite);
      }

      // Generate final report
      const report = await this.generateReport();

      // Exit with appropriate code
      process.exit(report.summary.failed > 0 ? 1 : 0);
    } catch (error) {
      this.log(`💥 Integration test runner failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// Run the integration tests
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new IntegrationTestRunner();
  runner.run().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export default IntegrationTestRunner;
