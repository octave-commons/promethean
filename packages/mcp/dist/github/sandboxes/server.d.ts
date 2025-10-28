import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ReadonlyDeep } from 'type-fest';
import { type CreateSandboxOptions, type ListSandboxesOptions, type SandboxInfo } from './git.js';
type Dependencies = ReadonlyDeep<{
    createSandbox: (options: CreateSandboxOptions) => Promise<SandboxInfo>;
    listSandboxes: (options: ListSandboxesOptions) => Promise<readonly SandboxInfo[]>;
    removeSandbox: (options: {
        repoPath: string;
        sandboxId: string;
    }) => Promise<void>;
}>;
export type SandboxServerDependencies = Partial<Dependencies>;
export declare const createSandboxServer: (dependencies?: ReadonlyDeep<SandboxServerDependencies>) => ReadonlyDeep<McpServer>;
export {};
//# sourceMappingURL=server.d.ts.map