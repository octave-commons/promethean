import Fastify from 'fastify';
import path from 'path';
import { fileURLToPath } from 'url';
import fastifyStatic from '@fastify/static';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import ajvformats from 'ajv-formats';
import { createFastifyAuth } from './fastifyAuth.js';
import { registerV0Routes } from './routes/v0/index.js';

import { indexerManager } from './indexer.js';
import { restoreAgentsFromStore } from './agent.js';
import { registerSinks } from './sinks.js';
import { registerRbac } from './rbac.js';
import { registerV1Routes } from './routes/v1/index.js';
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

    // New: child node without `children`
    app.addSchema({
        $id: 'FileTreeNodeChild',
        type: 'object',
        required: ['name', 'path', 'type'],
        properties: {
            name: { type: 'string' },
            path: { type: 'string' },
            type: { type: 'string', enum: ['dir', 'file'] },
            size: { type: ['integer', 'null'] },
            mtimeMs: { type: ['number', 'null'] },
        },
        additionalProperties: false,
    });

    // Main node: children use the non-recursive child
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
            children: {
                type: 'array',
                items: { $ref: 'FileTreeNodeChild#' },
            },
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
    // Register new-auth helper endpoint at root for dashboard compatibility
    const auth = createFastifyAuth();
    auth.registerRoutes(app); // adds /auth/me; protection handled inside

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

                name: 'x-pi-token',
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

    // Mount legacy routes under /v0 with old auth scoped inside
    app.register(
        async (v0) => {
            await registerV0Routes(v0);
        },
        { prefix: '/v0' },
    );

    // Mount v1 routes with new auth scoped to /v1
    app.register(
        async (v1Scope) => {
            const v1Auth = createFastifyAuth();
            if (v1Auth.enabled) v1Scope.addHook('onRequest', v1Auth.preHandler);
            await registerV1Routes(v1Scope);
        },
        { prefix: '/v1' },
    );

    // Initialize indexer bootstrap/incremental state unless in test
    if ((process.env.NODE_ENV || '').toLowerCase() !== 'test') {
        indexerManager.ensureBootstrap(ROOT_PATH).catch(() => {});
        const restoreAllowed = String(process.env.AGENT_RESTORE_ON_START || 'true') !== 'false';
        if (restoreAllowed) restoreAgentsFromStore().catch(() => {});
    }

    return app;
}
