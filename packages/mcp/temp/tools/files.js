"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filesWriteFileLines = exports.filesWriteFileContent = exports.filesViewFile = exports.filesTreeDirectory = exports.filesListDirectory = void 0;
const zod_1 = require("zod");
const files_js_1 = require("../files.js");
// Unified sandbox-root resolver
// If MCP_ROOT_PATH isn't set, default to CWD at runtime.
const resolveRoot = () => (0, files_js_1.getMcpRoot)();
const filesListDirectory = () => {
    const shape = {
        rel: zod_1.z.string().default('.'),
        includeHidden: zod_1.z.boolean().optional(),
    };
    const Schema = zod_1.z.object(shape);
    const spec = {
        name: 'files_list_directory',
        description: 'List files and directories within the sandbox root.',
        inputSchema: Schema.shape,
        outputSchema: undefined,
        examples: [
            { args: { rel: 'packages' }, comment: 'List the packages/ folder' },
            { args: { rel: '.', includeHidden: true }, comment: 'Include dotfiles' },
        ],
        stability: 'stable',
        since: '0.1.0',
    };
    const invoke = async (raw) => {
        const args = Schema.parse(raw);
        const { rel, includeHidden } = args;
        const options = typeof includeHidden === 'boolean' ? { includeHidden } : {};
        return (0, files_js_1.listDirectory)(resolveRoot(), rel, options);
    };
    return { spec, invoke };
};
exports.filesListDirectory = filesListDirectory;
const filesTreeDirectory = () => {
    const shape = {
        rel: zod_1.z.string().default('.'),
        includeHidden: zod_1.z.boolean().optional(),
        depth: zod_1.z.number().int().min(1).default(1),
    };
    const Schema = zod_1.z.object(shape);
    const spec = {
        name: 'files_tree_directory',
        description: 'Build a tree-like view of a directory, with optional hidden files and max depth.',
        inputSchema: Schema.shape,
        outputSchema: undefined,
        examples: [
            {
                args: { rel: 'packages/mcp', depth: 2 },
                comment: 'Two-level tree of MCP package',
            },
        ],
        stability: 'stable',
        since: '0.1.0',
    };
    const invoke = async (raw) => {
        const args = Schema.parse(raw);
        const { rel, includeHidden, depth } = args;
        const options = {
            depth,
            ...(typeof includeHidden === 'boolean' ? { includeHidden } : {}),
        };
        return (0, files_js_1.treeDirectory)(resolveRoot(), rel, options);
    };
    return { spec, invoke };
};
exports.filesTreeDirectory = filesTreeDirectory;
const filesViewFile = () => {
    const shape = {
        relOrFuzzy: zod_1.z.string(),
        line: zod_1.z.number().int().min(1).optional(),
        context: zod_1.z.number().int().min(0).optional(),
    };
    const Schema = zod_1.z.object(shape);
    const spec = {
        name: 'files_view_file',
        description: 'View a file by path, with line-context selection.',
        inputSchema: Schema.shape,
        outputSchema: undefined,
        examples: [
            {
                args: { relOrFuzzy: 'packages/mcp/src/index.ts', line: 1, context: 40 },
                comment: 'View file head with context',
            },
        ],
        stability: 'stable',
        since: '0.1.0',
    };
    const invoke = async (raw) => {
        const args = Schema.parse(raw);
        const { relOrFuzzy: rel, line, context } = args;
        return (0, files_js_1.viewFile)(resolveRoot(), rel, line, context);
    };
    return { spec, invoke };
};
exports.filesViewFile = filesViewFile;
const filesWriteFileContent = () => {
    const shape = {
        filePath: zod_1.z.string(),
        content: zod_1.z.string(),
    };
    const Schema = zod_1.z.object(shape);
    const spec = {
        name: 'files_write_content',
        description: 'Write UTF-8 content to a file (creates if not exists).',
        inputSchema: Schema.shape,
        outputSchema: undefined,
        examples: [
            {
                args: { filePath: 'tmp/notes.txt', content: 'hello' },
                comment: 'Create or replace a text file',
            },
        ],
        stability: 'stable',
        since: '0.1.0',
    };
    const invoke = async (raw) => {
        const args = Schema.parse(raw);
        const { filePath, content } = args;
        return (0, files_js_1.writeFileContent)(resolveRoot(), filePath, content);
    };
    return { spec, invoke };
};
exports.filesWriteFileContent = filesWriteFileContent;
const filesWriteFileLines = () => {
    const shape = {
        filePath: zod_1.z.string(),
        lines: zod_1.z.array(zod_1.z.string()),
        startLine: zod_1.z.number().int().min(1),
    };
    const Schema = zod_1.z.object(shape);
    const spec = {
        name: 'files_write_lines',
        description: 'Append or insert lines into a file at startLine (1-based).',
        inputSchema: Schema.shape,
        outputSchema: undefined,
        examples: [
            {
                args: {
                    filePath: 'README.md',
                    lines: ['', '## New Section'],
                    startLine: 10,
                },
                comment: 'Insert section at line 10',
            },
        ],
        stability: 'stable',
        since: '0.1.0',
    };
    const invoke = async (raw) => {
        const args = Schema.parse(raw);
        const { filePath, lines, startLine } = args;
        return (0, files_js_1.writeFileLines)(resolveRoot(), filePath, lines, startLine);
    };
    return { spec, invoke };
};
exports.filesWriteFileLines = filesWriteFileLines;
