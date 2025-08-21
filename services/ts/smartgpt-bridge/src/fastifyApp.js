import Fastify from 'fastify';
import path from 'path';
import { fileURLToPath } from 'url';

import { indexerManager } from './indexer.js';
import { restoreAgentsFromStore } from './agent.js';
import { createFastifyAuth } from './fastifyAuth.js';
import { spec } from './spec.js';

// Route plugins
import { registerOpenApiRoutes } from './routes/openapi.js';
import { registerFilesRoutes } from './routes/files.js';
import { registerSearchRoutes } from './routes/search.js';
import { registerIndexerRoutes } from './routes/indexer.js';
import { registerGrepRoutes } from './routes/grep.js';
import { registerSymbolsRoutes } from './routes/symbols.js';
import { registerAgentRoutes } from './routes/agent.js';
import { registerExecRoutes } from './routes/exec.js';

export function buildFastifyApp(ROOT_PATH) {
    const app = Fastify({ logger: false });
    app.decorate('ROOT_PATH', ROOT_PATH);

    // /openapi.json is public
    app.register(async (f) => {
        registerOpenApiRoutes(f, { spec });
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
    });

    // Initialize indexer bootstrap/incremental state unless in test
    if ((process.env.NODE_ENV || '').toLowerCase() !== 'test') {
        indexerManager.ensureBootstrap(ROOT_PATH).catch(() => {});
        const restoreAllowed = String(process.env.AGENT_RESTORE_ON_START || 'true') !== 'false';
        if (restoreAllowed) restoreAgentsFromStore().catch(() => {});
    }

    return app;
}
