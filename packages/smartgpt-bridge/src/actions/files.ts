import {
  treeDirectory,
  viewFile,
  writeFileContent,
  writeFileLines,
} from "../files.js";
import { scheduleReindexSubset } from "../indexerClient.js";

export type FileTreeNode = {
  name: string;
  path: string;
  type: string;
  size?: number | null;
  mtimeMs?: number | null;
  children?: FileTreeNode[];
};

export type FileTreeResult = {
  ok: boolean;
  base: string;
  tree: FileTreeNode;
};

export async function viewFileAction(args: {
  rootPath: string;
  path: string;
  line?: number;
  context?: number;
}) {
  const { rootPath, path, line, context } = args;
  return viewFile(rootPath, path, line, context);
}

export async function treeDirectoryAction(args: {
  rootPath: string;
  path: string;
  includeHidden?: boolean;
  depth?: number;
}): Promise<FileTreeResult> {
  const { rootPath, path, includeHidden, depth } = args;
  const options: { includeHidden?: boolean; depth?: number } = {};
  if (includeHidden !== undefined)
    options.includeHidden = Boolean(includeHidden);
  if (typeof depth === "number") options.depth = depth;
  const result = await treeDirectory(rootPath, path, options);
  return result as FileTreeResult;
}

export function flattenTreeToEntriesAction(tree: FileTreeNode) {
  const entries: Array<{
    name: string;
    path: string;
    type: string;
    size: number | null;
    mtimeMs: number | null;
  }> = [];
  const walk = (node: FileTreeNode) => {
    if (node.path !== "." && node.path !== "") {
      entries.push({
        name: node.name,
        path: node.path,
        type: node.type,
        size: node.size ?? null,
        mtimeMs: node.mtimeMs ?? null,
      });
    }
    if (Array.isArray(node.children)) {
      for (const child of node.children) {
        walk(child);
      }
    }
  };
  walk(tree);
  return entries;
}

export async function writeFileContentAction(args: {
  rootPath: string;
  path: string;
  content: string;
}) {
  const { rootPath, path, content } = args;
  return writeFileContent(rootPath, path, content);
}

export async function writeFileLinesAction(args: {
  rootPath: string;
  path: string;
  lines: string[];
  startLine: number;
}) {
  const { rootPath, path, lines, startLine } = args;
  return writeFileLines(rootPath, path, lines, startLine);
}

export async function scheduleReindexAction(globs: string | string[]) {
  return scheduleReindexSubset(globs);
}
