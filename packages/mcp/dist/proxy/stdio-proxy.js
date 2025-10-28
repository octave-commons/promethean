import fs from 'node:fs';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
const hasRequestId = (message) => typeof message.id === 'string' ||
    typeof message.id === 'number';
const isResponse = (message) => Object.prototype.hasOwnProperty.call(message, 'result') ||
    Object.prototype.hasOwnProperty.call(message, 'error');
const isRequest = (message) => typeof message.method === 'string';
const isValidJsonRpcMessage = (message) => {
    // Must be an object
    if (typeof message !== 'object' || message === null) {
        return false;
    }
    const msg = message;
    // Must have jsonrpc: "2.0"
    if (msg.jsonrpc !== '2.0') {
        return false;
    }
    // Must be either a request (has method) or a response (has result or error)
    const hasMethod = typeof msg.method === 'string';
    const hasResult = 'result' in msg;
    const hasError = 'error' in msg;
    return hasMethod || hasResult || hasError;
};
export const createStdioEnv = (overrides = {}, baseEnv = process.env, nodeExecPath = process.execPath) => {
    const base = Object.fromEntries(Object.entries(baseEnv).flatMap(([key, value]) => typeof value === 'string' ? [[key, value]] : []));
    const initial = { ...base, ...overrides };
    const hasPath = (value) => typeof value === 'string' && value.trim().length > 0;
    const candidatePath = hasPath(initial.PATH)
        ? initial.PATH
        : hasPath(initial.Path)
            ? initial.Path
            : '';
    const execDir = path.dirname(nodeExecPath);
    const segments = candidatePath
        .split(path.delimiter)
        .map((segment) => segment.trim())
        .filter((segment) => segment.length > 0);
    const withExec = segments.includes(execDir) ? segments : [...segments, execDir];
    const finalPath = withExec.join(path.delimiter);
    const result = { ...initial, PATH: finalPath };
    if (result.Path === undefined && typeof baseEnv.Path === 'string') {
        return { ...result, Path: baseEnv.Path };
    }
    return result;
};
const pathExtensions = (env, platform) => {
    if (platform !== 'win32') {
        return [''];
    }
    const raw = env.PATHEXT ?? process.env.PATHEXT;
    return raw ? raw.split(';') : ['.EXE', '.CMD', '.BAT', '.COM'];
};
const isExecutableFile = (candidate, platform = process.platform) => {
    try {
        const stat = fs.statSync(candidate);
        if (!stat.isFile()) {
            return false;
        }
        if (platform === 'win32') {
            return true;
        }
        return (stat.mode & 0o111) !== 0;
    }
    catch {
        return false;
    }
};
export const resolveCommandPath = (command, env, platform = process.platform) => {
    if (path.isAbsolute(command) || command.startsWith('.' + path.sep)) {
        return command;
    }
    const pathValue = env.PATH ?? env.Path ?? process.env.PATH ?? '';
    const directories = pathValue.split(path.delimiter).filter(Boolean);
    const extensions = pathExtensions(env, platform);
    for (const dir of directories) {
        for (const ext of extensions) {
            const candidate = path.join(dir, ext ? `${command}${ext}` : command);
            if (isExecutableFile(candidate, platform)) {
                return candidate;
            }
        }
    }
    return command;
};
export class StdioHttpProxy {
    spec;
    logger;
    stdio;
    http;
    constructor(spec, logger) {
        this.spec = spec;
        this.logger = logger;
        const env = createStdioEnv(spec.env);
        const command = resolveCommandPath(spec.command, env);
        const args = [...spec.args];
        this.stdio = new StdioClientTransport({
            command,
            args,
            env,
            cwd: spec.cwd,
            stderr: 'pipe',
        });
        this.http = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => randomUUID(),
        });
        // Hook into the stdio transport to capture raw stdout for debugging
        this.hookStdioOutput();
        this.http.onmessage = async (message) => {
            try {
                await this.stdio.send(message);
            }
            catch (error) {
                this.logger(`failed to forward message to stdio server ${spec.name}:`, error);
                if (isRequest(message) && hasRequestId(message)) {
                    const errorResponse = {
                        jsonrpc: '2.0',
                        id: message.id,
                        error: {
                            code: -32000,
                            message: 'Proxy failed to forward request to stdio server',
                            data: error instanceof Error ? error.message : String(error),
                        },
                    };
                    await this.http.send(errorResponse, {
                        relatedRequestId: message.id,
                    });
                }
            }
        };
        this.stdio.onmessage = async (rawMessage) => {
            try {
                // Validate that the message is a proper JSON-RPC message before processing
                if (!isValidJsonRpcMessage(rawMessage)) {
                    this.logger(`[filtered debug output] ${spec.name}:`, rawMessage);
                    return;
                }
                const message = rawMessage;
                const related = isResponse(message) && hasRequestId(message) ? message.id : undefined;
                await this.http.send(message, related === undefined ? undefined : { relatedRequestId: related });
            }
            catch (error) {
                this.logger(`failed to send HTTP response for ${spec.name}:`, error);
            }
        };
        const stderr = this.stdio.stderr;
        if (stderr) {
            stderr.on('data', (chunk) => {
                const text = chunk.toString().trim();
                if (text.length > 0) {
                    this.logger(`[stderr] ${text}`);
                }
            });
        }
        this.stdio.onclose = () => {
            this.logger(`stdio transport closed for ${spec.name}`);
        };
        this.stdio.onerror = (error) => {
            // Check if this is a JSON parsing error from debug output
            if (error instanceof Error && error.message.includes('is not valid JSON')) {
                // This is likely debug output - log it differently and don't treat as critical
                this.logger(`[stdout debug json error] ${spec.name}: Debug output detected (non-JSON)`);
                return; // Don't propagate - this is expected behavior
            }
            this.logger(`stdio transport error for ${spec.name}:`, error);
        };
    }
    hookStdioOutput() {
        // Note: The MCP SDK's StdioClientTransport doesn't expose direct access to the underlying process
        // stdout, so we cannot intercept and filter debug output before JSON parsing.
        //
        // Instead, we handle debug output gracefully by:
        // 1. Catching JSON parsing errors in the error handler (above)
        // 2. Validating messages in the onmessage handler (below)
        // 3. Filtering out invalid JSON-RPC messages before they cause issues
        // This is a limitation of the current SDK design where debug logs mixed with JSON-RPC
        // on stdout will cause parsing errors, but these errors are handled gracefully.
        this.logger(`[stdout filtering] ${this.spec.name}: SDK doesn't expose process access - using error-based filtering`);
    }
    async start() {
        await this.stdio.start();
        await this.http.start();
        // Perform proper MCP initialization sequence
        await this.initializeMcpServer();
    }
    async handle(req, res, parsedBody) {
        if (this.http.sessionId !== undefined && !req.headers['mcp-session-id']) {
            req.headers['mcp-session-id'] = this.http.sessionId;
        }
        await this.http.handleRequest(req, res, parsedBody);
    }
    get sessionId() {
        return this.http.sessionId;
    }
    async stop() {
        await this.stdio.close();
        await this.http.close();
    }
    async initializeMcpServer() {
        try {
            this.logger(`[stdio-init] ${this.spec.name}: Starting MCP initialization...`);
            // Send initialize request
            const initRequest = {
                jsonrpc: '2.0',
                id: `stdio-init-${this.spec.name}-${Date.now()}`,
                method: 'initialize',
                params: {
                    protocolVersion: '2024-10-01',
                    clientInfo: { name: 'promethean-stdio-proxy', version: '1.0.0' },
                },
            };
            await this.stdio.send(initRequest);
            this.logger(`[stdio-init] ${this.spec.name}: Sent initialize request`);
            // Wait for initialization response
            await new Promise((resolve) => setTimeout(resolve, 1000));
            // Send the required initialized notification
            // Serena expects "notifications/initialized" instead of "initialized"
            const method = this.spec.name === 'serena' ? 'notifications/initialized' : 'initialized';
            const initializedNotification = {
                jsonrpc: '2.0',
                method,
                params: {},
            };
            await this.stdio.send(initializedNotification);
            this.logger(`[stdio-init] ${this.spec.name}: Sent initialized notification`);
            // Give the server time to complete initialization
            // Serena needs more time to be fully ready
            const waitTime = this.spec.name === 'serena' ? 5000 : 1000;
            await new Promise((resolve) => setTimeout(resolve, waitTime));
            this.logger(`[stdio-init] ${this.spec.name}: MCP initialization completed`);
        }
        catch (error) {
            this.logger(`[stdio-init] ${this.spec.name}: Failed to initialize MCP server:`, error);
            // Don't throw - let the proxy continue to work, some servers might not need initialization
        }
    }
}
//# sourceMappingURL=stdio-proxy.js.map