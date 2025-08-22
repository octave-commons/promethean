import Fastify from 'fastify';
import path from 'path';
import { fileURLToPath } from 'url';
import fastifyStatic from '@fastify/static';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

import { indexerManager } from './indexer.js';
import { restoreAgentsFromStore } from './agent.js';
import { createFastifyAuth } from './fastifyAuth.js';
import { registerSinks } from './sinks.js';

// Route plugins
import { registerFilesRoutes } from './routes/files.js';
import { registerSearchRoutes } from './routes/search.js';
import { registerIndexerRoutes } from './routes/indexer.js';
import { registerGrepRoutes } from './routes/grep.js';
import { registerSymbolsRoutes } from './routes/symbols.js';
import { registerAgentRoutes } from './routes/agent.js';
import { registerExecRoutes } from './routes/exec.js';
import { registerSinkRoutes } from './routes/sinks.js';
import { mongoChromaLogger } from './logging/index.js';

export function buildFastifyApp(ROOT_PATH) {
    registerSinks();
    const app = Fastify({ logger: false, trustProxy: true });
    app.decorate('ROOT_PATH', ROOT_PATH);
    app.register(mongoChromaLogger);

    const baseUrl = process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 3210}`;
    const authEnabled = String(process.env.AUTH_ENABLED || 'false').toLowerCase() === 'true';

    const swaggerOpts = {
        openapi: {
            openapi: '3.1.0',
            info: { title: 'Promethean SmartGPT Bridge', version: '1.0.0' },
            servers: [{ url: baseUrl }],
        },
    };
    if (authEnabled) {
        swaggerOpts.openapi.components = {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
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

    // Auth: mount /auth/me, and protect subsequent scopes
    const auth = createFastifyAuth();
    app.register(async (f) => {
        auth.registerRoutes(f);
    });

    // Protected routes
    app.register(async (f) => {
        if (auth.enabled) f.addHook('onRequest', auth.preHandler);
        registerFilesRoutes(f);
        registerGrepRoutes(f);
        registerSymbolsRoutes(f);
        registerSearchRoutes(f);
        registerIndexerRoutes(f);
        registerAgentRoutes(f);
        registerExecRoutes(f);
        registerSinkRoutes(f);
    });

    // Initialize indexer bootstrap/incremental state unless in test
    if ((process.env.NODE_ENV || '').toLowerCase() !== 'test') {
        indexerManager.ensureBootstrap(ROOT_PATH).catch(() => {});
        const restoreAllowed = String(process.env.AGENT_RESTORE_ON_START || 'true') !== 'false';
        if (restoreAllowed) restoreAgentsFromStore().catch(() => {});
    }

    return app;
}
