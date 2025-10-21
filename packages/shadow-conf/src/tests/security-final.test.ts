import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'ava';

import { generateEcosystem } from '../ecosystem.js';
import { loadEdnFile } from '../edn.js';

test.serial('SECURITY-001: Path traversal in input directory should be blocked', async (t) => {
  // Try various path traversal attempts
  const traversalAttempts = [
    '../../../etc',
    '..\\..\\windows\\system32',
    '%2e%2e%2fetc',
    '....//....//....//etc',
    '..%252f..%252f..%252fetc',
  ];

  for (const attempt of traversalAttempts) {
    await t.throwsAsync(
      async () => {
        await generateEcosystem({ inputDir: attempt });
      },
      {
        message: /Directory traversal detected|Invalid characters detected|ENOENT/,
      },
    );
  }
});

test.serial('SECURITY-002: Path traversal in output directory should be blocked', async (t) => {
  // Try various path traversal attempts
  const traversalAttempts = [
    '../../../etc',
    '..\\..\\windows\\system32',
    '/etc/passwd',
    'C:\\Windows\\System32',
  ];

  for (const attempt of traversalAttempts) {
    await t.throwsAsync(
      async () => {
        await generateEcosystem({ outputDir: attempt });
      },
      {
        message: /Directory traversal detected|Invalid characters detected|Path boundary violation/,
      },
    );
  }
});

test.serial('SECURITY-003: Code injection in filename should be blocked', async (t) => {
  const tmpDir = await mkdtemp(path.join(os.tmpdir(), 'shadow-conf-security-'));

  const maliciousFilenames = [
    "<script>alert('xss')</script>.mjs",
    "javascript:alert('xss').mjs",
    "'; DROP TABLE apps; --.mjs",
    '$(rm -rf /).mjs',
    '`whoami`.mjs',
    'CON.mjs', // Windows reserved name
    'PRN.mjs', // Windows reserved name
    'AUX.mjs', // Windows reserved name
    'file/with/slashes.mjs',
    'file\\with\\backslashes.mjs',
    'file..with..dots.mjs',
  ];

  for (const filename of maliciousFilenames) {
    await t.throwsAsync(
      async () => {
        await generateEcosystem({
          inputDir: tmpDir,
          fileName: filename,
        });
      },
      {
        message:
          /Script injection detected|Command injection detected|Directory traversal detected|Reserved filename detected|Filename contains invalid characters|Path boundary violation/,
      },
    );
  }
});

test.serial('SECURITY-004: Malicious content in EDN files should be blocked', async (t) => {
  const tmpDir = await mkdtemp(path.join(os.tmpdir(), 'shadow-conf-security-'));
  const ednFile = path.join(tmpDir, 'malicious.edn');

  const maliciousContents = [
    '{:apps [{:name "<script>alert(\'xss\')</script>"}]}',
    '{:apps [{:name "javascript:alert(\'xss\')"}]}',
    '{:apps [{:name "\'; DROP TABLE apps; --"}]}',
    '{:apps [{:name "$(rm -rf /)"}]}',
    '{:apps [{:script "eval(\'malicious code\')"}]}',
  ];

  for (const content of maliciousContents) {
    await writeFile(ednFile, content, 'utf8');

    await t.throwsAsync(
      async () => {
        await loadEdnFile(ednFile);
      },
      {
        message: /Potentially dangerous content detected/,
      },
    );
  }
});

test.serial('SECURITY-005: Path traversal in EDN file paths should be blocked', async (t) => {
  const tmpDir = await mkdtemp(path.join(os.tmpdir(), 'shadow-conf-security-'));
  const ednFile = path.join(tmpDir, 'paths.edn');

  const maliciousPaths = [
    '{:apps [{:name "app" :script "../../../etc/passwd"}]}',
    '{:apps [{:name "app" :cwd "..\\..\\windows\\system32"}]}',
    '{:apps [{:name "app" :env_file "%2e%2e%2fetc%2fpasswd"}]}',
    '{:apps [{:name "app" :watch ["../../../etc", "normal/path"]}]}',
    '{:apps [{:name "app" :env {:CONFIG_PATH "../../../etc"}}]}',
  ];

  for (const content of maliciousPaths) {
    await writeFile(ednFile, content, 'utf8');

    await t.throwsAsync(
      async () => {
        await generateEcosystem({ inputDir: tmpDir });
      },
      {
        message: /Directory traversal detected|Path boundary violation/,
      },
    );
  }
});

test.serial('SECURITY-006: Large files should be rejected', async (t) => {
  const tmpDir = await mkdtemp(path.join(os.tmpdir(), 'shadow-conf-security-'));
  const ednFile = path.join(tmpDir, 'large.edn');

  // Create a large EDN file (> 10MB)
  const largeContent = '{:apps [' + ' '.repeat(11 * 1024 * 1024) + ']}';
  await writeFile(ednFile, largeContent, 'utf8');

  await t.throwsAsync(
    async () => {
      await loadEdnFile(ednFile);
    },
    {
      message: /File too large/,
    },
  );
});

test.serial('SECURITY-007: Non-EDN files should be rejected', async (t) => {
  const tmpDir = await mkdtemp(path.join(os.tmpdir(), 'shadow-conf-security-'));

  const nonEdnFiles = ['malicious.js', 'config.json', 'passwd.txt', 'exploit.php', 'backdoor.py'];

  for (const filename of nonEdnFiles) {
    const filePath = path.join(tmpDir, filename);
    await writeFile(filePath, '{:apps []}', 'utf8');

    await t.throwsAsync(
      async () => {
        await loadEdnFile(filePath);
      },
      {
        message: /Only \.edn files are allowed/,
      },
    );
  }
});

test.serial('SECURITY-008: Deep directory recursion should be limited', async (t) => {
  const tmpDir = await mkdtemp(path.join(os.tmpdir(), 'shadow-conf-security-'));

  // Create a very deep directory structure (> 10 levels)
  let currentDir = tmpDir;
  for (let i = 0; i < 15; i++) {
    currentDir = path.join(currentDir, `level${i}`);
    await mkdir(currentDir, { recursive: true });
  }

  const deepEdnFile = path.join(currentDir, 'deep.edn');
  await writeFile(deepEdnFile, '{:apps [{:name "deep-app"}]}', 'utf8');

  await t.throwsAsync(
    async () => {
      await generateEcosystem({ inputDir: tmpDir });
    },
    {
      message: /Directory depth limit exceeded/,
    },
  );
});

test.serial('SECURITY-009: System directory access should be blocked', async (t) => {
  const systemPaths = [
    '/proc/version',
    '/sys/kernel',
    '/dev/null',
    '/etc/passwd',
    'C:\\Windows\\System32\\config\\SAM',
  ];

  for (const systemPath of systemPaths) {
    await t.throwsAsync(
      async () => {
        await generateEcosystem({ inputDir: systemPath });
      },
      {
        message: /Access to system directories not allowed|Directory traversal detected/,
      },
    );
  }
});

test.serial('SECURITY-010: JSON serialization should be safe', async (t) => {
  const tmpDir = await mkdtemp(path.join(os.tmpdir(), 'shadow-conf-security-'));
  const ednFile = path.join(tmpDir, 'safe-serialization.edn');

  // Content with potentially dangerous strings
  const maliciousContent = '{:apps [{:name "safe-name"}]}';
  await writeFile(ednFile, maliciousContent, 'utf8');

  // This should work without throwing
  const result = await generateEcosystem({
    inputDir: tmpDir,
    outputDir: tmpDir,
  });

  // Check that the generated output file exists
  const { readFile } = await import('node:fs/promises');
  const outputContent = await readFile(result.outputPath, 'utf8');

  // Should contain the expected content
  t.true(outputContent.includes('safe-name'));
});

test.serial('SECURITY-011: Null bytes and control characters should be blocked', async (t) => {
  const tmpDir = await mkdtemp(path.join(os.tmpdir(), 'shadow-conf-security-'));

  const maliciousInputs = [
    'file' + String.fromCharCode(0) + 'name',
    'path\rwith\rcarriage',
    'path\nwith\nnewlines',
    'directory' + String.fromCharCode(0) + 'with' + String.fromCharCode(0) + 'nulls',
  ];

  for (const input of maliciousInputs) {
    await t.throwsAsync(
      async () => {
        await generateEcosystem({
          inputDir: tmpDir,
          fileName: input,
        });
      },
      {
        message: /Invalid characters detected/,
      },
    );
  }
});

test.serial('SECURITY-012: Encoded attacks should be blocked', async (t) => {
  const tmpDir = await mkdtemp(path.join(os.tmpdir(), 'shadow-conf-security-'));

  const encodedAttacks = [
    '%2e%2e%2f', // ../
    '%2E%2E%5c', // ..\
    '%252e%252e%252f', // double-encoded ../
    '..%c0%af..%c0%af', // Unicode bypass attempt
  ];

  for (const attack of encodedAttacks) {
    await t.throwsAsync(
      async () => {
        await generateEcosystem({
          inputDir: tmpDir,
          fileName: attack,
        });
      },
      {
        message: /Encoded directory traversal detected/,
      },
    );
  }
});
