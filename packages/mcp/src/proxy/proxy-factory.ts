import type { IncomingMessage, ServerResponse } from 'node:http';

import { StdioHttpProxy } from './stdio-proxy.js';
import { SdkStdioProxy } from './sdk-stdio-proxy.js';
import type { StdioServerSpec, ProxyImplementation } from './config.js';

export interface ProxyInstance {
  start(): Promise<void>;
  handle(req: IncomingMessage, res: ServerResponse, parsedBody?: unknown): Promise<void>;
  stop(): Promise<void>;
  get sessionId(): string | undefined;
  getServerCapabilities?(): unknown;
  getServerInfo?(): unknown;
  // Add spec property to be compatible with ProxyLifecycle
  readonly spec: StdioServerSpec;
}

export interface ProxyOptions {
  implementation?: ProxyImplementation;
  logger: (msg: string, ...rest: unknown[]) => void;
}

/**
 * Factory function to create MCP proxy instances with different implementations
 */
export function createProxy(spec: StdioServerSpec, options: ProxyOptions): ProxyInstance {
  const { implementation, logger } = options;
  const selectedImplementation = implementation ?? selectProxyImplementation(spec);

  switch (selectedImplementation) {
    case 'sdk':
      logger(`[proxy-factory] Creating SDK-based proxy for ${spec.name}`);
      return new SdkStdioProxy(spec, logger);

    case 'manual':
    default:
      logger(`[proxy-factory] Creating manual proxy for ${spec.name}`);
      return new StdioHttpProxy(spec, logger);
  }
}

/**
 * Determine the best proxy implementation for a given server
 */
export function selectProxyImplementation(
  spec: StdioServerSpec,
  defaultImplementation: ProxyImplementation = 'manual',
): ProxyImplementation {
  // First check for explicit configuration
  if (spec.proxy) {
    return spec.proxy;
  }

  // Use SDK implementation for servers known to have initialization issues
  const serversNeedingSdk = ['serena', 'n8n', 'any-other-problematic-server'];

  if (serversNeedingSdk.includes(spec.name.toLowerCase())) {
    return 'sdk';
  }

  return defaultImplementation;
}
