import Fastify from 'fastify';
import path from 'path';
import { fileURLToPath } from 'url';
import fastifyStatic from '@fastify/static';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import ajvformats from 'ajv-formats';
import { createFastifyAuth } from './fastifyAuth.js';

import { indexerManager } from './indexer.js';
import { restoreAgentsFromStore } from './agent.js';
import { registerSinks } from './sinks.js';
import { registerRbac } from './rbac.js';

// Route plugins
import { registerFilesRoutes } from './routes/files.js';
import { registerSearchRoutes } from './routes/search.js';
import { registerIndexerRoutes } from './routes/indexer.js';
import { registerGrepRoutes } from './routes/grep.js';
import { registerSymbolsRoutes } from './routes/symbols.js';
import { registerAgentRoutes } from './routes/agent.js';
import { registerExecRoutes } from './routes/exec.js';
import { registerSinkRoutes } from './routes/sinks.js';
import { registerUserRoutes } from './routes/users.js';
import { registerPolicyRoutes } from './routes/policies.js';
import { registerBootstrapRoutes } from './routes/bootstrap.js';
import { registerV1Routes } from './routes/v1.js';
import { mongoChromaLogger } from './logging/index.js';

export function buildFastifyApp(ROOT_PATH) {
    registerSinks();
    const app = Fastify({
        logger: false,
        trustProxy: true,
        ajv: {
            customOptions: { allowUnionTypes: true },
            plugins: [ajvformats],
        },
    });
    app.decorate('ROOT_PATH', ROOT_PATH);
    app.register(mongoChromaLogger);

    // Schemas used across routes
    app.addSchema({
        $id: 'GrepRequest',
        type: 'object',
        required: ['pattern'],
        properties: {
            pattern: { type: 'string' },
            flags: { type: 'string', default: 'g' },
            paths: {
                type: 'array',
                items: { type: 'string' },
                default: ['**/*.{ts,tsx,js,jsx,py,go,rs,md,txt,json,yml,yaml,sh}'],
            },
            maxMatches: { type: 'integer', default: 200 },
            context: { type: 'integer', default: 2 },
        },
    });

    app.addSchema({
        $id: 'GrepResult',
        type: 'object',
        required: ['path', 'line', 'column', 'lineText', 'snippet', 'startLine', 'endLine'],
        properties: {
            path: { type: 'string' },
            line: { type: 'integer' },
            column: { type: 'integer' },
            lineText: { type: 'string' },
            snippet: { type: 'string' },
            startLine: { type: 'integer' },
            endLine: { type: 'integer' },
        },
        additionalProperties: false,
    });

    app.addSchema({
        $id: 'SearchResult',
        type: 'object',
        required: ['id', 'path', 'chunkIndex', 'startLine', 'endLine', 'text'],
        properties: {
            id: { type: 'string' },
            path: { type: 'string' },
            chunkIndex: { type: 'integer' },
            startLine: { type: 'integer' },
            endLine: { type: 'integer' },
            score: { type: ['number', 'null'] },
            text: { type: 'string' },
        },
        additionalProperties: false,
    });

    app.addSchema({
        $id: 'SymbolResult',
        type: 'object',
        required: ['path', 'name', 'kind', 'startLine', 'endLine'],
        properties: {
            path: { type: 'string' },
            name: { type: 'string' },
            kind: { type: 'string' },
            startLine: { type: 'integer' },
            endLine: { type: 'integer' },
            signature: { type: 'string' },
        },
        additionalProperties: false,
    });

    app.addSchema({
        $id: 'FileTreeNode',
        type: 'object',
        required: ['name', 'path', 'type'],
        properties: {
            name: { type: 'string' },
            path: { type: 'string' },
            type: { type: 'string', enum: ['dir', 'file'] },
            size: { type: ['integer', 'null'] },
            mtimeMs: { type: ['number', 'null'] },
            children: { type: 'array', items: { $ref: 'FileTreeNode#' } },
        },
        additionalProperties: false,
    });

    app.addSchema({
        $id: 'StacktraceResult',
        type: 'object',
        required: ['path', 'line', 'resolved'],
        properties: {
            path: { type: 'string' },
            line: { type: 'integer' },
            column: { type: ['integer', 'null'] },
            resolved: { type: 'boolean' },
            relPath: { type: 'string' },
            startLine: { type: 'integer' },
            endLine: { type: 'integer' },
            focusLine: { type: 'integer' },
            snippet: { type: 'string' },
        },
        additionalProperties: false,
    });

    const baseUrl = process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 3210}`;
    const auth = createFastifyAuth();
    if (auth.enabled) {
        app.addHook('onRequest', auth.preHandler);
    }
    auth.registerRoutes(app);

    const schemas = {
        GrepRequest: app.getSchema('GrepRequest'),
        GrepResult: app.getSchema('GrepResult'),
        SearchResult: app.getSchema('SearchResult'),
        SymbolResult: app.getSchema('SymbolResult'),
        FileTreeNode: app.getSchema('FileTreeNode'),
        StacktraceResult: app.getSchema('StacktraceResult'),
    };
    const swaggerOpts = {
        openapi: {
            openapi: '3.1.0',
            info: { title: 'Promethean SmartGPT Bridge', version: '1.0.0' },
            servers: [{ url: baseUrl }],
            components: { schemas },
        },
    };
    if (auth.enabled) {
        swaggerOpts.openapi.components.securitySchemes = {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
            },
        };
        swaggerOpts.openapi.security = [{ bearerAuth: [] }];
    }

    app.register(swagger, swaggerOpts);
    app.register(swaggerUi, { routePrefix: '/docs' });

    app.get('/openapi.json', async (_req, rep) => rep.type('application/json').send(app.swagger()));

    // Serve static dashboard from /public at root
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    app.register(fastifyStatic, {
        root: path.join(__dirname, '../public'),
        prefix: '/',
        // index.html served at '/'
    });

    // Convenience alias to open dashboard explicitly
    app.get('/dashboard', async (_req, reply) => {
        reply.header('Cache-Control', 'no-cache');
        return reply.sendFile('index.html');
    });

    registerRbac(app);
    registerBootstrapRoutes(app);

    app.register(registerV1Routes, { prefix: '/v1' });
    // Main application routes
    app.register(async (f) => {
        registerFilesRoutes(f);
        registerGrepRoutes(f);
        registerSymbolsRoutes(f);
        registerSearchRoutes(f);
        registerIndexerRoutes(f);
        registerAgentRoutes(f);
        registerExecRoutes(f);
        registerSinkRoutes(f);
        registerUserRoutes(f);
        registerPolicyRoutes(f);
    });

    // Initialize indexer bootstrap/incremental state unless in test
    if ((process.env.NODE_ENV || '').toLowerCase() !== 'test') {
        indexerManager.ensureBootstrap(ROOT_PATH).catch(() => {});
        const restoreAllowed = String(process.env.AGENT_RESTORE_ON_START || 'true') !== 'false';
        if (restoreAllowed) restoreAgentsFromStore().catch(() => {});
    }

    return app;
}
