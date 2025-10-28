import type { IncomingMessage, ServerResponse } from 'node:http';
import type { ProxyInstance } from './proxy-factory.js';
import type { StdioServerSpec } from './config.js';
/**
 * SDK-based MCP proxy using the official MCP Client for proper initialization
 */
export declare class SdkStdioProxy implements ProxyInstance {
    private readonly client;
    private readonly stdio;
    private readonly http;
    private readonly logger;
    private readonly _spec;
    constructor(spec: StdioServerSpec, logger: (msg: string, ...rest: unknown[]) => void);
    private setupMessageForwarding;
    private setupErrorHandlers;
    /**
     * Start the proxy with proper SDK-based initialization
     */
    start(): Promise<void>;
    /**
     * Handle HTTP requests
     */
    handle(req: IncomingMessage, res: ServerResponse, parsedBody?: unknown): Promise<void>;
    /**
     * Get the session ID for this proxy
     */
    get sessionId(): string | undefined;
    /**
     * Get server capabilities after initialization
     */
    getServerCapabilities(): {
        [x: string]: unknown;
        experimental?: {
            [x: string]: unknown;
        } | undefined;
        tools?: {
            [x: string]: unknown;
            listChanged?: boolean | undefined;
        } | undefined;
        logging?: {
            [x: string]: unknown;
        } | undefined;
        completions?: {
            [x: string]: unknown;
        } | undefined;
        prompts?: {
            [x: string]: unknown;
            listChanged?: boolean | undefined;
        } | undefined;
        resources?: {
            [x: string]: unknown;
            listChanged?: boolean | undefined;
            subscribe?: boolean | undefined;
        } | undefined;
    } | undefined;
    /**
     * Get server info after initialization
     */
    getServerInfo(): any;
    /**
     * Expose the spec for compatibility
     */
    get spec(): StdioServerSpec;
    /**
     * Stop the proxy and clean up resources
     */
    stop(): Promise<void>;
}
//# sourceMappingURL=sdk-stdio-proxy.d.ts.map