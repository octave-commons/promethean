import type { IncomingMessage, ServerResponse } from 'node:http';

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

import type { ProxyInstance } from './proxy-factory.js';
import type { StdioServerSpec } from './config.js';

/**
 * SDK-based MCP proxy using the official MCP Client for proper initialization
 */
type JSONRPCMessage = any;

export class SdkStdioProxy implements ProxyInstance {
  private readonly client: Client;
  private readonly stdio: StdioClientTransport;
  private readonly http: StreamableHTTPServerTransport;
  private readonly logger: (msg: string, ...rest: unknown[]) => void;
  private readonly _spec: StdioServerSpec;

  constructor(spec: StdioServerSpec, logger: (msg: string, ...rest: unknown[]) => void) {
    this._spec = spec;
    this.logger = logger;

    // Create MCP client with proper initialization
    this.client = new Client(
      {
        name: 'promethean-sdk-proxy',
        version: '1.0.0',
      },
      {
        capabilities: {},
      },
    );

    // Create stdio transport for the server process
    this.stdio = new StdioClientTransport({
      command: spec.command,
      args: [...spec.args],
      env: { ...process.env, ...spec.env } as Record<string, string>,
      cwd: spec.cwd || process.cwd(),
    });

    // Create HTTP transport for proxying requests
    this.http = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => `sdk-${spec.name}-${Date.now()}`,
    });

    this.setupMessageForwarding();
    this.setupErrorHandlers();
  }

  private setupMessageForwarding(): void {
    // Forward messages from HTTP to stdio
    this.http.onmessage = async (message: unknown) => {
      try {
        this.logger(
          `[sdk-proxy] ${this.spec.name}: Forwarding message: ${(message as any).method || 'unknown'}`,
        );
        await this.stdio.send(message as any);
      } catch (error) {
        this.logger(`[sdk-proxy] ${this.spec.name}: Failed to forward message:`, error);
      }
    };

    // Forward messages from stdio back through HTTP
    this.stdio.onmessage = async (message: unknown) => {
      try {
        const jsonRpcMessage = message as any;

        const hasResult = Object.prototype.hasOwnProperty.call(jsonRpcMessage, 'result');
        const hasError = Object.prototype.hasOwnProperty.call(jsonRpcMessage, 'error');

        this.logger(
          `[sdk-proxy] ${this.spec.name}: Received message: ${hasResult ? 'response' : hasError ? 'error' : 'notification'}`,
        );

        // Forward all messages from stdio back through HTTP
        await this.http.send(jsonRpcMessage);
      } catch (error) {
        this.logger(`[sdk-proxy] ${this.spec.name}: Failed to forward response:`, error);
      }
    };

  private setupErrorHandlers(): void {
    // Handle stdio transport errors
    this.stdio.onerror = (error: unknown) => {
      if (error instanceof Error && error.message.includes('is not valid JSON')) {
        this.logger(`[sdk-proxy] ${this.spec.name}: Debug output detected (non-JSON)`);
        return;
      }
      this.logger(`[sdk-proxy] ${this.spec.name}: Transport error:`, error);
    };

    this.stdio.onclose = () => {
      this.logger(`[sdk-proxy] ${this.spec.name}: Transport closed`);
    };

    // Handle stderr output
    const stderr = this.stdio.stderr;
    if (stderr) {
      stderr.on('data', (chunk: Buffer) => {
        const text = chunk.toString().trim();
        if (text.length > 0) {
          this.logger(`[sdk-proxy] ${this.spec.name} [stderr]: ${text}`);
        }
      });
    }
  }

  /**
   * Start the proxy with proper SDK-based initialization
   */
  async start(): Promise<void> {
    const startTime = Date.now();

    try {
      this.logger(`[sdk-proxy] ${this.spec.name}: Starting SDK-based initialization...`);

      // Use SDK client to handle initialization automatically
      // connect() will start the stdio transport for us
      await this.client.connect(this.stdio);
      this.logger(`[sdk-proxy] ${this.spec.name}: SDK client connected and initialized`);

      await this.http.start();
      this.logger(`[sdk-proxy] ${this.spec.name}: HTTP transport started`);

      const initTime = Date.now() - startTime;
      this.logger(`[sdk-proxy] ${this.spec.name}: Initialization completed in ${initTime}ms`);

      // Log server capabilities for debugging
      const capabilities = this.client.getServerCapabilities();
      if (capabilities) {
        this.logger(
          `[sdk-proxy] ${this.spec.name}: Server capabilities:`,
          Object.keys(capabilities),
        );
      }
    } catch (error) {
      const initTime = Date.now() - startTime;
      this.logger(
        `[sdk-proxy] ${this.spec.name}: Initialization failed after ${initTime}ms:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Handle HTTP requests
   */
  async handle(req: IncomingMessage, res: ServerResponse, parsedBody?: unknown): Promise<void> {
    // Set session ID if available
    if (this.http.sessionId !== undefined && !req.headers['mcp-session-id']) {
      req.headers['mcp-session-id'] = this.http.sessionId;
    }

    await this.http.handleRequest(req, res, parsedBody);
  }

  /**
   * Get the session ID for this proxy
   */
  get sessionId(): string | undefined {
    return this.http.sessionId;
  }

  /**
   * Get server capabilities after initialization
   */
  getServerCapabilities() {
    return this.client.getServerCapabilities();
  }

  /**
   * Get server info after initialization
   */
  getServerInfo() {
    return (this.client as any).getServerInfo?.();
  }

  /**
   * Expose the spec for compatibility
   */
  get spec(): StdioServerSpec {
    return this._spec;
  }

  /**
   * Stop the proxy and clean up resources
   */
  async stop(): Promise<void> {
    try {
      this.logger(`[sdk-proxy] ${this.spec.name}: Stopping proxy...`);

      await this.http.close();
      await this.stdio.close();
      await this.client.close();

      this.logger(`[sdk-proxy] ${this.spec.name}: Proxy stopped successfully`);
    } catch (error) {
      this.logger(`[sdk-proxy] ${this.spec.name}: Error stopping proxy:`, error);
    }
  }
}
