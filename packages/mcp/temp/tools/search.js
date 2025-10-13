"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.filesSearch = void 0;
const zod_1 = require("zod");
const promises_1 = __importDefault(require("node:fs/promises"));
const node_path_1 = __importDefault(require("node:path"));
const minimatch_1 = require("minimatch");
const files_js_1 = require("../files.js");
const resolveRoot = () => (0, files_js_1.getMcpRoot)();
const textFile = (name) => {
    const ext = node_path_1.default.extname(name).toLowerCase();
    // very rough heuristic; users can still search anything but we'll skip obvious binaries by size+ext.
    return ![
        '.png',
        '.jpg',
        '.jpeg',
        '.gif',
        '.webp',
        '.pdf',
        '.zip',
        '.gz',
        '.tar',
        '.jar',
        '.exe',
        '.wasm',
    ].includes(ext);
};
const walk = async (abs, opts, level = 1) => {
    const dirents = await promises_1.default.readdir(abs, { withFileTypes: true });
    const out = [];
    for (const d of dirents) {
        if (!opts.includeHidden && d.name.startsWith('.'))
            continue;
        const child = node_path_1.default.join(abs, d.name);
        if (d.isDirectory()) {
            if (level < opts.maxDepth) {
                out.push(...(await walk(child, opts, level + 1)));
            }
            continue;
        }
        out.push(child);
    }
    return out;
};
const filesSearch = () => {
    const shape = {
        query: zod_1.z.string().describe('string or regex pattern'),
        regex: zod_1.z.boolean().default(false),
        caseSensitive: zod_1.z.boolean().default(false),
        includeHidden: zod_1.z.boolean().default(false),
        maxDepth: zod_1.z.number().int().min(1).default(25),
        maxFileSizeBytes: zod_1.z.number().int().min(1).default(1000000),
        maxResults: zod_1.z.number().int().min(1).default(200),
        rel: zod_1.z.string().default('.'),
        includeGlobs: zod_1.z
            .array(zod_1.z.string())
            .default(['**/*'])
            .describe('only consider files matching these globs (minimatch)'),
        excludeGlobs: zod_1.z
            .array(zod_1.z.string())
            .default(['**/node_modules/**', '**/.git/**'])
            .describe('skip files/dirs matching these globs (minimatch)'),
        sortBy: zod_1.z
            .enum(['path', 'firstMatchLine'])
            .default('path')
            .describe('deterministic ordering for results'),
    };
    const Schema = zod_1.z.object(shape);
    const spec = {
        name: 'files_search',
        description: 'Search file contents under a directory and return matching line snippets.',
        inputSchema: Schema.shape,
        outputSchema: undefined,
        examples: [
            {
                args: { query: 'TODO|FIXME', regex: true, rel: 'packages' },
                comment: 'Find TODO/FIXME comments in the monorepo',
            },
            {
                args: { query: 'mcp_help', excludeGlobs: ['**/dist/**'] },
                comment: 'Search source only, skip build outputs',
            },
        ],
        stability: 'stable',
        since: '0.1.0',
    };
    const invoke = async (raw) => {
        const args = Schema.parse(raw);
        const { query, regex, caseSensitive, includeHidden, maxDepth, maxFileSizeBytes, maxResults, rel, includeGlobs, excludeGlobs, sortBy, } = args;
        const ROOT = resolveRoot();
        const baseAbs = (0, files_js_1.normalizeToRoot)(ROOT, rel);
        const files = (await walk(baseAbs, { includeHidden, maxDepth }))
            .filter((p) => (0, files_js_1.isInsideRoot)(ROOT, p))
            .filter((p) => textFile(p))
            .filter((abs) => {
            const relPath = node_path_1.default.relative(ROOT, abs).replace(/\\/g, '/');
            const included = includeGlobs.some((g) => (0, minimatch_1.minimatch)(relPath, g));
            const excluded = excludeGlobs.some((g) => (0, minimatch_1.minimatch)(relPath, g));
            return included && !excluded;
        });
        const flags = caseSensitive ? '' : 'i';
        const pattern = regex
            ? new RegExp(query, flags)
            : new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
        const results = [];
        for (const f of files) {
            if (results.length >= maxResults)
                break;
            try {
                const st = await promises_1.default.stat(f);
                if (st.size > maxFileSizeBytes)
                    continue;
                if (!textFile(f))
                    continue;
                const rawTxt = await promises_1.default.readFile(f, 'utf8');
                const lines = rawTxt.split(/\r?\n/);
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    if (line === undefined)
                        continue;
                    if (pattern.test(line)) {
                        results.push({
                            path: node_path_1.default.relative(ROOT, f).replace(/\\/g, '/'),
                            line: i + 1,
                            snippet: line,
                        });
                        if (results.length >= maxResults)
                            break;
                    }
                }
            }
            catch {
                /* ignore file errors */
            }
        }
        const ordered = sortBy === 'path'
            ? [...results].sort((a, b) => a.path.localeCompare(b.path) || a.line - b.line)
            : [...results].sort((a, b) => a.line - b.line || a.path.localeCompare(b.path));
        return { ok: true, count: ordered.length, results: ordered };
    };
    return { spec, invoke };
};
exports.filesSearch = filesSearch;
exports.default = exports.filesSearch;
