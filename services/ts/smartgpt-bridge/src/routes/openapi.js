export function registerOpenApiRoutes(fastify, { spec }) {
    fastify.get('/openapi.json', async (_req, reply) => {
        reply.send(spec());
    });
}
