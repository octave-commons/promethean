import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { UserContext } from '../auth/types.js';

/**
 * REST API response types
 */
export interface RestResponse<T = any> {
  data: T;
  meta: {
    timestamp: string;
    requestId: string;
    version: string;
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
  };
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Query filter options
 */
export interface QueryFilter {
  search?: string;
  fields?: string[];
  filters?: Record<string, any>;
}

/**
 * REST route handler options
 */
export interface RestRouteOptions {
  permissions?: Array<{
    resource: string;
    actions: string[];
  }>;
  roles?: string[];
  requireAuth?: boolean;
}

/**
 * Mock data store for demonstration
 * In production, this would be replaced with actual database calls
 */
class MockDataStore {
  private data: Map<string, any[]> = new Map();

  constructor() {
    // Initialize with some mock data
    this.data.set('users', [
      {
        id: '1',
        name: 'Alice',
        email: 'alice@example.com',
        role: 'user',
        createdAt: '2025-06-20T00:00:00Z',
      },
      {
        id: '2',
        name: 'Bob',
        email: 'bob@example.com',
        role: 'admin',
        createdAt: '2025-06-20T01:00:00Z',
      },
      {
        id: '3',
        name: 'Charlie',
        email: 'charlie@example.com',
        role: 'user',
        createdAt: '2025-06-20T02:00:00Z',
      },
    ]);

    this.data.set('posts', [
      {
        id: '1',
        title: 'First Post',
        content: 'This is the first post',
        authorId: '1',
        status: 'published',
        createdAt: '2025-06-20T12:00:00Z',
      },
      {
        id: '2',
        title: 'Second Post',
        content: 'This is the second post',
        authorId: '2',
        status: 'draft',
        createdAt: '2025-06-20T13:00:00Z',
      },
      {
        id: '3',
        title: 'Third Post',
        content: 'This is the third post',
        authorId: '1',
        status: 'published',
        createdAt: '2025-06-20T14:00:00Z',
      },
    ]);
  }

  findAll(collection: string, options: QueryFilter & PaginationOptions = {}): any[] {
    let items = this.data.get(collection) || [];

    // Apply filters
    if (options.filters) {
      items = items.filter((item) => {
        return Object.entries(options.filters || {}).every(([key, value]) => {
          return item[key] === value;
        });
      });
    }

    // Apply search
    if (options.search) {
      const searchLower = options.search.toLowerCase();
      items = items.filter((item) =>
        Object.values(item).some((val) => String(val).toLowerCase().includes(searchLower)),
      );
    }

    // Apply field selection
    if (options.fields && options.fields.length > 0) {
      items = items.map((item) => {
        const filtered: any = {};
        options.fields!.forEach((field) => {
          if (field in item) {
            filtered[field] = item[field];
          }
        });
        return filtered;
      });
    }

    // Apply sorting
    if (options.sortBy) {
      items = items.sort((a, b) => {
        const aVal = a[options.sortBy!];
        const bVal = b[options.sortBy!];

        if (options.sortOrder === 'desc') {
          return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
        }
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      });
    }

    // Apply pagination
    const page = options.page || 1;
    const limit = options.limit || 10;
    const startIndex = (page - 1) * limit;

    return items.slice(startIndex, startIndex + limit);
  }

  findById(collection: string, id: string): any {
    const items = this.data.get(collection) || [];
    return items.find((item) => item.id === id);
  }

  create(collection: string, data: any): any {
    const items = this.data.get(collection) || [];
    const newItem = {
      ...data,
      id: String(Math.max(...items.map((item) => parseInt(item.id) || 0), 0) + 1),
      createdAt: new Date().toISOString(),
    };
    items.push(newItem);
    this.data.set(collection, items);
    return newItem;
  }

  update(collection: string, id: string, data: any): any {
    const items = this.data.get(collection) || [];
    const index = items.findIndex((item) => item.id === id);

    if (index === -1) return null;

    items[index] = {
      ...items[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    this.data.set(collection, items);
    return items[index];
  }

  delete(collection: string, id: string): boolean {
    const items = this.data.get(collection) || [];
    const index = items.findIndex((item) => item.id === id);

    if (index === -1) return false;

    items.splice(index, 1);
    this.data.set(collection, items);
    return true;
  }

  count(collection: string, options: QueryFilter = {}): number {
    let items = this.data.get(collection) || [];

    // Apply same filters as findAll for accurate count
    if (options.filters) {
      items = items.filter((item) => {
        return Object.entries(options.filters || {}).every(([key, value]) => {
          return item[key] === value;
        });
      });
    }

    if (options.search) {
      const searchLower = options.search.toLowerCase();
      items = items.filter((item) =>
        Object.values(item).some((val) => String(val).toLowerCase().includes(searchLower)),
      );
    }

    return items.length;
  }
}

/**
 * Create REST API response with metadata
 */
function createResponse<T>(
  data: T,
  request: FastifyRequest,
  meta: Partial<RestResponse<T>['meta']> = {},
): RestResponse<T> {
  return {
    data,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: request.id,
      version: 'v1',
      ...meta,
    },
  };
}

/**
 * Get pagination metadata
 */
function getPaginationMetadata(
  total: number,
  page: number,
  limit: number,
  requestId: string,
): RestResponse['meta'] {
  return {
    timestamp: new Date().toISOString(),
    requestId,
    version: 'v1',
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page * limit < total,
    hasPrevPage: page > 1,
  };
}

/**
 * Mount REST API routes
 */
export function mountRestAdapter(
  app: FastifyInstance,
  options: {
    prefix: string;
    version: string;
    authManager?: any;
    enableDocs?: boolean;
  } = {
    prefix: '/api',
    version: 'v1',
    enableDocs: true,
  },
) {
  const dataStore = new MockDataStore();
  const fullPrefix = `${options.prefix}/${options.version}`;

  // Request ID generation
  app.addHook('preHandler', (request, _reply, done) => {
    request.id = request.id || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    done();
  });

  /**
   * Generic route handler for authentication and authorization
   */
  const createHandler = (
    handler: (request: FastifyRequest, reply: FastifyReply, user?: UserContext) => Promise<any>,
    routeOptions: RestRouteOptions = {},
  ) => {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        // Check authentication if required
        if (routeOptions.requireAuth !== false) {
          if (!request.user) {
            return reply.status(401).send({
              error: 'Authentication required',
              message: 'No authentication context found',
              requestId: request.id,
            });
          }

          // Check roles if specified
          if (routeOptions.roles && routeOptions.roles.length > 0) {
            const authManager = options.authManager;
            if (authManager) {
              const hasRequiredRole = authManager
                .getRBACManager()
                .hasAnyRole(request.user.id, request.user.roles, routeOptions.roles);

              if (!hasRequiredRole) {
                return reply.status(403).send({
                  error: 'Insufficient permissions',
                  message: `Required roles: ${routeOptions.roles.join(', ')}`,
                  requestId: request.id,
                });
              }
            }
          }

          // Check permissions if specified
          if (routeOptions.permissions && routeOptions.permissions.length > 0) {
            const authManager = options.authManager;
            if (authManager) {
              for (const perm of routeOptions.permissions) {
                const hasPermission = authManager
                  .getRBACManager()
                  .hasAnyPermission(
                    request.user.id,
                    request.user.roles,
                    perm.resource,
                    perm.actions,
                  );

                if (!hasPermission.granted) {
                  return reply.status(403).send({
                    error: 'Insufficient permissions',
                    message: hasPermission.reason,
                    required: hasPermission.requiredPermission,
                    requestId: request.id,
                  });
                }
              }
            }
          }
        }

        // Call the handler with user context if available
        const result = await handler(request, reply, request.user);

        return result;
      } catch (error) {
        (app.log.error as any)(`REST API Error (${request.id}):`, error);

        return reply.status(500).send({
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
          requestId: request.id,
        });
      }
    };
  };

  // Health check for REST API
  app.get(
    `${fullPrefix}/health`,
    createHandler(async (request, reply) => {
      const healthStatus = {
        status: 'ok',
        adapter: 'rest',
        version: options.version,
        collections: {
          users: dataStore.findAll('users').length,
          posts: dataStore.findAll('posts').length,
        },
        timestamp: new Date().toISOString(),
      };

      return reply.send(createResponse(healthStatus, request));
    }),
  );

  // List resources (GET /api/v1/:resource)
  app.get(
    `${fullPrefix}/:resource`,
    createHandler(
      async (request, reply) => {
        const { resource } = request.params as { resource: string };
        const query = request.query as QueryFilter & PaginationOptions;

        const page = parseInt(String(query.page)) || 1;
        const limit = parseInt(String(query.limit)) || 10;

        const items = dataStore.findAll(resource, { ...query, page, limit });
        const total = dataStore.count(resource, { search: query.search, filters: query.filters });

        const response = createResponse(
          items,
          request,
          getPaginationMetadata(total, page, limit, request.id),
        );

        return reply.send(response);
      },
      { requireAuth: true },
    ),
  );

  // Get single resource (GET /api/v1/:resource/:id)
  app.get(
    `${fullPrefix}/:resource/:id`,
    createHandler(
      async (request, reply) => {
        const { resource, id } = request.params as { resource: string; id: string };

        const item = dataStore.findById(resource, id);

        if (!item) {
          return reply.status(404).send(
            createResponse(
              {
                error: 'Not found',
                message: `No ${resource} found with id: ${id}`,
              },
              request,
            ),
          );
        }

        return reply.send(createResponse(item, request));
      },
      { requireAuth: true },
    ),
  );

  // Create resource (POST /api/v1/:resource)
  app.post(
    `${fullPrefix}/:resource`,
    createHandler(
      async (request, reply) => {
        const { resource } = request.params as { resource: string };
        const body = request.body as any;

        const newItem = dataStore.create(resource, body);

        return reply.status(201).send(createResponse(newItem, request));
      },
      {
        requireAuth: true,
        permissions: [{ resource: ':resource:*', actions: ['write'] }],
      },
    ),
  );

  // Update resource (PUT /api/v1/:resource/:id)
  app.put(
    `${fullPrefix}/:resource/:id`,
    createHandler(
      async (request, reply) => {
        const { resource, id } = request.params as { resource: string; id: string };
        const body = request.body as any;

        const updatedItem = dataStore.update(resource, id, body);

        if (!updatedItem) {
          return reply.status(404).send(
            createResponse(
              {
                error: 'Not found',
                message: `No ${resource} found with id: ${id}`,
              },
              request,
            ),
          );
        }

        return reply.send(createResponse(updatedItem, request));
      },
      {
        requireAuth: true,
        permissions: [{ resource: ':resource:*', actions: ['write'] }],
      },
    ),
  );

  // Delete resource (DELETE /api/v1/:resource/:id)
  app.delete(
    `${fullPrefix}/:resource/:id`,
    createHandler(
      async (request, reply) => {
        const { resource, id } = request.params as { resource: string; id: string };

        const deleted = dataStore.delete(resource, id);

        if (!deleted) {
          return reply.status(404).send(
            createResponse(
              {
                error: 'Not found',
                message: `No ${resource} found with id: ${id}`,
              },
              request,
            ),
          );
        }

        return reply.status(204).send();
      },
      {
        requireAuth: true,
        permissions: [{ resource: ':resource:*', actions: ['delete'] }],
      },
    ),
  );

  // Special routes for users
  app.get(
    `${fullPrefix}/users/me`,
    createHandler(
      async (request, reply) => {
        const user = request.user;

        if (!user) {
          return reply.status(401).send(
            createResponse(
              {
                error: 'Not authenticated',
                message: 'No user context found',
              },
              request,
            ),
          );
        }

        return reply.send(
          createResponse(
            {
              id: user.id,
              username: user.username,
              email: user.email,
              roles: user.roles,
              tokenType: user.tokenType,
              permissions: Array.from(user.permissions),
            },
            request,
          ),
        );
      },
      { requireAuth: true },
    ),
  );

  // Schema information
  app.get(
    `${fullPrefix}/schema`,
    createHandler(async (request, reply) => {
      const schemas = {
        users: {
          id: 'string',
          name: 'string',
          email: 'string',
          role: 'string',
          createdAt: 'string',
          updatedAt: 'string',
        },
        posts: {
          id: 'string',
          title: 'string',
          content: 'string',
          authorId: 'string',
          status: 'string',
          createdAt: 'string',
          updatedAt: 'string',
        },
      };

      return reply.send(createResponse(schemas, request));
    }),
  );

  // API documentation if enabled
  if (options.enableDocs) {
    app.get(
      `${fullPrefix}/docs`,
      createHandler(
        async (request, reply) => {
          const docs = {
            title: 'REST API Documentation',
            version: options.version,
            baseUrl: fullPrefix,
            description: 'REST API for the Omni Service with authentication and authorization',
            endpoints: {
              users: {
                list: `GET ${fullPrefix}/users`,
                get: `GET ${fullPrefix}/users/{id}`,
                create: `POST ${fullPrefix}/users`,
                update: `PUT ${fullPrefix}/users/{id}`,
                delete: `DELETE ${fullPrefix}/users/{id}`,
                me: `GET ${fullPrefix}/users/me`,
              },
              posts: {
                list: `GET ${fullPrefix}/posts`,
                get: `GET ${fullPrefix}/posts/{id}`,
                create: `POST ${fullPrefix}/posts`,
                update: `PUT ${fullPrefix}/posts/{id}`,
                delete: `DELETE ${fullPrefix}/posts/{id}`,
              },
              health: `GET ${fullPrefix}/health`,
              schema: `GET ${fullPrefix}/schema`,
              docs: `GET ${fullPrefix}/docs`,
            },
            authentication: {
              type: 'JWT Bearer Token',
              header: 'Authorization: Bearer <token>',
              apikey: 'x-api-key: <key>',
            },
            responses: {
              success: {
                code: 200,
                structure: {
                  data: 'response data',
                  meta: {
                    timestamp: 'ISO timestamp',
                    requestId: 'unique request identifier',
                    version: 'api version',
                  },
                },
              },
              error: {
                code: 400 | 401 | 403 | 404 | 500,
                structure: {
                  error: 'error type',
                  message: 'error description',
                  requestId: 'unique request identifier',
                },
              },
            },
            examples: {
              listUsers: {
                method: 'GET',
                url: `${fullPrefix}/users?page=1&limit=10`,
                headers: {
                  Authorization: 'Bearer <jwt_token>',
                },
                response: {
                  data: [
                    {
                      id: '1',
                      name: 'Alice',
                      email: 'alice@example.com',
                      role: 'user',
                    },
                  ],
                  meta: {
                    timestamp: '2025-06-20T18:45:00.000Z',
                    requestId: 'req_123456789',
                    version: 'v1',
                    total: 3,
                    page: 1,
                    limit: 10,
                  },
                },
              },
            },
          };

          return reply.send(createResponse(docs, request));
        },
        { requireAuth: false },
      ),
    );
  }

  app.log.info(`REST API mounted at ${fullPrefix}`);
}
