#!/usr/bin/env node

/**
 * ACTUAL SECURITY VALIDATION TEST
 * Tests the actual validation functions against attack vectors
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import the actual validation functions
let validatePathSecurity;
try {
  const validatorsModule = await import('./src/validation/validators.js');
  validatePathSecurity = validatorsModule.validatePathSecurity;
} catch (error) {
  console.error('❌ Failed to import validation functions:', error.message);
  process.exit(1);
}

// Security test vectors for comprehensive validation
const SECURITY_TEST_VECTORS = {
  pathTraversal: [
    '%2e%2e/secret',
    '%2e%2e%2fetc/passwd',
    '%2E%2E%2Fsecret',
    '../../../etc/passwd',
    '..\\..\\windows\\system32',
    '....//....//....//etc/passwd',
    '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
    '..%252f..%252f..%252fetc%252fpasswd',
    '%c0%ae%c0%ae%c0%af%c0%ae%c0%ae%c0%af%c0%ae%c0%ae%c0%afetc%c0%afpasswd',
  ],
  unicodeAttacks: [
    '‥/secret', // Unicode two-dot leader
    '﹒/secret', // Unicode small full stop
    '．．/secret', // Full-width dots
    '．‥/secret', // Mixed unicode dots
    '‥．/secret', // Mixed unicode dots
    '‥‥/secret', // Double unicode two-dot leader
    '．﹒．/secret', // Mixed unicode dots
  ],
  tildeExpansion: [
    '~/.ssh/authorized_keys',
    '~root/.bashrc',
    '~user/Documents/secret.txt',
    '~/../etc/passwd',
    '~/../../root/.ssh',
  ],
  systemPaths: [
    '/etc/passwd',
    '/etc/shadow',
    '/proc/version',
    '/sys/kernel',
    '/root/.ssh',
    '/var/log/auth.log',
    '/etc/sudoers',
    '/boot/grub/grub.cfg',
  ],
  windowsAttacks: [
    'C:\\Windows\\System32',
    '\\\\server\\share',
    'CON',
    'PRN',
    'AUX',
    'NUL',
    'COM1',
    'LPT1',
    'C:\\Windows\\System32\\cmd.exe',
  ],
  globAttacks: [
    '**/../etc/passwd',
    '../**',
    '{../etc/passwd}',
    '..}/etc/passwd',
    '{..,..}/etc/passwd',
    '**/../../etc/passwd',
    '{a,b,../../etc/passwd}',
    '**/*/../etc/passwd',
  ],
  dangerousCharacters: [
    'file<script>alert("xss")</script>',
    'command; rm -rf /',
    'file|cat /etc/passwd',
    'file`whoami`',
    'file$(id)',
    'file\\r\\nheader: injected',
    'file\\x00null',
    'file\\nContent-Type: text/html',
  ],
};

function runActualSecurityTests() {
  console.log('🧪 ACTUAL SECURITY VALIDATION TEST');
  console.log('==================================');

  const results = {};

  Object.entries(SECURITY_TEST_VECTORS).forEach(([category, vectors]) => {
    console.log(`\n🔍 Testing ${category}...`);

    results[category] = {
      totalTests: vectors.length,
      blocked: 0,
      allowed: 0,
      details: [],
    };

    vectors.forEach((vector) => {
      try {
        const validationResult = validatePathSecurity(vector);
        const blocked = !validationResult.valid;

        if (blocked) {
          results[category].blocked++;
        } else {
          results[category].allowed++;
        }

        results[category].details.push({
          vector,
          blocked,
          valid: validationResult.valid,
          securityIssues: validationResult.securityIssues,
          riskLevel: validationResult.riskLevel,
        });

        console.log(`  ${blocked ? '✅' : '❌'} ${vector}`);
        if (!blocked && validationResult.securityIssues) {
          console.log(`    Issues: ${validationResult.securityIssues.join(', ')}`);
        }
      } catch (error) {
        console.log(`  ❌ ${vector} - ERROR: ${error.message}`);
        results[category].allowed++;
      }
    });

    const blockRate = Math.round((results[category].blocked / results[category].totalTests) * 100);
    console.log(
      `  📊 ${results[category].blocked}/${results[category].totalTests} blocked (${blockRate}%)`,
    );
  });

  return results;
}

function printFinalResults(results) {
  console.log('\n📊 FINAL SECURITY TEST RESULTS');
  console.log('==============================');

  let totalTests = 0;
  let totalBlocked = 0;

  Object.entries(results).forEach(([category, result]) => {
    const blockRate = Math.round((result.blocked / result.totalTests) * 100);
    const status = blockRate >= 95 ? '✅' : blockRate >= 80 ? '⚠️' : '❌';

    console.log(
      `${status} ${category}: ${result.blocked}/${result.totalTests} blocked (${blockRate}%)`,
    );

    totalTests += result.totalTests;
    totalBlocked += result.blocked;
  });

  const overallBlockRate = Math.round((totalBlocked / totalTests) * 100);
  const overallStatus =
    overallBlockRate >= 95
      ? '✅ SECURED'
      : overallBlockRate >= 80
        ? '⚠️ MOSTLY SECURED'
        : '❌ VULNERABLE';

  console.log(
    `\n🎯 OVERALL: ${totalBlocked}/${totalTests} blocked (${overallBlockRate}%) - ${overallStatus}`,
  );

  if (overallBlockRate < 100) {
    console.log('\n🔧 UNBLOCKED VECTORS:');
    Object.entries(results).forEach(([category, result]) => {
      const unblocked = result.details.filter((d) => !d.blocked);
      if (unblocked.length > 0) {
        console.log(`\n${category}:`);
        unblocked.forEach((detail) => {
          console.log(`  ❌ ${detail.vector}`);
          if (detail.securityIssues) {
            console.log(`     Issues: ${detail.securityIssues.join(', ')}`);
          }
        });
      }
    });
  }

  console.log('\n🏁 SECURITY VALIDATION COMPLETE');
  return overallBlockRate >= 95;
}

// Run the actual security tests
const results = runActualSecurityTests();
const isSecure = printFinalResults(results);

// Exit with appropriate code
process.exit(isSecure ? 0 : 1);
