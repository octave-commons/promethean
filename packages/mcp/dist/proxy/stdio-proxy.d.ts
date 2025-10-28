import type { IncomingMessage, ServerResponse } from 'node:http';
import type { StdioServerSpec } from './config.js';
export declare const createStdioEnv: (overrides?: Readonly<Record<string, string>>, baseEnv?: NodeJS.ProcessEnv, nodeExecPath?: string) => Readonly<Record<string, string>>;
export declare const resolveCommandPath: (command: string, env: Readonly<Record<string, string>>, platform?: NodeJS.Platform) => string;
export declare class StdioHttpProxy {
    readonly spec: StdioServerSpec;
    private readonly logger;
    private readonly stdio;
    private readonly http;
    constructor(spec: StdioServerSpec, logger: (msg: string, ...rest: unknown[]) => void);
    private hookStdioOutput;
    start(): Promise<void>;
    handle(req: IncomingMessage, res: ServerResponse, parsedBody?: unknown): Promise<void>;
    get sessionId(): string | undefined;
    stop(): Promise<void>;
    private initializeMcpServer;
}
//# sourceMappingURL=stdio-proxy.d.ts.map