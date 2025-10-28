import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import test from 'ava';
import { z } from 'zod';

import {
  filesListDirectory,
  filesTreeDirectory,
  filesViewFile,
  filesWriteFileContent,
  filesWriteFileLines,
} from '../tools/files.js';
import { filesSearch } from '../tools/search.js';

// Helper to create a temporary directory for testing
const createTempDir = (): string => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mcp-files-test-'));
  return tempDir;
};

// Helper to clean up temporary directory
const cleanupTempDir = (tempDir: string): void => {
  fs.rmSync(tempDir, { recursive: true, force: true });
};

// Create a mock tool context for testing
const createMockContext = (tempDir?: string) => ({
  env: tempDir ? { MCP_ROOT_PATH: tempDir } : {},
  fetch: global.fetch,
  now: () => new Date(),
});

// Helper to create test files
const createTestFiles = (tempDir: string): void => {
  // Create directory structure
  fs.mkdirSync(path.join(tempDir, 'subdir'), { recursive: true });
  fs.mkdirSync(path.join(tempDir, '.hidden'), { recursive: true });

  // Create test files
  fs.writeFileSync(path.join(tempDir, 'test.txt'), 'Hello World\nLine 2\nLine 3');
  fs.writeFileSync(
    path.join(tempDir, 'subdir', 'nested.txt'),
    'Nested file content\nTODO: implement',
  );
  fs.writeFileSync(path.join(tempDir, '.hidden', 'secret.txt'), 'Hidden content');
  fs.writeFileSync(path.join(tempDir, 'search.js'), 'const TODO = "find me";\n// FIXME: later');
  fs.writeFileSync(path.join(tempDir, 'large.txt'), 'A'.repeat(1000));

  // Create empty file
  fs.writeFileSync(path.join(tempDir, 'empty.txt'), '');
};

test('filesListDirectory - lists directory contents', async (t) => {
  const tempDir = createTempDir();
  t.teardown(() => cleanupTempDir(tempDir));
  createTestFiles(tempDir);

  const tool = filesListDirectory(createMockContext());
  const result = (await tool.invoke({ rel: tempDir })) as any;

  t.true(result.ok);
  t.true(Array.isArray(result.entries));
  t.true(result.entries.length > 0);

  const entries = result.entries.map((e: any) => e.name);
  t.true(entries.includes('test.txt'));
  t.true(entries.includes('subdir'));
  t.true(entries.includes('.hidden')); // hidden files included by default
});

test('filesListDirectory - respects includeHidden option', async (t) => {
  const tempDir = createTempDir();
  t.teardown(() => cleanupTempDir(tempDir));
  createTestFiles(tempDir);

  const tool = filesListDirectory(createMockContext());

  const resultWithHidden = (await tool.invoke({ rel: tempDir, includeHidden: true })) as any;
  t.true(resultWithHidden.ok);
  t.true(resultWithHidden.entries.some((e: any) => e.name === '.hidden'));

  const resultWithoutHidden = (await tool.invoke({ rel: tempDir, includeHidden: false })) as any;
  t.true(resultWithoutHidden.ok);
  t.false(resultWithoutHidden.entries.some((e: any) => e.name === '.hidden'));
});

test('filesListDirectory - handles non-existent directory', async (t) => {
  const tool = filesListDirectory(createMockContext());
  const result = (await tool.invoke({ rel: '/non/existent/path' })) as any;

  t.false(result.ok);
  t.true(result.error.includes('ENOENT') || result.error.includes('no such file'));
});

test('filesTreeDirectory - builds directory tree', async (t) => {
  const tempDir = createTempDir();
  t.teardown(() => cleanupTempDir(tempDir));
  createTestFiles(tempDir);

  const tool = filesTreeDirectory(createMockContext());
  const result = (await tool.invoke({ rel: tempDir, depth: 2 })) as any;

  t.true(result.ok);
  t.true(Array.isArray(result.entries));

  // Should have nested structure
  const rootEntries = result.entries.map((e: any) => e.name);
  t.true(rootEntries.includes('subdir'));

  const subdir = result.entries.find((e: any) => e.name === 'subdir');
  t.true(subdir && Array.isArray(subdir.children));
  t.true(subdir.children.some((c: any) => c.name === 'nested.txt'));
});

test('filesTreeDirectory - respects depth limit', async (t) => {
  const tempDir = createTempDir();
  t.teardown(() => cleanupTempDir(tempDir));
  createTestFiles(tempDir);

  const tool = filesTreeDirectory(createMockContext());
  const result = (await tool.invoke({ rel: tempDir, depth: 1 })) as any;

  t.true(result.ok);
  const subdir = result.entries.find((e: any) => e.name === 'subdir');
  t.true(subdir);
  // With depth=1, children should not be expanded
  t.true(!subdir.children || subdir.children.length === 0);
});

test('filesViewFile - views complete file', async (t) => {
  const tempDir = createTempDir();
  t.teardown(() => cleanupTempDir(tempDir));
  createTestFiles(tempDir);

  const tool = filesViewFile(createMockContext());
  const filePath = path.join(tempDir, 'test.txt');
  const result = (await tool.invoke({ relOrFuzzy: filePath })) as any;

  t.true(result.ok);
  t.is(result.path, filePath);
  t.true(result.content.includes('Hello World'));
  t.true(result.totalLines > 0);
});

test('filesViewFile - views file with line context', async (t) => {
  const tempDir = createTempDir();
  t.teardown(() => cleanupTempDir(tempDir));
  createTestFiles(tempDir);

  const tool = filesViewFile(createMockContext());
  const filePath = path.join(tempDir, 'test.txt');
  const result = (await tool.invoke({ relOrFuzzy: filePath, line: 2, context: 1 })) as any;

  t.true(result.ok);
  t.true(result.snippet.includes('Line 2'));
  t.is(result.focusLine, 2);
});

test('filesViewFile - handles non-existent file', async (t) => {
  const tool = filesViewFile(createMockContext());
  const result = (await tool.invoke({ relOrFuzzy: '/non/existent/file.txt' })) as any;

  t.false(result.ok);
  t.true(result.error.includes('ENOENT') || result.error.includes('no such file'));
});

test('filesViewFile - handles empty file', async (t) => {
  const tempDir = createTempDir();
  t.teardown(() => cleanupTempDir(tempDir));
  createTestFiles(tempDir);

  const tool = filesViewFile(createMockContext());
  const filePath = path.join(tempDir, 'empty.txt');
  const result = (await tool.invoke({ relOrFuzzy: filePath })) as any;

  t.true(result.ok);
  t.is(result.totalLines, 0);
  t.is(result.content, '');
});

test('filesWriteFileContent - writes new file', async (t) => {
  const tempDir = createTempDir();
  t.teardown(() => cleanupTempDir(tempDir));

  const tool = filesWriteFileContent(createMockContext());
  const filePath = path.join(tempDir, 'new.txt');
  const content = 'Test content\nLine 2';

  const result = (await tool.invoke({ filePath, content })) as any;

  t.true(result.ok);
  t.true(fs.existsSync(filePath));

  const writtenContent = fs.readFileSync(filePath, 'utf8');
  t.is(writtenContent, content);
});

test('filesWriteFileContent - overwrites existing file', async (t) => {
  const tempDir = createTempDir();
  t.teardown(() => cleanupTempDir(tempDir));
  createTestFiles(tempDir);

  const tool = filesWriteFileContent(createMockContext());
  const filePath = path.join(tempDir, 'test.txt');
  const newContent = 'Completely new content';

  const result = (await tool.invoke({ filePath, content: newContent })) as any;

  t.true(result.ok);

  const writtenContent = fs.readFileSync(filePath, 'utf8');
  t.is(writtenContent, newContent);
});

test('filesWriteFileContent - creates directories if needed', async (t) => {
  const tempDir = createTempDir();
  t.teardown(() => cleanupTempDir(tempDir));

  const tool = filesWriteFileContent(createMockContext());
  const filePath = path.join(tempDir, 'new', 'subdir', 'file.txt');
  const content = 'Content in nested dir';

  const result = (await tool.invoke({ filePath, content })) as any;

  t.true(result.ok);
  t.true(fs.existsSync(filePath));
  t.true(fs.existsSync(path.join(tempDir, 'new', 'subdir')));
});

test('filesWriteFileLines - inserts lines at specific position', async (t) => {
  const tempDir = createTempDir();
  t.teardown(() => cleanupTempDir(tempDir));
  createTestFiles(tempDir);

  const tool = filesWriteFileLines(createMockContext());
  const filePath = path.join(tempDir, 'test.txt');
  const lines = ['Inserted line 1', 'Inserted line 2'];

  const result = (await tool.invoke({ filePath, lines, startLine: 2 })) as any;

  t.true(result.ok);

  const content = fs.readFileSync(filePath, 'utf8');
  t.true(content.includes('Inserted line 1'));
  t.true(content.includes('Inserted line 2'));
});

test('filesWriteFileLines - appends to end of file', async (t) => {
  const tempDir = createTempDir();
  t.teardown(() => cleanupTempDir(tempDir));
  createTestFiles(tempDir);

  const tool = filesWriteFileLines(createMockContext());
  const filePath = path.join(tempDir, 'test.txt');
  const originalContent = fs.readFileSync(filePath, 'utf8');
  const originalLineCount = originalContent.split('\n').length;
  const lines = ['Appended line'];

  const result = (await tool.invoke({ filePath, lines, startLine: originalLineCount + 1 })) as any;

  t.true(result.ok);

  const content = fs.readFileSync(filePath, 'utf8');
  t.true(content.includes('Appended line'));
});

test('filesWriteFileLines - handles invalid startLine', async (t) => {
  const tempDir = createTempDir();
  t.teardown(() => cleanupTempDir(tempDir));
  createTestFiles(tempDir);

  const tool = filesWriteFileLines(createMockContext());
  const filePath = path.join(tempDir, 'test.txt');
  const lines = ['Test line'];

  const result = (await tool.invoke({ filePath, lines, startLine: 0 })) as any;

  t.false(result.ok);
  t.true(result.error.includes('startLine must be >= 1'));
});

test('filesSearch - searches text content', async (t) => {
  const tempDir = createTempDir();
  t.teardown(() => cleanupTempDir(tempDir));
  createTestFiles(tempDir);

  const tool = filesSearch(createMockContext());
  const result = (await tool.invoke({ query: 'Hello', rel: tempDir })) as any;

  t.true(result.ok);
  t.true(result.count > 0);
  t.true(Array.isArray(result.results));

  const match = result.results.find((r: any) => r.path.includes('test.txt'));
  t.true(match);
  t.true(match.snippet.includes('Hello World'));
});

test('filesSearch - searches with regex', async (t) => {
  const tempDir = createTempDir();
  t.teardown(() => cleanupTempDir(tempDir));
  createTestFiles(tempDir);

  const tool = filesSearch(createMockContext());
  const result = (await tool.invoke({ query: 'TODO|FIXME', regex: true, rel: tempDir })) as any;

  t.true(result.ok);
  t.true(result.count >= 2); // Should find both TODO and FIXME

  const todoMatch = result.results.find((r: any) => r.snippet.includes('TODO'));
  const fixmeMatch = result.results.find((r: any) => r.snippet.includes('FIXME'));
  t.true(todoMatch);
  t.true(fixmeMatch);
});

test('filesSearch - respects case sensitivity', async (t) => {
  const tempDir = createTempDir();
  t.teardown(() => cleanupTempDir(tempDir));
  createTestFiles(tempDir);

  const tool = filesSearch(createMockContext());

  // Case sensitive (default)
  const caseSensitiveResult = (await tool.invoke({
    query: 'hello',
    caseSensitive: true,
    rel: tempDir,
  })) as any;
  t.is(caseSensitiveResult.count, 0);

  // Case insensitive
  const caseInsensitiveResult = (await tool.invoke({
    query: 'hello',
    caseSensitive: false,
    rel: tempDir,
  })) as any;
  t.true(caseInsensitiveResult.count > 0);
});

test('filesSearch - respects include/exclude globs', async (t) => {
  const tempDir = createTempDir();
  t.teardown(() => cleanupTempDir(tempDir));
  createTestFiles(tempDir);

  const tool = filesSearch(createMockContext());

  // Include only .txt files
  const includeResult = (await tool.invoke({
    query: 'content',
    includeGlobs: ['**/*.txt'],
    rel: tempDir,
  })) as any;
  t.true(includeResult.count > 0);
  t.true(includeResult.results.every((r: any) => r.path.endsWith('.txt')));

  // Exclude .js files
  const excludeResult = (await tool.invoke({
    query: 'content',
    excludeGlobs: ['**/*.js'],
    rel: tempDir,
  })) as any;
  t.true(excludeResult.count > 0);
  t.true(excludeResult.results.every((r: any) => !r.path.endsWith('.js')));
});

test('filesSearch - respects maxResults limit', async (t) => {
  const tempDir = createTempDir();
  t.teardown(() => cleanupTempDir(tempDir));
  createTestFiles(tempDir);

  const tool = filesSearch(createMockContext());
  const result = (await tool.invoke({ query: 'Line', maxResults: 2, rel: tempDir })) as any;

  t.true(result.ok);
  t.true(result.count <= 2);
});

test('filesSearch - respects maxFileSizeBytes limit', async (t) => {
  const tempDir = createTempDir();
  t.teardown(() => cleanupTempDir(tempDir));
  createTestFiles(tempDir);

  const tool = filesSearch(createMockContext());
  const result = (await tool.invoke({
    query: 'A', // Should find many 'A's in large.txt
    maxFileSizeBytes: 500, // But large.txt is 1000 bytes
    rel: tempDir,
  })) as any;

  t.true(result.ok);
  // Should not find matches in large.txt due to size limit
  t.true(result.results.every((r: any) => !r.path.includes('large.txt')));
});

test('filesSearch - sorts results by path', async (t) => {
  const tempDir = createTempDir();
  t.teardown(() => cleanupTempDir(tempDir));
  createTestFiles(tempDir);

  const tool = filesSearch(createMockContext());
  const result = (await tool.invoke({ query: 'content', sortBy: 'path', rel: tempDir })) as any;

  t.true(result.ok);
  if (result.count > 1) {
    for (let i = 1; i < result.results.length; i++) {
      const prev = result.results[i - 1];
      const curr = result.results[i];
      t.true(prev.path <= curr.path);
    }
  }
});

test('filesSearch - handles non-existent directory', async (t) => {
  const tool = filesSearch(createMockContext());
  const result = (await tool.invoke({ query: 'test', rel: '/non/existent/path' })) as any;

  t.true(result.ok);
  t.is(result.count, 0);
  t.deepEqual(result.results, []);
});

test('filesSearch - handles empty query', async (t) => {
  const tempDir = createTempDir();
  t.teardown(() => cleanupTempDir(tempDir));
  createTestFiles(tempDir);

  const tool = filesSearch(createMockContext());
  const result = (await tool.invoke({ query: '', rel: tempDir })) as any;

  t.true(result.ok);
  // Empty query should match everything (like grep '')
  t.true(result.count > 0);
});

// Integration tests with environment variable
test('files tools work with MCP_ROOT_PATH environment variable', async (t) => {
  const tempDir = createTempDir();
  t.teardown(() => cleanupTempDir(tempDir));
  createTestFiles(tempDir);

  // Set environment variable
  const originalRoot = process.env.MCP_ROOT_PATH;
  process.env.MCP_ROOT_PATH = tempDir;
  t.teardown(() => {
    if (originalRoot) {
      process.env.MCP_ROOT_PATH = originalRoot;
    } else {
      delete process.env.MCP_ROOT_PATH;
    }
  });

  // Test that tools work with relative paths when MCP_ROOT_PATH is set
  const listTool = filesListDirectory(createMockContext());
  const listResult = (await listTool.invoke({ rel: '.' })) as any;
  t.true(listResult.ok);
  t.true(listResult.entries.some((e: any) => e.name === 'test.txt'));

  const viewTool = filesViewFile(createMockContext());
  const viewResult = (await viewTool.invoke({ relOrFuzzy: './test.txt' })) as any;
  t.true(viewResult.ok);
  t.true(viewResult.content.includes('Hello World'));

  const searchTool = filesSearch(createMockContext());
  const searchResult = (await searchTool.invoke({ query: 'Hello', rel: '.' })) as any;
  t.true(searchResult.ok);
  t.true(searchResult.count > 0);
});

// Error handling tests
test('files tools validate input schemas', async (t) => {
  const listTool = filesListDirectory(createMockContext());

  // Invalid input should throw Zod validation error
  await t.throwsAsync(
    async () => await listTool.invoke({ rel: 123 }), // number instead of string
    { instanceOf: z.ZodError },
  );
});

test('filesTreeDirectory validates depth', async (t) => {
  const tool = filesTreeDirectory(createMockContext());

  // Invalid depth should throw
  await t.throwsAsync(
    async () => await tool.invoke({ rel: '.', depth: 0 }), // depth must be >= 1
    { instanceOf: z.ZodError },
  );

  await t.throwsAsync(
    async () => await tool.invoke({ rel: '.', depth: -1 }), // negative depth
    { instanceOf: z.ZodError },
  );
});

test('filesViewFile validates line numbers', async (t) => {
  const tool = filesViewFile(createMockContext());

  // Invalid line should throw
  await t.throwsAsync(
    async () => await tool.invoke({ relOrFuzzy: 'test.txt', line: 0 }), // line must be >= 1
    { instanceOf: z.ZodError },
  );

  await t.throwsAsync(
    async () => await tool.invoke({ relOrFuzzy: 'test.txt', line: -5 }), // negative line
    { instanceOf: z.ZodError },
  );
});

test('filesWriteFileLines validates parameters', async (t) => {
  const tool = filesWriteFileLines(createMockContext());

  // Empty lines array should throw
  await t.throwsAsync(
    async () => await tool.invoke({ filePath: 'test.txt', lines: [], startLine: 1 }),
    { instanceOf: z.ZodError },
  );

  // Invalid startLine should throw
  await t.throwsAsync(
    async () => await tool.invoke({ filePath: 'test.txt', lines: ['test'], startLine: 0 }),
    { instanceOf: z.ZodError },
  );
});

test('filesSearch validates search parameters', async (t) => {
  const tool = filesSearch(createMockContext());

  // Invalid maxDepth should throw
  await t.throwsAsync(
    async () => await tool.invoke({ query: 'test', maxDepth: 0 }), // must be >= 1
    { instanceOf: z.ZodError },
  );

  // Invalid maxResults should throw
  await t.throwsAsync(
    async () => await tool.invoke({ query: 'test', maxResults: 0 }), // must be >= 1
    { instanceOf: z.ZodError },
  );

  // Invalid maxFileSizeBytes should throw
  await t.throwsAsync(
    async () => await tool.invoke({ query: 'test', maxFileSizeBytes: 0 }), // must be >= 1
    { instanceOf: z.ZodError },
  );
});
