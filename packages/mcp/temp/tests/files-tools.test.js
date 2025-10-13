"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = __importDefault(require("node:fs"));
const node_os_1 = __importDefault(require("node:os"));
const node_path_1 = __importDefault(require("node:path"));
const ava_1 = __importDefault(require("ava"));
const zod_1 = require("zod");
const files_js_1 = require("../tools/files.js");
const search_js_1 = require("../tools/search.js");
// Helper to create a temporary directory for testing
const createTempDir = () => {
    const tempDir = node_fs_1.default.mkdtempSync(node_path_1.default.join(node_os_1.default.tmpdir(), 'mcp-files-test-'));
    return tempDir;
};
// Helper to clean up temporary directory
const cleanupTempDir = (tempDir) => {
    node_fs_1.default.rmSync(tempDir, { recursive: true, force: true });
};
// Create a mock tool context for testing
const createMockContext = () => ({
    env: {},
    fetch: global.fetch,
    now: () => new Date(),
});
// Helper to create test files
const createTestFiles = (tempDir) => {
    // Create directory structure
    node_fs_1.default.mkdirSync(node_path_1.default.join(tempDir, 'subdir'), { recursive: true });
    node_fs_1.default.mkdirSync(node_path_1.default.join(tempDir, '.hidden'), { recursive: true });
    // Create test files
    node_fs_1.default.writeFileSync(node_path_1.default.join(tempDir, 'test.txt'), 'Hello World\nLine 2\nLine 3');
    node_fs_1.default.writeFileSync(node_path_1.default.join(tempDir, 'subdir', 'nested.txt'), 'Nested file content\nTODO: implement');
    node_fs_1.default.writeFileSync(node_path_1.default.join(tempDir, '.hidden', 'secret.txt'), 'Hidden content');
    node_fs_1.default.writeFileSync(node_path_1.default.join(tempDir, 'search.js'), 'const TODO = "find me";\n// FIXME: later');
    node_fs_1.default.writeFileSync(node_path_1.default.join(tempDir, 'large.txt'), 'A'.repeat(1000));
    // Create empty file
    node_fs_1.default.writeFileSync(node_path_1.default.join(tempDir, 'empty.txt'), '');
};
(0, ava_1.default)('filesListDirectory - lists directory contents', async (t) => {
    const tempDir = createTempDir();
    t.teardown(() => cleanupTempDir(tempDir));
    createTestFiles(tempDir);
    const tool = (0, files_js_1.filesListDirectory)(createMockContext());
    const result = await tool.invoke({ rel: tempDir });
    t.true(result.ok);
    t.true(Array.isArray(result.entries));
    t.true(result.entries.length > 0);
    const entries = result.entries.map((e) => e.name);
    t.true(entries.includes('test.txt'));
    t.true(entries.includes('subdir'));
    t.true(entries.includes('.hidden')); // hidden files included by default
});
(0, ava_1.default)('filesListDirectory - respects includeHidden option', async (t) => {
    const tempDir = createTempDir();
    t.teardown(() => cleanupTempDir(tempDir));
    createTestFiles(tempDir);
    const tool = (0, files_js_1.filesListDirectory)(createMockContext());
    const resultWithHidden = await tool.invoke({ rel: tempDir, includeHidden: true });
    t.true(resultWithHidden.ok);
    t.true(resultWithHidden.entries.some((e) => e.name === '.hidden'));
    const resultWithoutHidden = await tool.invoke({ rel: tempDir, includeHidden: false });
    t.true(resultWithoutHidden.ok);
    t.false(resultWithoutHidden.entries.some((e) => e.name === '.hidden'));
});
(0, ava_1.default)('filesListDirectory - handles non-existent directory', async (t) => {
    const tool = (0, files_js_1.filesListDirectory)(createMockContext());
    const result = await tool.invoke({ rel: '/non/existent/path' });
    t.false(result.ok);
    t.true(result.error.includes('ENOENT') || result.error.includes('no such file'));
});
(0, ava_1.default)('filesTreeDirectory - builds directory tree', async (t) => {
    const tempDir = createTempDir();
    t.teardown(() => cleanupTempDir(tempDir));
    createTestFiles(tempDir);
    const tool = (0, files_js_1.filesTreeDirectory)(createMockContext());
    const result = await tool.invoke({ rel: tempDir, depth: 2 });
    t.true(result.ok);
    t.true(Array.isArray(result.entries));
    // Should have nested structure
    const rootEntries = result.entries.map((e) => e.name);
    t.true(rootEntries.includes('subdir'));
    const subdir = result.entries.find((e) => e.name === 'subdir');
    t.true(subdir && Array.isArray(subdir.children));
    t.true(subdir.children.some((c) => c.name === 'nested.txt'));
});
(0, ava_1.default)('filesTreeDirectory - respects depth limit', async (t) => {
    const tempDir = createTempDir();
    t.teardown(() => cleanupTempDir(tempDir));
    createTestFiles(tempDir);
    const tool = (0, files_js_1.filesTreeDirectory)(createMockContext());
    const result = await tool.invoke({ rel: tempDir, depth: 1 });
    t.true(result.ok);
    const subdir = result.entries.find((e) => e.name === 'subdir');
    t.true(subdir);
    // With depth=1, children should not be expanded
    t.true(!subdir.children || subdir.children.length === 0);
});
(0, ava_1.default)('filesViewFile - views complete file', async (t) => {
    const tempDir = createTempDir();
    t.teardown(() => cleanupTempDir(tempDir));
    createTestFiles(tempDir);
    const tool = (0, files_js_1.filesViewFile)(createMockContext());
    const filePath = node_path_1.default.join(tempDir, 'test.txt');
    const result = await tool.invoke({ relOrFuzzy: filePath });
    t.true(result.ok);
    t.is(result.path, filePath);
    t.true(result.content.includes('Hello World'));
    t.true(result.totalLines > 0);
});
(0, ava_1.default)('filesViewFile - views file with line context', async (t) => {
    const tempDir = createTempDir();
    t.teardown(() => cleanupTempDir(tempDir));
    createTestFiles(tempDir);
    const tool = (0, files_js_1.filesViewFile)(createMockContext());
    const filePath = node_path_1.default.join(tempDir, 'test.txt');
    const result = await tool.invoke({ relOrFuzzy: filePath, line: 2, context: 1 });
    t.true(result.ok);
    t.true(result.snippet.includes('Line 2'));
    t.is(result.focusLine, 2);
});
(0, ava_1.default)('filesViewFile - handles non-existent file', async (t) => {
    const tool = (0, files_js_1.filesViewFile)(createMockContext());
    const result = await tool.invoke({ relOrFuzzy: '/non/existent/file.txt' });
    t.false(result.ok);
    t.true(result.error.includes('ENOENT') || result.error.includes('no such file'));
});
(0, ava_1.default)('filesViewFile - handles empty file', async (t) => {
    const tempDir = createTempDir();
    t.teardown(() => cleanupTempDir(tempDir));
    createTestFiles(tempDir);
    const tool = (0, files_js_1.filesViewFile)(createMockContext());
    const filePath = node_path_1.default.join(tempDir, 'empty.txt');
    const result = await tool.invoke({ relOrFuzzy: filePath });
    t.true(result.ok);
    t.is(result.totalLines, 0);
    t.is(result.content, '');
});
(0, ava_1.default)('filesWriteFileContent - writes new file', async (t) => {
    const tempDir = createTempDir();
    t.teardown(() => cleanupTempDir(tempDir));
    const tool = (0, files_js_1.filesWriteFileContent)(createMockContext());
    const filePath = node_path_1.default.join(tempDir, 'new.txt');
    const content = 'Test content\nLine 2';
    const result = await tool.invoke({ filePath, content });
    t.true(result.ok);
    t.true(node_fs_1.default.existsSync(filePath));
    const writtenContent = node_fs_1.default.readFileSync(filePath, 'utf8');
    t.is(writtenContent, content);
});
(0, ava_1.default)('filesWriteFileContent - overwrites existing file', async (t) => {
    const tempDir = createTempDir();
    t.teardown(() => cleanupTempDir(tempDir));
    createTestFiles(tempDir);
    const tool = (0, files_js_1.filesWriteFileContent)(createMockContext());
    const filePath = node_path_1.default.join(tempDir, 'test.txt');
    const newContent = 'Completely new content';
    const result = await tool.invoke({ filePath, content: newContent });
    t.true(result.ok);
    const writtenContent = node_fs_1.default.readFileSync(filePath, 'utf8');
    t.is(writtenContent, newContent);
});
(0, ava_1.default)('filesWriteFileContent - creates directories if needed', async (t) => {
    const tempDir = createTempDir();
    t.teardown(() => cleanupTempDir(tempDir));
    const tool = (0, files_js_1.filesWriteFileContent)(createMockContext());
    const filePath = node_path_1.default.join(tempDir, 'new', 'subdir', 'file.txt');
    const content = 'Content in nested dir';
    const result = await tool.invoke({ filePath, content });
    t.true(result.ok);
    t.true(node_fs_1.default.existsSync(filePath));
    t.true(node_fs_1.default.existsSync(node_path_1.default.join(tempDir, 'new', 'subdir')));
});
(0, ava_1.default)('filesWriteFileLines - inserts lines at specific position', async (t) => {
    const tempDir = createTempDir();
    t.teardown(() => cleanupTempDir(tempDir));
    createTestFiles(tempDir);
    const tool = (0, files_js_1.filesWriteFileLines)(createMockContext());
    const filePath = node_path_1.default.join(tempDir, 'test.txt');
    const lines = ['Inserted line 1', 'Inserted line 2'];
    const result = await tool.invoke({ filePath, lines, startLine: 2 });
    t.true(result.ok);
    const content = node_fs_1.default.readFileSync(filePath, 'utf8');
    t.true(content.includes('Inserted line 1'));
    t.true(content.includes('Inserted line 2'));
});
(0, ava_1.default)('filesWriteFileLines - appends to end of file', async (t) => {
    const tempDir = createTempDir();
    t.teardown(() => cleanupTempDir(tempDir));
    createTestFiles(tempDir);
    const tool = (0, files_js_1.filesWriteFileLines)(createMockContext());
    const filePath = node_path_1.default.join(tempDir, 'test.txt');
    const originalContent = node_fs_1.default.readFileSync(filePath, 'utf8');
    const originalLineCount = originalContent.split('\n').length;
    const lines = ['Appended line'];
    const result = await tool.invoke({ filePath, lines, startLine: originalLineCount + 1 });
    t.true(result.ok);
    const content = node_fs_1.default.readFileSync(filePath, 'utf8');
    t.true(content.includes('Appended line'));
});
(0, ava_1.default)('filesWriteFileLines - handles invalid startLine', async (t) => {
    const tempDir = createTempDir();
    t.teardown(() => cleanupTempDir(tempDir));
    createTestFiles(tempDir);
    const tool = (0, files_js_1.filesWriteFileLines)(createMockContext());
    const filePath = node_path_1.default.join(tempDir, 'test.txt');
    const lines = ['Test line'];
    const result = await tool.invoke({ filePath, lines, startLine: 0 });
    t.false(result.ok);
    t.true(result.error.includes('startLine must be >= 1'));
});
(0, ava_1.default)('filesSearch - searches text content', async (t) => {
    const tempDir = createTempDir();
    t.teardown(() => cleanupTempDir(tempDir));
    createTestFiles(tempDir);
    const tool = (0, search_js_1.filesSearch)(createMockContext());
    const result = await tool.invoke({ query: 'Hello', rel: tempDir });
    t.true(result.ok);
    t.true(result.count > 0);
    t.true(Array.isArray(result.results));
    const match = result.results.find((r) => r.path.includes('test.txt'));
    t.true(match);
    t.true(match.snippet.includes('Hello World'));
});
(0, ava_1.default)('filesSearch - searches with regex', async (t) => {
    const tempDir = createTempDir();
    t.teardown(() => cleanupTempDir(tempDir));
    createTestFiles(tempDir);
    const tool = (0, search_js_1.filesSearch)(createMockContext());
    const result = await tool.invoke({ query: 'TODO|FIXME', regex: true, rel: tempDir });
    t.true(result.ok);
    t.true(result.count >= 2); // Should find both TODO and FIXME
    const todoMatch = result.results.find((r) => r.snippet.includes('TODO'));
    const fixmeMatch = result.results.find((r) => r.snippet.includes('FIXME'));
    t.true(todoMatch);
    t.true(fixmeMatch);
});
(0, ava_1.default)('filesSearch - respects case sensitivity', async (t) => {
    const tempDir = createTempDir();
    t.teardown(() => cleanupTempDir(tempDir));
    createTestFiles(tempDir);
    const tool = (0, search_js_1.filesSearch)(createMockContext());
    // Case sensitive (default)
    const caseSensitiveResult = await tool.invoke({ query: 'hello', caseSensitive: true, rel: tempDir });
    t.is(caseSensitiveResult.count, 0);
    // Case insensitive
    const caseInsensitiveResult = await tool.invoke({ query: 'hello', caseSensitive: false, rel: tempDir });
    t.true(caseInsensitiveResult.count > 0);
});
(0, ava_1.default)('filesSearch - respects include/exclude globs', async (t) => {
    const tempDir = createTempDir();
    t.teardown(() => cleanupTempDir(tempDir));
    createTestFiles(tempDir);
    const tool = (0, search_js_1.filesSearch)(createMockContext());
    // Include only .txt files
    const includeResult = await tool.invoke({
        query: 'content',
        includeGlobs: ['**/*.txt'],
        rel: tempDir
    });
    t.true(includeResult.count > 0);
    t.true(includeResult.results.every((r) => r.path.endsWith('.txt')));
    // Exclude .js files
    const excludeResult = await tool.invoke({
        query: 'content',
        excludeGlobs: ['**/*.js'],
        rel: tempDir
    });
    t.true(excludeResult.count > 0);
    t.true(excludeResult.results.every((r) => !r.path.endsWith('.js')));
});
(0, ava_1.default)('filesSearch - respects maxResults limit', async (t) => {
    const tempDir = createTempDir();
    t.teardown(() => cleanupTempDir(tempDir));
    createTestFiles(tempDir);
    const tool = (0, search_js_1.filesSearch)(createMockContext());
    const result = await tool.invoke({ query: 'Line', maxResults: 2, rel: tempDir });
    t.true(result.ok);
    t.true(result.count <= 2);
});
(0, ava_1.default)('filesSearch - respects maxFileSizeBytes limit', async (t) => {
    const tempDir = createTempDir();
    t.teardown(() => cleanupTempDir(tempDir));
    createTestFiles(tempDir);
    const tool = (0, search_js_1.filesSearch)(createMockContext());
    const result = await tool.invoke({
        query: 'A', // Should find many 'A's in large.txt
        maxFileSizeBytes: 500, // But large.txt is 1000 bytes
        rel: tempDir
    });
    t.true(result.ok);
    // Should not find matches in large.txt due to size limit
    t.true(result.results.every((r) => !r.path.includes('large.txt')));
});
(0, ava_1.default)('filesSearch - sorts results by path', async (t) => {
    const tempDir = createTempDir();
    t.teardown(() => cleanupTempDir(tempDir));
    createTestFiles(tempDir);
    const tool = (0, search_js_1.filesSearch)(createMockContext());
    const result = await tool.invoke({ query: 'content', sortBy: 'path', rel: tempDir });
    t.true(result.ok);
    if (result.count > 1) {
        for (let i = 1; i < result.results.length; i++) {
            const prev = result.results[i - 1];
            const curr = result.results[i];
            t.true(prev.path <= curr.path);
        }
    }
});
(0, ava_1.default)('filesSearch - handles non-existent directory', async (t) => {
    const tool = (0, search_js_1.filesSearch)(createMockContext());
    const result = await tool.invoke({ query: 'test', rel: '/non/existent/path' });
    t.true(result.ok);
    t.is(result.count, 0);
    t.deepEqual(result.results, []);
});
(0, ava_1.default)('filesSearch - handles empty query', async (t) => {
    const tempDir = createTempDir();
    t.teardown(() => cleanupTempDir(tempDir));
    createTestFiles(tempDir);
    const tool = (0, search_js_1.filesSearch)(createMockContext());
    const result = await tool.invoke({ query: '', rel: tempDir });
    t.true(result.ok);
    // Empty query should match everything (like grep '')
    t.true(result.count > 0);
});
// Integration tests with environment variable
(0, ava_1.default)('files tools work with MCP_ROOT_PATH environment variable', async (t) => {
    const tempDir = createTempDir();
    t.teardown(() => cleanupTempDir(tempDir));
    createTestFiles(tempDir);
    // Set environment variable
    const originalRoot = process.env.MCP_ROOT_PATH;
    process.env.MCP_ROOT_PATH = tempDir;
    t.teardown(() => {
        if (originalRoot) {
            process.env.MCP_ROOT_PATH = originalRoot;
        }
        else {
            delete process.env.MCP_ROOT_PATH;
        }
    });
    // Test that tools work with relative paths when MCP_ROOT_PATH is set
    const listTool = (0, files_js_1.filesListDirectory)(createMockContext());
    const listResult = await listTool.invoke({ rel: '.' });
    t.true(listResult.ok);
    t.true(listResult.entries.some((e) => e.name === 'test.txt'));
    const viewTool = (0, files_js_1.filesViewFile)(createMockContext());
    const viewResult = await viewTool.invoke({ relOrFuzzy: './test.txt' });
    t.true(viewResult.ok);
    t.true(viewResult.content.includes('Hello World'));
    const searchTool = (0, search_js_1.filesSearch)(createMockContext());
    const searchResult = await searchTool.invoke({ query: 'Hello', rel: '.' });
    t.true(searchResult.ok);
    t.true(searchResult.count > 0);
});
// Error handling tests
(0, ava_1.default)('files tools validate input schemas', async (t) => {
    const listTool = (0, files_js_1.filesListDirectory)(createMockContext());
    // Invalid input should throw Zod validation error
    await t.throwsAsync(async () => await listTool.invoke({ rel: 123 }), // number instead of string
    { instanceOf: zod_1.z.ZodError });
});
(0, ava_1.default)('filesTreeDirectory validates depth', async (t) => {
    const tool = (0, files_js_1.filesTreeDirectory)(createMockContext());
    // Invalid depth should throw
    await t.throwsAsync(async () => await tool.invoke({ rel: '.', depth: 0 }), // depth must be >= 1
    { instanceOf: zod_1.z.ZodError });
    await t.throwsAsync(async () => await tool.invoke({ rel: '.', depth: -1 }), // negative depth
    { instanceOf: zod_1.z.ZodError });
});
(0, ava_1.default)('filesViewFile validates line numbers', async (t) => {
    const tool = (0, files_js_1.filesViewFile)(createMockContext());
    // Invalid line should throw
    await t.throwsAsync(async () => await tool.invoke({ relOrFuzzy: 'test.txt', line: 0 }), // line must be >= 1
    { instanceOf: zod_1.z.ZodError });
    await t.throwsAsync(async () => await tool.invoke({ relOrFuzzy: 'test.txt', line: -5 }), // negative line
    { instanceOf: zod_1.z.ZodError });
});
(0, ava_1.default)('filesWriteFileLines validates parameters', async (t) => {
    const tool = (0, files_js_1.filesWriteFileLines)(createMockContext());
    // Empty lines array should throw
    await t.throwsAsync(async () => await tool.invoke({ filePath: 'test.txt', lines: [], startLine: 1 }), { instanceOf: zod_1.z.ZodError });
    // Invalid startLine should throw
    await t.throwsAsync(async () => await tool.invoke({ filePath: 'test.txt', lines: ['test'], startLine: 0 }), { instanceOf: zod_1.z.ZodError });
});
(0, ava_1.default)('filesSearch validates search parameters', async (t) => {
    const tool = (0, search_js_1.filesSearch)(createMockContext());
    // Invalid maxDepth should throw
    await t.throwsAsync(async () => await tool.invoke({ query: 'test', maxDepth: 0 }), // must be >= 1
    { instanceOf: zod_1.z.ZodError });
    // Invalid maxResults should throw
    await t.throwsAsync(async () => await tool.invoke({ query: 'test', maxResults: 0 }), // must be >= 1
    { instanceOf: zod_1.z.ZodError });
    // Invalid maxFileSizeBytes should throw
    await t.throwsAsync(async () => await tool.invoke({ query: 'test', maxFileSizeBytes: 0 }), // must be >= 1
    { instanceOf: zod_1.z.ZodError });
});
