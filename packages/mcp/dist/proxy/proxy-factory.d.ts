import type { IncomingMessage, ServerResponse } from 'node:http';
import type { StdioServerSpec, ProxyImplementation } from './config.js';
export interface ProxyInstance {
    start(): Promise<void>;
    handle(req: IncomingMessage, res: ServerResponse, parsedBody?: unknown): Promise<void>;
    stop(): Promise<void>;
    get sessionId(): string | undefined;
    getServerCapabilities?(): unknown;
    getServerInfo?(): unknown;
    readonly spec: StdioServerSpec;
}
export interface ProxyOptions {
    implementation?: ProxyImplementation;
    logger: (msg: string, ...rest: unknown[]) => void;
}
/**
 * Factory function to create MCP proxy instances with different implementations
 */
export declare function createProxy(spec: StdioServerSpec, options: ProxyOptions): ProxyInstance;
/**
 * Determine the best proxy implementation for a given server
 */
export declare function selectProxyImplementation(spec: StdioServerSpec, defaultImplementation?: ProxyImplementation): ProxyImplementation;
//# sourceMappingURL=proxy-factory.d.ts.map