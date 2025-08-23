import Fastify from 'fastify';
import path from 'path';
import { fileURLToPath } from 'url';
import fastifyStatic from '@fastify/static';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import ajvformats from 'ajv-formats';

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
                apiKey: {
                    type: 'apiKey',
                    name: 'x-pi-token',
                    in: 'header',
                },
            },
        };
        swaggerOpts.openapi.security = [{ apiKey: [] }];
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
    // Protected routes
    app.register(async (f) => {
        if (authEnabled) f.addHook('onRequest', f.authUser);
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
