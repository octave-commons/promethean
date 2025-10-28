import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ReadonlyDeep } from 'type-fest';
export type ConflictServerDependencies = {
    readonly fetchImpl?: typeof fetch;
};
type ImmutableServer = ReadonlyDeep<McpServer>;
export declare const createConflictServer: (dependencies?: ConflictServerDependencies) => ImmutableServer;
export declare const server: import("type-fest/source/readonly-deep.js").ReadonlyObjectDeep<McpServer>;
export {};
//# sourceMappingURL=server.d.ts.map