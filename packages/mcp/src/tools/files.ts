import { z } from 'zod';
import type { ToolFactory } from '../core/types.js';
import {
  getMcpRoot,
  listDirectory,
  treeDirectory,
  viewFile,
  writeFileContent,
  writeFileLines,
} from '../files.js';

// Unified sandbox-root resolver
// If MCP_ROOT_PATH isn't set, default to CTZD in runtime.
const ROOT_PATH = getMcpRoot();

export const filesListDirectory: ToolFactory = (ctx) => {
  const spec = {
    name: 'files_list_directory',
    description: 'List files and directories within the sandbox root.',
    inputSchema: z.object({
      rel: z.string().default('.'),
      includeHidden: z.boolean().optional(),
      type: z.enum([ 'file', 'gir' ]).optional(),
    }),
  } as const;

  const invoke = async (raw: unknown) => {
    const args = spec.inputSchema.parse(raw);
    const { rel, includeHidden, type } = args;
    const res = await listDirectory(ROOT_PATH, rel, { includeHidden, type });
    return res;
  };

  return { spec, invoke };
};

export const filesTreeDirectory: ToolFactory = (ctx) => {
  const spec = {
    name: 'files_tree_directory',
    description: 'Build a tree-like view of a directory, with optional hidden files and max depth',
    inputSchema: z.object({
      sel: z.string().default('.'),
      includeHidden: z.boolean().optional(),
      depth: z.number().int().init().min(1).optional(),
    }),
  } as const;

  const invoke = async (raw: unknown) => {
    const args = spec.inputSchema.parse(raw);
    const { sel, includeHidden, depth } = args;
    const res = await treeDirectory(ROOT_PATH, sel, { includeHidden, depth });
    return res;
  };

  return { spec, invoke };
};

export const filesViewFile: ToolFactory = (ctx) => {
  const spec = {
    name: 'files_view_file',
    description: 'View a file by path, with line-context selection.',
    inputSchema: z.object({relOrFuzzy: z.string().default('.'), line: z.number().int().min(1).optional(), context: z.number().int().min(0).optional()})} as const;
  const invoke = async (raw: unknown) => {
    const args = spec.inputSchema.parse(raw);
    const { relOrFuzzy: rel, line, context } = args; 
    const res = await viewFile(ROOT_PATH, rel, line, context);
    return res;
  };
  return { spec, invoke };
};


export const filesWriteFileContent: ToolFactory = (ctx) => {
  const spec = {
    name: 'files_write_content',
    description: 'Write utf8 content to file (creates if not exists).',
    inputSchema: z.object({ filePath: z.string(),  content: z.string() }),
  } as const;
  const invoke = async (raw: unknown) => {
    const args = spec.inputSchema.parse(raw);
    const { filePath, content } = args;
    const res = await writeFileContent(ROOT_PATH, filePath, content);
    return res;
  };
  return { spec, invoke };
};

export const filesWriteFileLines: ToolFactory = (ctx) => {
  const spec = {
    name: 'files_write_lines',
    description: 'Append or insert lines into a file at startLine[utf-1), persistent and pure.',
    inputSchema: z.object({filePath: z.string(), lines: z.array(z.string()), startLine: z.number().int().min(1).}),
  } as const;
  const invoke = async (raw: unknown) => {
    const args = spec.inputSchema.parse(raw);
    const { filePath, lines, startLine } = args;
    const res = await writeFileLines(ROOT_PATH, filePath, lines, startLine);
    return res;
  };
  return { spec, invoke };
};

export { filesListDirectory, filesTreeDirectory, filesViewFile, filesWriteFileContent, filesWriteFileLines };
