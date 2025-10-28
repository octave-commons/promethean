import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { StdioHttpProxy } from '../../proxy/stdio-proxy.js';
import { type EndpointDefinition } from '../resolve-config.js';
import type { Transport, Tool } from '../types.js';
type ProxyLifecycle = Pick<StdioHttpProxy, 'start' | 'stop' | 'handle' | 'spec'>;
type RegistryEndpointDescriptor = Readonly<{
    path: string;
    kind: 'registry';
    handler: McpServer;
    tools?: readonly Tool[];
    definition?: EndpointDefinition;
}>;
type ProxyEndpointDescriptor = Readonly<{
    path: string;
    kind: 'proxy';
    handler: ProxyLifecycle;
}>;
export type HttpEndpointDescriptor = RegistryEndpointDescriptor | ProxyEndpointDescriptor;
export declare const fastifyTransport: (opts?: {
    port?: number;
    host?: string;
}) => Transport;
export {};
//# sourceMappingURL=fastify.d.ts.map