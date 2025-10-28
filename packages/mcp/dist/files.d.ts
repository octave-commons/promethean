export declare const getMcpRoot: () => string;
/** Strip a leading "../" etc. and never return a path outside the root. */
export declare const normalizeToRoot: (ROOT_PATH: string, rel?: string | undefined) => string;
/** Check if an absolute path is still inside the sandbox root. */
export declare const isInsideRoot: (ROOT_PATH: string, absOrRel: string) => boolean;
export declare const resolvePath: (ROOT_PATH: string, p: string | null | undefined) => Promise<string | null>;
export declare const viewFile: (ROOT_PATH: string, relOrFuzzy: string, line?: number, context?: number) => Promise<{
    path: string;
    totalLines: number;
    startLine: number;
    endLine: number;
    focusLine: number;
    snippet: string;
}>;
type ListDirOptions = Readonly<{
    hidden?: boolean;
    includeHidden?: boolean;
}>;
type ListDirEntry = {
    name: string;
    path: string;
    type: 'dir' | 'file';
    size: number | null;
    mtimeMs: number | null;
};
export declare const listDirectory: (ROOT_PATH: string, rel: string, options?: ListDirOptions) => Promise<{
    ok: boolean;
    base: string;
    entries: ListDirEntry[];
}>;
type TreeOptions = {
    includeHidden?: boolean;
    depth?: number;
};
type TreeNode = {
    name: string;
    path: string;
    type: 'dir' | 'file';
    size?: number;
    mtimeMs?: number;
    children?: TreeNode[];
};
export declare const treeDirectory: (ROOT_PATH: string, sel: string, options?: TreeOptions) => Promise<{
    ok: boolean;
    base: string;
    tree: TreeNode[];
}>;
export declare const writeFileContent: (ROOT_PATH: string, filePath: string, content: string) => Promise<{
    path: string;
}>;
export declare const writeFileLines: (ROOT_PATH: string, filePath: string, lines: string[], startLine: number) => Promise<{
    path: string;
}>;
declare const _default: {
    getMcpRoot: () => string;
    normalizeToRoot: (ROOT_PATH: string, rel?: string | undefined) => string;
    isInsideRoot: (ROOT_PATH: string, absOrRel: string) => boolean;
    resolvePath: (ROOT_PATH: string, p: string | null | undefined) => Promise<string | null>;
    viewFile: (ROOT_PATH: string, relOrFuzzy: string, line?: number, context?: number) => Promise<{
        path: string;
        totalLines: number;
        startLine: number;
        endLine: number;
        focusLine: number;
        snippet: string;
    }>;
    listDirectory: (ROOT_PATH: string, rel: string, options?: ListDirOptions) => Promise<{
        ok: boolean;
        base: string;
        entries: ListDirEntry[];
    }>;
    treeDirectory: (ROOT_PATH: string, sel: string, options?: TreeOptions) => Promise<{
        ok: boolean;
        base: string;
        tree: TreeNode[];
    }>;
    writeFileContent: (ROOT_PATH: string, filePath: string, content: string) => Promise<{
        path: string;
    }>;
    writeFileLines: (ROOT_PATH: string, filePath: string, lines: string[], startLine: number) => Promise<{
        path: string;
    }>;
};
export default _default;
//# sourceMappingURL=files.d.ts.map