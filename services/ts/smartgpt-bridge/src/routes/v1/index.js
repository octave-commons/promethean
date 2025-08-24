import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { registerFilesRoutes } from './files.js';
import { registerSearchRoutes } from './search.js';
import { registerSinkRoutes } from './sinks.js';
import { registerIndexerRoutes } from './indexer.js';
import { registerAgentRoutes } from './agents.js';
import { registerExecRoutes } from './exec.js';

export async function registerV1Routes(app) {
    // Everything defined here will be reachable under /v1 because of the prefix in fastifyApp.js
    await app.register(async function v1(v1) {
        // Swagger JUST for v1 (encapsulation keeps it scoped)
        const baseUrl =
            process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 3210}`;
        const authEnabled = String(process.env.AUTH_ENABLED || 'false').toLowerCase() === 'true';
        const swaggerOpts = {
            openapi: {
                openapi: '3.1.0',
                info: { title: 'Promethean SmartGPT Bridge — v1', version: '1.1.0' },
                servers: [{ url: baseUrl }],
            },
            exposeRoute: true,
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
        await v1.register(swagger, swaggerOpts);

        await v1.register(swaggerUi, {
            routePrefix: '/docs',
            uiConfig: { docExpansion: 'list' },
        });

        // expose the generated v1 spec
        v1.get('/openapi.json', { schema: { hide: true } }, async (_req, reply) => {
            reply.type('application/json').send(v1.swagger());
        });

        registerFilesRoutes(v1);
        registerSearchRoutes(v1);
        registerSinkRoutes(v1);
        registerIndexerRoutes(v1);
        registerAgentRoutes(v1);
        registerExecRoutes(v1);
    });
}
