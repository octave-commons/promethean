import path from 'node:path';
import { z } from 'zod';

import {
  getMcpRoot,
  isInsideRoot,
  listDirectory,
  treeDirectory,
  viewFile,
  writeFileContent,
  writeFileLines,
} from '../files.js';
import type { ToolFactory, ToolSpec } from '../core/types.js';

const formatError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return 'Unknown error';
  }
};

const buildRootResolver = (ctx?: Parameters<ToolFactory>[0]) => {
  const contextRoot = ctx?.env?.MCP_ROOT_PATH;
  if (typeof contextRoot === 'string' && contextRoot.trim().length > 0) {
    const resolved = path.resolve(contextRoot);
    return () => resolved;
  }
  return () => getMcpRoot();
};

type ToolError = { ok: false; error: string };

const withErrorHandling = async <T, R = T>(
  operation: () => Promise<T>,
  onSuccess?: (value: T) => R,
): Promise<R | ToolError> => {
  try {
    const value = await operation();
    return onSuccess ? onSuccess(value) : ((value as unknown) as R);
  } catch (error) {
    return { ok: false, error: formatError(error) };
  }
};

const coerceToRootRelative = (root: string, candidate: string): string => {
  if (!path.isAbsolute(candidate)) {
    return candidate;
  }
  const resolved = path.resolve(candidate);
  if (!isInsideRoot(root, resolved)) {
    return candidate;
  }
  const relative = path.relative(root, resolved);
  return relative.length === 0 ? '.' : relative;
};

export const filesListDirectory: ToolFactory = (ctx) => {
  const resolveRoot = buildRootResolver(ctx);
  const shape = {
    rel: z.string().default('.'),
    includeHidden: z.boolean().optional(),
  } as const;
  const Schema = z.object(shape);
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
  } satisfies ToolSpec;

  const invoke = async (raw: unknown) => {
    const args = Schema.parse(raw);
    const { rel, includeHidden } = args;
    const options = typeof includeHidden === 'boolean' ? { includeHidden } : {};
    const root = resolveRoot();
    const target = coerceToRootRelative(root, rel);
    return withErrorHandling(() => listDirectory(root, target, options));
  };

  return { spec, invoke };
};

export const filesTreeDirectory: ToolFactory = (ctx) => {
  const resolveRoot = buildRootResolver(ctx);
  const shape = {
    rel: z.string().default('.'),
    includeHidden: z.boolean().optional(),
    depth: z.number().int().min(1).default(1),
  } as const;
  const Schema = z.object(shape);
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
  } satisfies ToolSpec;

  const invoke = async (raw: unknown) => {
    const args = Schema.parse(raw);
    const { rel, includeHidden, depth } = args;
    const options = {
      depth,
      ...(typeof includeHidden === 'boolean' ? { includeHidden } : {}),
    };
    const root = resolveRoot();
    const target = coerceToRootRelative(root, rel);
    return withErrorHandling(() => treeDirectory(root, target, options));
  };

  return { spec, invoke };
};

export const filesViewFile: ToolFactory = (ctx) => {
  const resolveRoot = buildRootResolver(ctx);
  const shape = {
    relOrFuzzy: z.string(),
    line: z.number().int().min(1).optional(),
    context: z.number().int().min(0).optional(),
  } as const;
  const Schema = z.object(shape);
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
  } satisfies ToolSpec;
  const invoke = async (raw: unknown) => {
    const args = Schema.parse(raw);
    const { relOrFuzzy: rel, line, context } = args;
    const root = resolveRoot();
    const target = coerceToRootRelative(root, rel);
    return withErrorHandling(
      () => viewFile(root, target, line, context),
      (result) => ({ ok: true, ...result }),
    );
  };
  return { spec, invoke };
};

export const filesWriteFileContent: ToolFactory = (ctx) => {
  const resolveRoot = buildRootResolver(ctx);
  const shape = {
    filePath: z.string(),
    content: z.string(),
  } as const;
  const Schema = z.object(shape);
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
  } satisfies ToolSpec;
  const invoke = async (raw: unknown) => {
    const args = Schema.parse(raw);
    const { filePath, content } = args;
    const root = resolveRoot();
    const target = coerceToRootRelative(root, filePath);
    return withErrorHandling(
      () => writeFileContent(root, target, content),
      (result) => ({ ok: true, ...result }),
    );
  };
  return { spec, invoke };
};

export const filesWriteFileLines: ToolFactory = (ctx) => {
  const resolveRoot = buildRootResolver(ctx);
  const shape = {
    filePath: z.string(),
    lines: z.array(z.string()).min(1, 'lines must not be empty'),
    startLine: z.number().int().min(1),
  } as const;
  const Schema = z.object(shape);
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
  } satisfies ToolSpec;
  const invoke = async (raw: unknown) => {
    const args = Schema.parse(raw);
    const { filePath, lines, startLine } = args;
    const root = resolveRoot();
    const target = coerceToRootRelative(root, filePath);
    return withErrorHandling(
      () => writeFileLines(root, target, lines, startLine),
      (result) => ({ ok: true, ...result }),
    );
  };
  return { spec, invoke };
};
