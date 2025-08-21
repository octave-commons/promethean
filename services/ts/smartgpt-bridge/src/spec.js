// Minimal OpenAPI spec preserved to satisfy tests and docs
export function spec() {
    const baseUrl = process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 3210}`;
    const authEnabled = String(process.env.AUTH_ENABLED || 'false').toLowerCase() === 'true';
    const authMode = (process.env.AUTH_MODE || 'static').toLowerCase();
    const bearerFormat = authMode === 'jwt' ? 'JWT' : 'Opaque';
    const security = authEnabled ? [{ bearerAuth: [] }] : [];
    const securitySchemes = authEnabled
        ? {
              bearerAuth: {
                  type: 'http',
                  scheme: 'bearer',
                  bearerFormat,
                  description:
                      authMode === 'jwt'
                          ? 'Send JWT via Authorization: Bearer <token>'
                          : 'Send static token via Authorization: Bearer <token>',
              },
          }
        : undefined;

    const AgentStartRequest = {
        type: 'object',
        required: ['prompt'],
        properties: {
            prompt: { type: 'string', description: 'The Codex prompt or command to execute.' },
            bypassApprovals: {
                type: 'boolean',
                default: false,
                description:
                    'Run agent with --dangerously-bypass-approvals. Should only be used in combination with sandboxing.',
            },
            sandbox: {
                oneOf: [
                    { type: 'boolean', const: false },
                    { type: 'string', enum: ['nsjail'] },
                ],
                default: false,
                description:
                    'Whether to sandbox the agent process. false: run normally; nsjail: run inside kernel-level jail using sandbox.cfg',
            },
            tty: { type: 'boolean', default: true, description: 'Run the process in a PTY.' },
            env: {
                type: 'object',
                additionalProperties: { type: 'string' },
                description: 'Environment variables.',
            },
        },
    };

    const AgentStartResponse = {
        type: 'object',
        properties: {
            ok: { type: 'boolean' },
            id: { type: 'string', description: 'Unique ID of the agent' },
            prompt: { type: 'string' },
            startedAt: {
                type: 'integer',
                format: 'int64',
                description: 'Timestamp (ms since epoch)',
            },
            sandbox: { type: 'string' },
            bypassApprovals: { type: 'boolean' },
            logfile: { type: 'string', description: 'Path to log file' },
        },
    };

    const AgentStatusResponse = {
        type: 'object',
        properties: {
            ok: { type: 'boolean' },
            status: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    prompt: { type: 'string' },
                    startedAt: { type: 'integer', format: 'int64' },
                    exited: { type: 'boolean' },
                    logfile: { type: 'string' },
                    sandbox: { type: 'string' },
                    bypassApprovals: { type: 'boolean' },
                },
            },
        },
    };

    const SimpleOk = {
        type: 'object',
        properties: { ok: { type: 'boolean' }, error: { type: 'string' } },
    };

    const AgentLogsResponse = {
        type: 'object',
        properties: {
            ok: { type: 'boolean' },
            total: { type: 'integer' },
            chunk: { type: 'string' },
        },
    };

    const AgentListResponse = {
        type: 'object',
        properties: {
            ok: { type: 'boolean' },
            agents: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: { id: { type: 'string' }, sandbox: { type: 'string' } },
                },
            },
        },
    };

    return {
        openapi: '3.1.0',
        info: { title: 'Promethean SmartGPT Bridge', version: '1.0.0' },
        jsonSchemaDialect: 'https://json-schema.org/draft/2020-12/schema',
        servers: [{ url: baseUrl }],
        security,
        components: {
            securitySchemes,
            schemas: {
                Error: {
                    type: 'object',
                    properties: { ok: { type: 'boolean' }, error: { type: 'string' } },
                },
                GrepRequest: {
                    type: 'object',
                    properties: {
                        pattern: { type: 'string' },
                        flags: { type: 'string' },
                        paths: { type: 'array', items: { type: 'string' } },
                        maxMatches: { type: 'integer' },
                    },
                },
                AgentStartRequest,
                AgentStartResponse,
                AgentStatusResponse,
                AgentLogsResponse,
                AgentListResponse,
                SimpleOk,
            },
        },
        paths: {
            '/grep': { post: { summary: 'Regex search across files' } },
            '/openapi.json': { get: { summary: 'OpenAPI spec' } },
            '/agent/start': {
                post: {
                    summary: 'Start a new agent process',
                    description:
                        'Launches a Codex CLI task under the AgentSupervisor. Optionally sandbox with nsjail and bypass Codex approvals.',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/AgentStartRequest' },
                                examples: {
                                    simple: {
                                        summary: 'Simple run',
                                        value: { prompt: 'ls -la' },
                                    },
                                    sandboxBypass: {
                                        summary: 'Run in Codex bypass mode (inside nsjail)',
                                        value: {
                                            prompt: 'npm run build',
                                            bypassApprovals: true,
                                            sandbox: 'nsjail',
                                        },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        200: {
                            description: 'Agent started successfully',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/AgentStartResponse' },
                                    examples: {
                                        ok: {
                                            summary: 'Started',
                                            value: {
                                                ok: true,
                                                id: 'agent_nX9z...',
                                                prompt: 'npm run build',
                                                startedAt: 1724201823456,
                                                sandbox: 'nsjail',
                                                bypassApprovals: true,
                                                logfile: '.logs/agent_nX9z.log',
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        500: {
                            description: 'Error',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/Error' },
                                },
                            },
                        },
                    },
                },
            },
            '/agent/status': {
                get: {
                    summary: 'Get agent status by query param id',
                    description: 'Returns metadata for a previously started agent.',
                    parameters: [
                        { in: 'query', name: 'id', required: true, schema: { type: 'string' } },
                    ],
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/AgentStatusResponse' },
                                    examples: {
                                        ok: {
                                            value: {
                                                ok: true,
                                                status: {
                                                    id: 'agent_nX9z...',
                                                    prompt: 'npm run build',
                                                    startedAt: 1724201823456,
                                                    exited: false,
                                                    logfile: '.logs/agent_nX9z.log',
                                                    sandbox: 'nsjail',
                                                    bypassApprovals: true,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        404: {
                            description: 'Not found',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/Error' },
                                },
                            },
                        },
                    },
                },
            },
            '/agent/status/{id}': {
                get: {
                    summary: 'Get agent status by path id',
                    description: 'Same as /agent/status, but using a path parameter.',
                    parameters: [
                        { in: 'path', name: 'id', required: true, schema: { type: 'string' } },
                    ],
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/AgentStatusResponse' },
                                },
                            },
                        },
                        404: {
                            description: 'Not found',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/Error' },
                                },
                            },
                        },
                    },
                },
            },
            '/agent/list': {
                get: {
                    summary: 'List running agents',
                    description: 'Returns IDs and sandbox mode for agents known to the supervisor.',
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/AgentListResponse' },
                                    examples: {
                                        ok: {
                                            value: {
                                                ok: true,
                                                agents: [
                                                    { id: 'agent_nX9z...', sandbox: 'nsjail' },
                                                ],
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            '/agent/logs': {
                get: {
                    summary: 'Get agent logs (tail bytes)',
                    description: 'Reads the trailing portion of the in-memory log buffer.',
                    parameters: [
                        { in: 'query', name: 'id', required: true, schema: { type: 'string' } },
                        {
                            in: 'query',
                            name: 'bytes',
                            required: false,
                            schema: { type: 'integer', default: 8192 },
                        },
                    ],
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/AgentLogsResponse' },
                                    examples: {
                                        ok: {
                                            value: {
                                                ok: true,
                                                total: 10240,
                                                chunk: '...last 8KB...',
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        404: {
                            description: 'Not found',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/Error' },
                                },
                            },
                        },
                    },
                },
            },
            '/agent/tail': {
                get: {
                    summary: 'Tail agent logs (bytes)',
                    description: 'Alias for /agent/logs; returns the last N bytes of log.',
                    parameters: [
                        { in: 'query', name: 'id', required: true, schema: { type: 'string' } },
                        {
                            in: 'query',
                            name: 'bytes',
                            required: false,
                            schema: { type: 'integer', default: 8192 },
                        },
                    ],
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/AgentLogsResponse' },
                                },
                            },
                        },
                        404: {
                            description: 'Not found',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/Error' },
                                },
                            },
                        },
                    },
                },
            },
            '/agent/stream': {
                get: {
                    summary: 'Stream agent logs via SSE',
                    description:
                        'Server-Sent Events stream. Emits an initial replay event and subsequent data events as the process writes output.',
                    parameters: [
                        { in: 'query', name: 'id', required: true, schema: { type: 'string' } },
                    ],
                    responses: {
                        200: {
                            description: 'SSE stream',
                            content: { 'text/event-stream': { schema: { type: 'string' } } },
                        },
                        400: { description: 'Bad request' },
                    },
                },
            },
            '/agent/send': {
                post: {
                    summary: 'Send input to agent stdin',
                    description: 'Writes a line to the PTY (appends a newline).',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['id', 'input'],
                                    properties: {
                                        id: { type: 'string' },
                                        input: { type: 'string' },
                                    },
                                },
                                examples: {
                                    simple: { value: { id: 'agent_nX9z...', input: 'y' } },
                                },
                            },
                        },
                    },
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/SimpleOk' },
                                },
                            },
                        },
                    },
                },
            },
            '/agent/kill': {
                post: {
                    summary: 'Kill an agent process',
                    description:
                        'Sends SIGTERM to the PTY child (or SIGKILL in older legacy path).',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['id'],
                                    properties: { id: { type: 'string' } },
                                },
                                examples: { simple: { value: { id: 'agent_nX9z...' } } },
                            },
                        },
                    },
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/SimpleOk' },
                                },
                            },
                        },
                    },
                },
            },
            '/agent/interrupt': {
                post: {
                    summary: 'Send interrupt (Ctrl-C) to agent',
                    description: 'Emulates Ctrl-C by writing \u0003 to the PTY.',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['id'],
                                    properties: { id: { type: 'string' } },
                                },
                                examples: { simple: { value: { id: 'agent_nX9z...' } } },
                            },
                        },
                    },
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/SimpleOk' },
                                },
                            },
                        },
                    },
                },
            },
            '/agent/resume': {
                post: {
                    summary: 'Resume a paused agent (not supported)',
                    description: 'Not supported by PTY supervisor; returns not_supported.',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['id'],
                                    properties: { id: { type: 'string' } },
                                },
                                examples: { simple: { value: { id: 'agent_nX9z...' } } },
                            },
                        },
                    },
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/SimpleOk' },
                                },
                            },
                        },
                    },
                },
            },
        },
    };
}
