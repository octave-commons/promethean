import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import test from 'ava';

import {
  filesListDirectory,
  filesTreeDirectory,
  filesViewFile,
  filesWriteFileContent,
  filesWriteFileLines,
} from '../tools/files.js';
import { filesSearch } from '../tools/search.js';

const createTempDir = (): string => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mcp-files-edge-test-'));
  return tempDir;
};

const cleanupTempDir = (tempDir: string): void => {
  fs.rmSync(tempDir, { recursive: true, force: true });
};

// Create a mock tool context for testing
const createMockContext = () => ({
  env: {},
  fetch: global.fetch,
  now: () => new Date(),
});

// Edge Cases for filesListDirectory
test('filesListDirectory - handles empty directory', async (t) => {
  const tempDir = createTempDir();
  t.teardown(() => cleanupTempDir(tempDir));

  const tool = filesListDirectory(createMockContext());
  const result = await tool.invoke({ rel: tempDir }) as any;

  t.true(result.ok);
  t.true(Array.isArray(result.entries));
  t.is(result.entries.length, 0);
});

test('filesListDirectory - handles directory with only hidden files', async (t) => {
  const tempDir = createTempDir();
  t.teardown(() => cleanupTempDir(tempDir));

  fs.mkdirSync(path.join(tempDir, '.hidden'));
  fs.writeFileSync(path.join(tempDir, '.hidden', 'file.txt'), 'content');

  const tool = filesListDirectory(createMockContext());

  const resultWithHidden = await tool.invoke({ rel: tempDir, includeHidden: true }) as any;
  t.true(resultWithHidden.ok);
  t.true(resultWithHidden.entries.some((e: any) => e.name === '.hidden'));

  const resultWithoutHidden = await tool.invoke({ rel: tempDir, includeHidden: false }) as any;
  t.true(resultWithoutHidden.ok);
  t.false(resultWithoutHidden.entries.some((e: any) => e.name === '.hidden'));
});

test('filesListDirectory - handles very long directory paths', async (t) => {
  const tempDir = createTempDir();
  t.teardown(() => cleanupTempDir(tempDir));

  // Create deeply nested directory structure
  let currentPath = tempDir;
  for (let i = 0; i < 10; i++) {
    currentPath = path.join(currentPath, `level${i}`);
    fs.mkdirSync(currentPath);
  }
  fs.writeFileSync(path.join(currentPath, 'deep.txt'), 'Deep content');

  const tool = filesListDirectory(createMockContext());
  const result = await tool.invoke({ rel: path.relative(tempDir, currentPath) }) as any;

  t.true(result.ok);
  t.true(result.entries.some((e: any) => e.name === 'deep.txt'));
});

// Edge Cases for filesTreeDirectory
test('filesTreeDirectory - handles very deep directory structures', async (t) => {
  const tempDir = createTempDir();
  t.teardown(() => cleanupTempDir(tempDir));

  // Create very deep structure
  let currentPath = tempDir;
  for (let i = 0; i < 100; i++) {
    currentPath = path.join(currentPath, `level${i}`);
    fs.mkdirSync(currentPath);
  }

  const tool = filesTreeDirectory(createMockContext());
  const result = await tool.invoke({ rel: tempDir, depth: 1000 }) as any;

  t.true(result.ok);
  // Should handle deep structure without stack overflow
});

// Edge Cases for filesViewFile
test('filesViewFile - handles binary files gracefully', async (t) => {
  const tempDir = createTempDir();
  t.teardown(() => cleanupTempDir(tempDir));

  // Create a file with binary content
  const binaryContent = Buffer.from([0x00, 0x01, 0x02, 0x03, 0xFF, 0xFE]);
  fs.writeFileSync(path.join(tempDir, 'binary.bin'), binaryContent);

  const tool = filesViewFile(createMockContext());
  const result = await tool.invoke({ relOrFuzzy: path.join(tempDir, 'binary.bin') }) as any;

  t.true(result.ok);
  t.true(typeof result.content === 'string');
});

test('filesViewFile - handles files with very long lines', async (t) => {
  const tempDir = createTempDir();
  t.teardown(() => cleanupTempDir(tempDir));

  // Create file with very long line
  const longLine = 'A'.repeat(100000) + '\nSecond line';
  fs.writeFileSync(path.join(tempDir, 'longline.txt'), longLine);

  const tool = filesViewFile(createMockContext());
  const result = await tool.invoke({ relOrFuzzy: path.join(tempDir, 'longline.txt') }) as any;

  t.true(result.ok);
  t.true(result.content.includes('A'));
});

test('filesViewFile - handles Unicode and special characters', async (t) => {
  const tempDir = createTempDir();
  t.teardown(() => cleanupTempDir(tempDir));

  const unicodeContent = '🚀 Unicode test\n中文测试\nالعربية\nעברית\n🔥 Fire emoji';
  fs.writeFileSync(path.join(tempDir, 'unicode.txt'), unicodeContent);

  const tool = filesViewFile(createMockContext());
  const result = await tool.invoke({ relOrFuzzy: path.join(tempDir, 'unicode.txt') }) as any;

  t.true(result.ok);
  t.true(result.content.includes('🚀'));
  t.true(result.content.includes('中文'));
});

test('filesViewFile - handles very large files', async (t) => {
  const tempDir = createTempDir();
  t.teardown(() => cleanupTempDir(tempDir));

  // Create large file (1MB)
  const largeContent = 'Large file content\n'.repeat(50000);
  fs.writeFileSync(path.join(tempDir, 'large.txt'), largeContent);

  const tool = filesViewFile(createMockContext());
  const result = await tool.invoke({ relOrFuzzy: path.join(tempDir, 'large.txt') }) as any;

  t.true(result.ok);
  t.true(typeof result.totalLines === 'number');
  t.true(result.totalLines > 0);
});

test('filesViewFile - handles files with no line endings', async (t) => {
  const tempDir = createTempDir();
  t.teardown(() => cleanupTempDir(tempDir));

  const noLineEndings = 'This is all one line without any line breaks at all';
  fs.writeFileSync(path.join(tempDir, 'nolinebreaks.txt'), noLineEndings);

  const tool = filesViewFile(createMockContext());
  const result = await tool.invoke({ relOrFuzzy: path.join(tempDir, 'nolinebreaks.txt') }) as any;

  t.true(result.ok);
  t.is(result.totalLines, 1);
  t.true(result.content.includes('This is all one line'));
});

// Edge Cases for filesWriteFileContent
test('filesWriteFileContent - handles very large content', async (t) => {
  const tempDir = createTempDir();
  t.teardown(() => cleanupTempDir(tempDir));

  const largeContent = 'X'.repeat(1_000_000); // 1MB
  const filePath = path.join(tempDir, 'large.txt');

  const tool = filesWriteFileContent(createMockContext());
  const result = await tool.invoke({ filePath, content: largeContent }) as any;

  t.true(result.ok);
  t.true(fs.existsSync(filePath));

  const stats = fs.statSync(filePath);
  t.is(stats.size, largeContent.length);
});

test('filesWriteFileContent - handles content with null bytes', async (t) => {
  const tempDir = createTempDir();
  t.teardown(() => cleanupTempDir(tempDir));

  const contentWithNulls = 'Before\x00After\x00End';
  const filePath = path.join(tempDir, 'nulls.txt');

  const tool = filesWriteFileContent(createMockContext());
  const result = await tool.invoke({ filePath, content: contentWithNulls }) as any;

  t.true(result.ok);
  t.true(fs.existsSync(filePath));

  const readContent = fs.readFileSync(filePath, 'utf8');
  t.true(readContent.includes('Before'));
  t.true(readContent.includes('After'));
});

test('filesWriteFileContent - handles file paths with special characters', async (t) => {
  const tempDir = createTempDir();
  t.teardown(() => cleanupTempDir(tempDir));

  const specialName = 'file with spaces & symbols.txt';
  const filePath = path.join(tempDir, specialName);

  const tool = filesWriteFileContent(createMockContext());
  const result = await tool.invoke({ filePath, content: 'Special content' }) as any;

  t.true(result.ok);
  t.true(fs.existsSync(filePath));

  const readContent = fs.readFileSync(filePath, 'utf8');
  t.is(readContent, 'Special content');
});

// Edge Cases for filesWriteFileLines
test('filesWriteFileLines - handles inserting into very large files', async (t) => {
  const tempDir = createTempDir();
  t.teardown(() => cleanupTempDir(tempDir));

  // Create large file
  const largeContent = 'Line '.repeat(50000);
  fs.writeFileSync(path.join(tempDir, 'large.txt'), largeContent);

  const tool = filesWriteFileLines(createMockContext());
  const result = await tool.invoke({
    filePath: path.join(tempDir, 'large.txt'),
    lines: ['INSERTED LINE'],
    startLine: 25000
  }) as any;

  t.true(result.ok);

  const finalContent = fs.readFileSync(path.join(tempDir, 'large.txt'), 'utf8');
  t.true(finalContent.includes('INSERTED LINE'));
});

test('filesWriteFileLines - handles lines with special characters', async (t) => {
  const tempDir = createTempDir();
  t.teardown(() => cleanupTempDir(tempDir));

  fs.writeFileSync(path.join(tempDir, 'test.txt'), 'Original line');

  const tool = filesWriteFileLines(createMockContext());
  const result = await tool.invoke({
    filePath: path.join(tempDir, 'test.txt'),
    lines: ['Special chars: àáâãäå 🚀', "Quotes: 'single' and \"double\""],
    startLine: 2
  }) as any;

  t.true(result.ok);

  const finalContent = fs.readFileSync(path.join(tempDir, 'test.txt'), 'utf8');
  t.true(finalContent.includes('àáâãäå'));
  t.true(finalContent.includes('🚀'));
  t.true(finalContent.includes('single'));
  t.true(finalContent.includes('double'));
});

// Edge Cases for filesSearch
test('filesSearch - handles empty search patterns', async (t) => {
  const tempDir = createTempDir();
  t.teardown(() => cleanupTempDir(tempDir));

  fs.writeFileSync(path.join(tempDir, 'test.txt'), 'Line 1\nLine 2');

  const tool = filesSearch(createMockContext());

  // Empty string should match everything (grep behavior)
  const result = await tool.invoke({ query: '', rel: tempDir }) as any;

  t.true(result.ok);
  t.true(result.count > 0);
});

test('filesSearch - handles very long search patterns', async (t) => {
  const tempDir = createTempDir();
  t.teardown(() => cleanupTempDir(tempDir));

  fs.writeFileSync(path.join(tempDir, 'test.txt'), 'Short line');

  const tool = filesSearch(createMockContext());
  const longQuery = 'A'.repeat(10000);

  const result = await tool.invoke({ query: longQuery, rel: tempDir }) as any;

  t.true(result.ok);
  t.is(result.count, 0); // Should not find anything
});

test('filesSearch - handles files with mixed line endings', async (t) => {
  const tempDir = createTempDir();
  t.teardown(() => cleanupTempDir(tempDir));

  const mixedContent = 'Line 1\r\nLine 2\nLine 3\r\nLine 4\n';
  fs.writeFileSync(path.join(tempDir, 'mixed.txt'), mixedContent);

  const tool = filesSearch(createMockContext());
  const result = await tool.invoke({ query: 'Line', rel: tempDir }) as any;

  t.true(result.ok);
  t.true(result.count >= 4); // Should find all lines regardless of line ending type
});

test('filesSearch - handles very deep directory structures', async (t) => {
  const tempDir = createTempDir();
  t.teardown(() => cleanupTempDir(tempDir));

  // Create deep structure with files
  let currentPath = tempDir;
  for (let i = 0; i < 50; i++) {
    currentPath = path.join(currentPath, `level${i}`);
    fs.mkdirSync(currentPath);
    fs.writeFileSync(path.join(currentPath, 'file.txt'), `Content at level ${i}`);
  }

  const tool = filesSearch(createMockContext());
  const result = await tool.invoke({
    query: 'Content',
    rel: tempDir,
    maxDepth: 100
  }) as any;

  t.true(result.ok);
  t.true(result.count >= 50); // Should find content at all levels
});

// Performance and Resource Tests
test('files tools handle resource exhaustion gracefully', async (t) => {
  const tempDir = createTempDir();
  t.teardown(() => cleanupTempDir(tempDir));

  // Create many small files
  for (let i = 0; i < 1000; i++) {
    fs.writeFileSync(path.join(tempDir, `file${i}.txt`), `Content ${i}`);
  }

  const listTool = filesListDirectory(createMockContext());
  const result = await listTool.invoke({ rel: tempDir }) as any;

  t.true(result.ok);
  t.true(result.entries.length >= 1000);
});

test('filesSearch handles extreme parameters without crashing', async (t) => {
  const tempDir = createTempDir();
  t.teardown(() => cleanupTempDir(tempDir));

  fs.writeFileSync(path.join(tempDir, 'test.txt'), 'Test content');

  const tool = filesSearch(createMockContext());

  // Test with extreme parameter values
  const extremeResult = await tool.invoke({
    query: 'Test',
    maxResults: 10000,
    maxDepth: 1000,
    maxFileSizeBytes: 100_000_000,
    rel: tempDir
  }) as any;

  t.true(extremeResult.ok);
  t.true(extremeResult.count >= 0);
});