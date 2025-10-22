#!/usr/bin/env node

/**
 * Security Validation Test Script
 *
 * This script tests the security fixes implemented for the indexer service
 * and validates that path traversal vulnerabilities are properly mitigated.
 */

import { execSync } from 'child_process';
import http from 'http';

const INDEXER_PORT = 8001;
const MCP_PORT = 3000;

// Test cases for path traversal attacks
const ATTACK_VECTORS = [
  {
    name: 'Basic Path Traversal',
    payload: '../../../etc/passwd',
    expected: 'blocked',
  },
  {
    name: 'Unicode Homograph Attack',
    payload: 'src/‥/etc/passwd',
    expected: 'blocked',
  },
  {
    name: 'Double-Encoded Attack',
    payload: 'src/%252e%252e%252f/etc/passwd',
    expected: 'blocked',
  },
  {
    name: 'Nested Traversal Attack',
    payload: 'src/....//....//etc/passwd',
    expected: 'blocked',
  },
  {
    name: 'Mixed Encoding Attack',
    payload: 'src/..%2fetc/passwd',
    expected: 'blocked',
  },
  {
    name: 'Windows-style Attack',
    payload: 'src/..\\etc\\passwd',
    expected: 'blocked',
  },
  {
    name: 'URL Encoded Attack',
    payload: 'src/%2e%2e%2fetc/passwd',
    expected: 'blocked',
  },
  {
    name: 'Unicode Dots Attack',
    payload: 'src/﹒﹒/etc/passwd',
    expected: 'blocked',
  },
  {
    name: 'Long Path Traversal',
    payload: '../'.repeat(50) + 'etc/passwd',
    expected: 'blocked',
  },
  {
    name: 'Legitimate Path (Should Pass)',
    payload: 'src/components/Button.tsx',
    expected: 'allowed',
  },
  {
    name: 'Legitimate Nested Path (Should Pass)',
    payload: 'packages/security/src/path-validation.ts',
    expected: 'allowed',
  },
];

// Rate limiting test cases
const RATE_LIMIT_TESTS = [
  {
    name: 'Normal Load (Should Pass)',
    requests: 50,
    interval: 100, // ms
    expected: 'allowed',
  },
  {
    name: 'High Load (Should Be Limited)',
    requests: 150,
    interval: 10, // ms
    expected: 'limited',
  },
];

class SecurityTester {
  constructor() {
    this.results = {
      pathTraversal: { passed: 0, failed: 0, total: 0 },
      rateLimit: { passed: 0, failed: 0, total: 0 },
      overall: { passed: 0, failed: 0 },
    };
  }

  async makeRequest(port, path, method = 'POST', data = null) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: port,
        path: path,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Security-Test-Script/1.0',
        },
      };

      if (data) {
        const jsonData = JSON.stringify(data);
        options.headers['Content-Length'] = Buffer.byteLength(jsonData);
      }

      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body,
          });
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      if (data) {
        req.write(JSON.stringify(data));
      }
      req.end();
    });
  }

  async testPathTraversal() {
    console.log('\n🔍 Testing Path Traversal Protection...\n');

    for (const test of ATTACK_VECTORS) {
      try {
        const response = await this.makeRequest(INDEXER_PORT, '/search', 'POST', {
          path: test.payload,
        });

        const isBlocked = response.statusCode >= 400;
        const testPassed =
          (test.expected === 'blocked' && isBlocked) || (test.expected === 'allowed' && !isBlocked);

        this.results.pathTraversal.total++;

        if (testPassed) {
          this.results.pathTraversal.passed++;
          console.log(`✅ ${test.name}: ${test.payload} - ${response.statusCode}`);
        } else {
          this.results.pathTraversal.failed++;
          console.log(
            `❌ ${test.name}: ${test.payload} - ${response.statusCode} (Expected: ${test.expected})`,
          );
        }

        // Log response details for failed tests
        if (!testPassed) {
          console.log(`   Response: ${response.body.substring(0, 200)}...`);
        }
      } catch (error) {
        this.results.pathTraversal.failed++;
        this.results.pathTraversal.total++;
        console.log(`❌ ${test.name}: ${test.payload} - ERROR: ${error.message}`);
      }
    }
  }

  async testRateLimiting() {
    console.log('\n⚡ Testing Rate Limiting...\n');

    for (const test of RATE_LIMIT_TESTS) {
      try {
        const results = [];
        const startTime = Date.now();

        // Make requests in parallel
        const promises = [];
        for (let i = 0; i < test.requests; i++) {
          promises.push(
            this.makeRequest(INDEXER_PORT, '/status', 'GET').catch((err) => ({
              statusCode: 0,
              error: err.message,
            })),
          );
        }

        const responses = await Promise.all(promises);
        const endTime = Date.now();

        const successCount = responses.filter((r) => r.statusCode === 200).length;
        const blockedCount = responses.filter((r) => r.statusCode === 429).length;
        const errorCount = responses.filter((r) => r.statusCode === 0).length;

        const testPassed =
          (test.expected === 'allowed' && successCount > test.requests * 0.8) ||
          (test.expected === 'limited' && blockedCount > test.requests * 0.2);

        this.results.rateLimit.total++;

        if (testPassed) {
          this.results.rateLimit.passed++;
          console.log(
            `✅ ${test.name}: ${successCount} success, ${blockedCount} blocked, ${errorCount} errors`,
          );
        } else {
          this.results.rateLimit.failed++;
          console.log(
            `❌ ${test.name}: ${successCount} success, ${blockedCount} blocked, ${errorCount} errors (Expected: ${test.expected})`,
          );
        }

        console.log(`   Duration: ${endTime - startTime}ms`);
      } catch (error) {
        this.results.rateLimit.failed++;
        this.results.rateLimit.total++;
        console.log(`❌ ${test.name}: ERROR: ${error.message}`);
      }
    }
  }

  async testSecurityHeaders() {
    console.log('\n🛡️ Testing Security Headers...\n');

    try {
      const response = await this.makeRequest(INDEXER_PORT, '/', 'GET');

      const requiredHeaders = [
        'x-content-type-options',
        'x-frame-options',
        'x-xss-protection',
        'strict-transport-security',
      ];

      let headersPassed = 0;
      for (const header of requiredHeaders) {
        if (response.headers[header]) {
          headersPassed++;
          console.log(`✅ ${header}: ${response.headers[header]}`);
        } else {
          console.log(`❌ ${header}: MISSING`);
        }
      }

      const score = (headersPassed / requiredHeaders.length) * 100;
      console.log(`\nSecurity Headers Score: ${score.toFixed(1)}%`);

      if (score >= 75) {
        this.results.overall.passed++;
      } else {
        this.results.overall.failed++;
      }
    } catch (error) {
      console.log(`❌ Security Headers Test: ERROR: ${error.message}`);
      this.results.overall.failed++;
    }
  }

  async testServiceAvailability() {
    console.log('\n📡 Testing Service Availability...\n');

    const services = [
      { name: 'Indexer Service', port: INDEXER_PORT },
      { name: 'MCP Service', port: MCP_PORT },
    ];

    for (const service of services) {
      try {
        const response = await this.makeRequest(service.port, '/health', 'GET');

        if (response.statusCode === 200) {
          console.log(`✅ ${service.name}: Available (${response.statusCode})`);
          this.results.overall.passed++;
        } else {
          console.log(`⚠️ ${service.name}: Available but unhealthy (${response.statusCode})`);
          this.results.overall.failed++;
        }
      } catch (error) {
        console.log(`❌ ${service.name}: Unavailable - ${error.message}`);
        this.results.overall.failed++;
      }
    }
  }

  async checkPM2Processes() {
    console.log('\n🔄 Checking PM2 Process Status...\n');

    try {
      const output = execSync('pm2 jlist', { encoding: 'utf8' });
      const processes = JSON.parse(output);

      const indexerProcess = processes.find((p) => p.name === 'opencode-indexer');
      const mcpProcess = processes.find((p) => p.name === 'opencode-mcp');

      if (indexerProcess) {
        console.log(
          `✅ Indexer Process: ${indexerProcess.pm2_env.status} (PID: ${indexerProcess.pid})`,
        );
        if (indexerProcess.pm2_env.status === 'online') {
          this.results.overall.passed++;
        } else {
          this.results.overall.failed++;
        }
      } else {
        console.log(`❌ Indexer Process: NOT FOUND`);
        this.results.overall.failed++;
      }

      if (mcpProcess) {
        console.log(`✅ MCP Process: ${mcpProcess.pm2_env.status} (PID: ${mcpProcess.pid})`);
        if (mcpProcess.pm2_env.status === 'online') {
          this.results.overall.passed++;
        } else {
          this.results.overall.failed++;
        }
      } else {
        console.log(`❌ MCP Process: NOT FOUND`);
        this.results.overall.failed++;
      }
    } catch (error) {
      console.log(`❌ PM2 Check: ERROR - ${error.message}`);
      this.results.overall.failed++;
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 SECURITY VALIDATION REPORT');
    console.log('='.repeat(60));

    // Path Traversal Results
    const pathScore =
      this.results.pathTraversal.total > 0
        ? ((this.results.pathTraversal.passed / this.results.pathTraversal.total) * 100).toFixed(1)
        : 0;
    console.log(`\n🔍 Path Traversal Protection:`);
    console.log(
      `   Passed: ${this.results.pathTraversal.passed}/${this.results.pathTraversal.total} (${pathScore}%)`,
    );

    if (this.results.pathTraversal.failed > 0) {
      console.log(`   ⚠️ ${this.results.pathTraversal.failed} vulnerabilities detected!`);
    }

    // Rate Limiting Results
    const rateScore =
      this.results.rateLimit.total > 0
        ? ((this.results.rateLimit.passed / this.results.rateLimit.total) * 100).toFixed(1)
        : 0;
    console.log(`\n⚡ Rate Limiting:`);
    console.log(
      `   Passed: ${this.results.rateLimit.passed}/${this.results.rateLimit.total} (${rateScore}%)`,
    );

    // Overall Results
    const totalTests = this.results.overall.passed + this.results.overall.failed;
    const overallScore =
      totalTests > 0 ? ((this.results.overall.passed / totalTests) * 100).toFixed(1) : 0;
    console.log(`\n📈 Overall Security Score:`);
    console.log(`   Passed: ${this.results.overall.passed}/${totalTests} (${overallScore}%)`);

    // Risk Assessment
    console.log(`\n🚨 Risk Assessment:`);
    if (this.results.pathTraversal.failed > 0) {
      console.log(`   🔴 CRITICAL: Path traversal vulnerabilities detected!`);
      console.log(`   📋 Action: Immediate security hardening required`);
    } else if (overallScore >= 90) {
      console.log(`   🟢 LOW: Security controls are effective`);
    } else if (overallScore >= 75) {
      console.log(`   🟡 MEDIUM: Some security improvements needed`);
    } else {
      console.log(`   🟠 HIGH: Significant security issues present`);
    }

    // Recommendations
    console.log(`\n💡 Recommendations:`);
    if (this.results.pathTraversal.failed > 0) {
      console.log(`   1. Deploy comprehensive path validation to indexer service`);
      console.log(`   2. Implement security middleware across all services`);
    }
    if (this.results.rateLimit.failed > 0) {
      console.log(`   3. Configure rate limiting on all public endpoints`);
    }
    if (overallScore < 90) {
      console.log(`   4. Enable security headers on all services`);
      console.log(`   5. Implement real-time security monitoring`);
    }

    console.log('\n' + '='.repeat(60));

    // Exit with appropriate code
    if (this.results.pathTraversal.failed > 0) {
      process.exit(2); // Critical security issues
    } else if (overallScore < 75) {
      process.exit(1); // Security issues present
    } else {
      process.exit(0); // All good
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Security Validation Tests...');
    console.log(`Target Services: Indexer (${INDEXER_PORT}), MCP (${MCP_PORT})`);

    await this.checkPM2Processes();
    await this.testServiceAvailability();
    await this.testPathTraversal();
    await this.testRateLimiting();
    await this.testSecurityHeaders();

    this.generateReport();
  }
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new SecurityTester();
  tester.runAllTests().catch(console.error);
}

export { SecurityTester };
