import { z } from "zod";

import {
  getMcpRoot,
  listDirectory,
  treeDirectory,
  viewFile,
  writeFileContent,
  writeFileLines,
} from "../files.js";
import type { ToolFactory, ToolSpec } from "../core/types.js";

// Unified sandbox-root resolver
// If MCP_ROOT_PATH isn't set, default to CWD at runtime.
const resolveRoot = () => getMcpRoot();

export const filesListDirectory: ToolFactory = () => {
  const shape = {
    rel: z.string().default("."),
    includeHidden: z.boolean().optional(),
  } as const;
  const Schema = z.object(shape);
  const spec = {
    name: "files.list-directory",
    description: "List files and directories within the sandbox root.",
    inputSchema: shape,
    outputSchema: {
      ok: true,
      base: ".",
      entries: [{ name: "src", path: "src", type: "dir" }],
    } as any,
    examples: [
      { args: { rel: "packages" }, comment: "List the packages/ folder" },
      { args: { rel: ".", includeHidden: true }, comment: "Include dotfiles" },
    ],
    stability: "stable",
    since: "0.1.0",
  } satisfies ToolSpec;

  const invoke = async (raw: unknown) => {
    const args = Schema.parse(raw);
    const { rel, includeHidden } = args;
    const options = typeof includeHidden === "boolean" ? { includeHidden } : {};
    return listDirectory(resolveRoot(), rel, options);
  };

  return { spec, invoke };
};

export const filesTreeDirectory: ToolFactory = () => {
  const shape = {
    rel: z.string().default("."),
    includeHidden: z.boolean().optional(),
    depth: z.number().int().min(1).default(1),
  } as const;
  const Schema = z.object(shape);
  const spec = {
    name: "files.tree-directory",
    description:
      "Build a tree-like view of a directory, with optional hidden files and max depth.",
    inputSchema: shape,
    outputSchema: { ok: true, base: ".", tree: [] } as any,
    examples: [
      {
        args: { rel: "packages/mcp", depth: 2 },
        comment: "Two-level tree of MCP package",
      },
    ],
    stability: "stable",
    since: "0.1.0",
  } satisfies ToolSpec;

  const invoke = async (raw: unknown) => {
    const args = Schema.parse(raw);
    const { rel, includeHidden, depth } = args;
    const options = {
      depth,
      ...(typeof includeHidden === "boolean" ? { includeHidden } : {}),
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
    name: "files.view-file",
    description: "View a file by path, with line-context selection.",
    inputSchema: shape,
    outputSchema: {
      path: "README.md",
      totalLines: 0,
      startLine: 1,
      endLine: 1,
      focusLine: 1,
      snippet: "",
    } as any,
    examples: [
      {
        args: { relOrFuzzy: "packages/mcp/src/index.ts", line: 1, context: 40 },
        comment: "View file head with context",
      },
    ],
    stability: "stable",
    since: "0.1.0",
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
    name: "files.write-content",
    description: "Write UTF-8 content to a file (creates if not exists).",
    inputSchema: shape,
    outputSchema: { path: "path/to/file" } as any,
    examples: [
      {
        args: { filePath: "tmp/notes.txt", content: "hello" },
        comment: "Create or replace a text file",
      },
    ],
    stability: "stable",
    since: "0.1.0",
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
    name: "files.write-lines",
    description: "Append or insert lines into a file at startLine (1-based).",
    inputSchema: shape,
    outputSchema: { path: "path/to/file" } as any,
    examples: [
      {
        args: {
          filePath: "README.md",
          lines: ["", "## New Section"],
          startLine: 10,
        },
        comment: "Insert section at line 10",
      },
    ],
    stability: "stable",
    since: "0.1.0",
  } satisfies ToolSpec;
  const invoke = async (raw: unknown) => {
    const args = Schema.parse(raw);
    const { filePath, lines, startLine } = args;
    return writeFileLines(resolveRoot(), filePath, lines, startLine);
  };
  return { spec, invoke };
};
