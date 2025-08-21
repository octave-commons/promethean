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
            },
        },
        paths: {
            '/grep': { post: { summary: 'Regex search across files' } },
            '/openapi.json': { get: { summary: 'OpenAPI spec' } },
        },
    };
}
