import { z } from 'zod';

import {
  getMcpRoot,
  listDirectory,
  treeDirectory,
  viewFile,
  writeFileContent,
  writeFileLines,
} from '../files.js';
import type { ToolFactory, ToolSpec } from '../core/types.js';

// Unified sandbox-root resolver
// If MCP_ROOT_PATH isn't set, default to CWD at runtime.
const resolveRoot = () => getMcpRoot();

export const filesListDirectory: ToolFactory = () => {
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
    return listDirectory(resolveRoot(), rel, options);
  };

  return { spec, invoke };
};

export const filesTreeDirectory: ToolFactory = () => {
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
    return treeDirectory(resolveRoot(), rel, options);
  };

  return { spec, invoke };
};

export const filesViewFile: ToolFactory = () => {
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
    return viewFile(resolveRoot(), rel, line, context);
  };
  return { spec, invoke };
};

export const filesWriteFileContent: ToolFactory = () => {
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
    return writeFileContent(resolveRoot(), filePath, content);
  };
  return { spec, invoke };
};

export const filesWriteFileLines: ToolFactory = () => {
  const shape = {
    filePath: z.string(),
    lines: z.array(z.string()),
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
    return writeFileLines(resolveRoot(), filePath, lines, startLine);
  };
  return { spec, invoke };
};
