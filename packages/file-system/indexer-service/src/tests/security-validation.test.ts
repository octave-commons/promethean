/**
 * CRITICAL SECURITY TESTS - P0 FAST-TRACK VALIDATION
 * Tests for security vulnerabilities identified and fixed
 */

import test from 'ava';
import {
  validatePathSecurity,
  validateSinglePath,
  validatePathArray,
} from '../validation/validators.js';

test.serial(
  'PATH-TRAVERSAL-001: Unicode bypass protection - should block %2e%2e encoded traversal',
  (t) => {
    const result = validatePathSecurity('%2e%2e/secret');
    t.false(result.valid);
    t.true(result.securityIssues?.includes('Path traversal attempt detected') || false);
    t.is(result.riskLevel, 'critical');
  },
);

test.serial('PATH-TRAVERSAL-001: should block %2e%2e%2f encoded traversal', (t) => {
  const result = validatePathSecurity('%2e%2e%2fetc/passwd');
  t.false(result.valid);
  t.true(result.securityIssues?.includes('Path traversal attempt detected') || false);
});

test.serial('PATH-TRAVERSAL-001: should block mixed case encoded traversal', (t) => {
  const result = validatePathSecurity('%2E%2E%2Fsecret');
  t.false(result.valid);
});

test.serial('PATH-TRAVERSAL-001: should block unicode homograph attacks', (t) => {
  // Test various unicode homograph characters that can normalize to traversal
  const homographAttacks = [
    '‥/secret', // Unicode two-dot leader
    '﹒/secret', // Unicode small full stop
    '．．/secret', // Full-width dots
    '．‥/secret', // Mixed unicode dots
  ];

  homographAttacks.forEach((attack) => {
    const result = validatePathSecurity(attack);
    t.false(result.valid, `Should block homograph attack: ${attack}`);
  });
});

test.serial('PATH-TRAVERSAL-001: should allow legitimate relative paths', (t) => {
  const result = validatePathSecurity('docs/readme.md');
  t.true(result.valid);
  t.is(result.sanitized, 'docs/readme.md');
});

test.serial('TILDE-EXPANSION-002: should block tilde expansion to home directory', (t) => {
  const result = validatePathSecurity('~/.ssh/authorized_keys');
  t.false(result.valid);
  t.true(result.securityIssues?.includes('Unix path security violation') || false);
});

test.serial('TILDE-EXPANSION-002: should block user-specific tilde expansion', (t) => {
  const result = validatePathSecurity('~root/.bashrc');
  t.false(result.valid);
});

test.serial('TILDE-EXPANSION-002: should block tilde with subdirectory', (t) => {
  const result = validatePathSecurity('~/Documents/secret.txt');
  t.false(result.valid);
});

test.serial(
  'TILDE-EXPANSION-002: should allow paths starting with tilde but not expansion',
  (t) => {
    const result = validatePathSecurity('file~backup.txt');
    t.true(result.valid);
  },
);

test.serial(
  'TILDE-EXPANSION-002: should allow legitimate relative paths with tildes in filename',
  (t) => {
    const result = validatePathSecurity('docs/my~file.txt');
    t.true(result.valid);
  },
);

test.serial('Comprehensive security: should block dangerous system paths', (t) => {
  const dangerousPaths = [
    '/etc/passwd',
    '/etc/shadow',
    '/proc/version',
    '/sys/kernel',
    '/root/.ssh',
    '/var/log/auth.log',
  ];

  dangerousPaths.forEach((path) => {
    const result = validatePathSecurity(path);
    t.false(result.valid);
    t.is(result.riskLevel, 'high');
  });
});

test.serial('Comprehensive security: should block Windows-specific attacks on Unix', (t) => {
  const windowsAttacks = ['C:\\Windows\\System32', '\\\\server\\share', 'CON', 'PRN', 'AUX'];

  windowsAttacks.forEach((path) => {
    const result = validatePathSecurity(path);
    t.false(result.valid);
  });
});

test.serial('Comprehensive security: should block glob pattern attacks', (t) => {
  const globAttacks = ['**/../etc/passwd', '../**', '{../etc/passwd}', '..}/etc/passwd'];

  globAttacks.forEach((pattern) => {
    const result = validatePathSecurity(pattern);
    t.false(result.valid);
  });
});

test.serial('Comprehensive security: should block dangerous characters', (t) => {
  const dangerousInputs = [
    'file<script>alert("xss")</script>',
    'command; rm -rf /',
    'file|cat /etc/passwd',
    'file`whoami`',
    'file$(id)',
    'file\r\nheader: injected',
  ];

  dangerousInputs.forEach((input) => {
    const result = validatePathSecurity(input);
    t.false(result.valid);
  });
});

test.serial('validateSinglePath integration: should reject malicious paths', (t) => {
  const maliciousPaths = [
    '%2e%2e/secret',
    '~/.ssh/authorized_keys',
    '../../../etc/passwd',
    '/etc/passwd',
  ];

  maliciousPaths.forEach((path) => {
    const result = validateSinglePath(path);
    t.false(result.success);
    if (!result.success) {
      t.true(result.error?.message.includes('Security validation failed') || false);
    }
  });
});

test.serial('validateSinglePath integration: should accept safe paths', (t) => {
  const safePaths = [
    'docs/readme.md',
    'src/components/Button.tsx',
    'config/app.json',
    'tests/unit/security.test.ts',
  ];

  safePaths.forEach((path) => {
    const result = validateSinglePath(path);
    t.true(result.success);
    if (result.success) {
      t.is(result.data, path);
    }
  });
});

test.serial(
  'validatePathArray integration: should reject arrays containing malicious paths',
  (t) => {
    const maliciousArrays = [
      ['docs/readme.md', '%2e%2e/secret'],
      ['~/.ssh/authorized_keys', 'config/app.json'],
      ['/etc/passwd', '/proc/version'],
    ];

    maliciousArrays.forEach((paths) => {
      const result = validatePathArray(paths);
      t.false(result.valid);
    });
  },
);

test.serial('validatePathArray integration: should accept arrays of safe paths', (t) => {
  const safeArrays = [
    ['docs/readme.md', 'src/index.ts'],
    ['config/app.json', 'tests/unit/test.test.ts'],
    ['package.json', 'README.md'],
  ];

  safeArrays.forEach((paths) => {
    const result = validatePathArray(paths);
    t.true(result.valid);
  });
});

test.serial('SECURITY LOGGING VALIDATION: should identify risk levels correctly', (t) => {
  const criticalRisk = validatePathSecurity('%2e%2e/etc/passwd');
  t.is(criticalRisk.riskLevel, 'critical');

  const highRisk = validatePathSecurity('/etc/passwd');
  t.is(highRisk.riskLevel, 'high');

  const mediumRisk = validatePathSecurity('**/../file');
  t.is(mediumRisk.riskLevel, 'medium');

  const lowRisk = validatePathSecurity('docs/readme.md');
  t.is(lowRisk.riskLevel, 'low');
});
