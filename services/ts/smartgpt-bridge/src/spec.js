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
        tags: [
            { name: 'Agent', description: 'Start/monitor background Codex agents' },
            { name: 'Search', description: 'Code/document search utilities' },
            { name: 'System', description: 'Service metadata and docs' },
            { name: 'Files', description: 'File browsing and stacktrace tools' },
            { name: 'Indexer', description: 'Index maintenance and status' },
            { name: 'Symbols', description: 'TypeScript/JS symbol index and lookup' },
            { name: 'Exec', description: 'Run commands (disabled by default)' },
        ],
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
            '/grep': { post: { summary: 'Regex search across files', tags: ['Search'] } },
            '/search': {
                post: {
                    summary: 'Semantic search',
                    tags: ['Search'],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['q'],
                                    properties: {
                                        q: { type: 'string' },
                                        n: { type: 'integer', default: 8 },
                                    },
                                },
                                examples: {
                                    simple: { value: { q: 'find agent routes', n: 8 } },
                                },
                            },
                        },
                    },
                    responses: {
                        200: {
                            description: 'OK',
                            content: { 'application/json': { schema: { type: 'object' } } },
                        },
                    },
                },
            },
            '/files/list': {
                get: {
                    summary: 'List directory',
                    tags: ['Files'],
                    parameters: [
                        {
                            in: 'query',
                            name: 'path',
                            required: false,
                            schema: { type: 'string', default: '.' },
                        },
                        {
                            in: 'query',
                            name: 'hidden',
                            required: false,
                            schema: { type: 'boolean', default: false },
                        },
                        {
                            in: 'query',
                            name: 'type',
                            required: false,
                            schema: { type: 'string', enum: ['file', 'dir'] },
                        },
                    ],
                    responses: {
                        200: {
                            description: 'OK',
                            content: { 'application/json': { schema: { type: 'object' } } },
                        },
                    },
                },
            },
            '/files/view': {
                get: {
                    summary: 'View file with context',
                    tags: ['Files'],
                    parameters: [
                        { in: 'query', name: 'path', required: true, schema: { type: 'string' } },
                        {
                            in: 'query',
                            name: 'line',
                            required: false,
                            schema: { type: 'integer', default: 1 },
                        },
                        {
                            in: 'query',
                            name: 'context',
                            required: false,
                            schema: { type: 'integer', default: 25 },
                        },
                    ],
                    responses: {
                        200: {
                            description: 'OK',
                            content: { 'application/json': { schema: { type: 'object' } } },
                        },
                        404: { description: 'Not found' },
                    },
                },
            },
            '/stacktrace/locate': {
                post: {
                    summary: 'Locate stack trace frames in repo',
                    tags: ['Files'],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        text: { type: 'string' },
                                        context: { type: 'integer', default: 25 },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        200: {
                            description: 'OK',
                            content: { 'application/json': { schema: { type: 'object' } } },
                        },
                    },
                },
            },
            '/reindex': { post: { summary: 'Reindex all files', tags: ['Indexer'] } },
            '/files/reindex': {
                post: {
                    summary: 'Reindex subset of files by glob',
                    tags: ['Indexer'],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['path'],
                                    properties: {
                                        path: {
                                            oneOf: [
                                                { type: 'string' },
                                                { type: 'array', items: { type: 'string' } },
                                            ],
                                        },
                                    },
                                },
                            },
                        },
                    },
                    responses: { 200: { description: 'OK' } },
                },
            },
            '/indexer/status': { get: { summary: 'Indexer status', tags: ['Indexer'] } },
            '/indexer/index': {
                post: {
                    summary: 'Index single file',
                    tags: ['Indexer'],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['path'],
                                    properties: { path: { type: 'string' } },
                                },
                            },
                        },
                    },
                    responses: { 200: { description: 'OK' } },
                },
            },
            '/indexer/remove': {
                post: {
                    summary: 'Remove file from index',
                    tags: ['Indexer'],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['path'],
                                    properties: { path: { type: 'string' } },
                                },
                            },
                        },
                    },
                    responses: { 200: { description: 'OK' } },
                },
            },
            '/indexer/reset': { post: { summary: 'Reset index and bootstrap', tags: ['Indexer'] } },
            '/symbols/index': {
                post: {
                    summary: 'Build TS/JS symbol index',
                    tags: ['Symbols'],
                    requestBody: {
                        required: false,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        paths: { type: 'array', items: { type: 'string' } },
                                        exclude: { type: 'array', items: { type: 'string' } },
                                    },
                                },
                            },
                        },
                    },
                    responses: { 200: { description: 'OK' } },
                },
            },
            '/symbols/find': {
                post: {
                    summary: 'Find symbols',
                    tags: ['Symbols'],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['query'],
                                    properties: {
                                        query: { type: 'string' },
                                        kind: { type: 'string' },
                                        path: { type: 'string' },
                                        limit: { type: 'integer' },
                                    },
                                },
                            },
                        },
                    },
                    responses: { 200: { description: 'OK' } },
                },
            },
            '/exec/run': {
                post: {
                    summary: 'Run a command (if enabled)',
                    tags: ['Exec'],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['command'],
                                    properties: {
                                        command: { type: 'string' },
                                        cwd: { type: 'string' },
                                        env: {
                                            type: 'object',
                                            additionalProperties: { type: 'string' },
                                        },
                                        timeoutMs: { type: 'integer' },
                                        tty: { type: 'boolean' },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        200: { description: 'OK' },
                        403: { description: 'Exec disabled' },
                    },
                },
            },
            '/openapi.json': { get: { summary: 'OpenAPI spec', tags: ['System'] } },
            '/agent/start': {
                post: {
                    summary: 'Start a new agent process',
                    tags: ['Agent'],
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
                    tags: ['Agent'],
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
                    tags: ['Agent'],
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
                    tags: ['Agent'],
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
                    tags: ['Agent'],
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
                    tags: ['Agent'],
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
                    tags: ['Agent'],
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
                    tags: ['Agent'],
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
                    tags: ['Agent'],
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
                    tags: ['Agent'],
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
                    tags: ['Agent'],
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
