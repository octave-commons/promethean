import { fastify, FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";

import type { EnhancedOmniServiceConfig } from "./config.js";
import { config, getAuthConfig, ConfigValidator } from "./config.js";
import { createAuthManager, addAuthRoutes } from "./app.js";

/**
 * Create and configure the Fastify app instance for the Omni Service
 * Includes all necessary plugins, middleware, and route setup with authentication
 */
export function createApp(appConfig: EnhancedOmniServiceConfig = config): FastifyInstance {
  // Validate configuration
  const adapterValidation = ConfigValidator.validateAdapters(appConfig.adapters);
  if (!adapterValidation.valid) {
    throw new Error(`Adapter configuration invalid: ${adapterValidation.errors.join(", ")}`);
  }

  const rateLimitValidation = ConfigValidator.validateRateLimiting(appConfig.rateLimit);
  if (!rateLimitValidation.valid) {
    throw new Error(`Rate limiting configuration invalid: ${rateLimitValidation.errors.join(", ")}`);
  }

  const sessionValidation = ConfigValidator.validateSession(appConfig.session);
  if (!sessionValidation.valid) {
    throw new Error(`Session configuration invalid: ${sessionValidation.errors.join(", ")}`);
  }

  const app: FastifyInstance = fastify({
    logger: {
      level: appConfig.logLevel || "info",
      transport: appConfig.nodeEnv === "development" ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss Z",
        },
      } : undefined,
    },
    trustProxy: appConfig.trustProxy || false,
  });

  // Store configuration for later use
  app.addHook("preHandler", async (request, reply) => {
    (request as any).config = appConfig;
  });

  // Register plugins
  app.register(helmet);
  app.register(cors, {
    origin: appConfig.cors?.origin || false,
    credentials: appConfig.cors?.credentials || true,
  });
  app.register(rateLimit, {
    global: true,
    max: appConfig.rateLimit?.max || 100,
    timeWindow: appConfig.rateLimit?.timeWindow || "1 minute",
  });

  // Register Swagger documentation
  if (appConfig.nodeEnv !== "production") {
    app.register(swagger, {
      swagger: {
        info: {
          title: "Promethean Omni Service",
          description: "Unified service host for REST, GraphQL, WebSocket, and MCP adapters with shared authentication and context management",
          version: "1.0.0",
        },
        host: `${appConfig.host || "localhost"}:${appConfig.port || 3000}`,
        schemes: ["http", "https"],
        consumes: ["application/json"],
        produces: ["application/json"],
        tags: [
          { name: "Health", description: "Health check endpoints" },
          { name: "Auth", description: "Authentication endpoints" },
          { name: "REST", description: "REST API endpoints" },
          { name: "GraphQL", description: "GraphQL endpoints" },
          { name: "WebSocket", description: "WebSocket endpoints" },
          { name: "MCP", description: "Model Context Protocol endpoints" },
        ],
        security: [
          {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
          {
            type: "apiKey",
            in: "header",
            name: appConfig.apikey?.headerName || "x-api-key",
          },
        ],
      },
    });
    
    app.register(swaggerUi, {
      routePrefix: "/docs",
      uiConfig: {
        docExpansion: "list",
        operationsSorter: "alpha",
      },
    });
  }

  // Health check endpoint
  app.get("/health", async (request, reply) => {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      service: "omni-service",
      config: {
        adapters: appConfig.adapters,
        auth: {
          jwt: !!appConfig.jwt,
          rbac: !!appConfig.rbac,
          apikey: !!appConfig.apikey?.enabled,
          session: !!appConfig.session?.enabled,
        },
      },
    };
  });

  // Root endpoint
  app.get("/", async (request, reply) => {
    const adapters = Object.entries(appConfig.adapters)
      .filter(([_, config]) => config.enabled)
      .map(([name, config]) => {
        let endpoint = "";
        if (name === "rest") endpoint = `${config.prefix}/${config.version}`;
        else if (name === "graphql") endpoint = config.endpoint;
        else if (name === "websocket") endpoint = config.path;
        else if (name === "mcp") endpoint = config.prefix;
        return { name, endpoint, enabled: config.enabled };
      });

    return {
      service: "Promethean Omni Service",
      version: "1.0.0",
      description: "Unified service host for REST, GraphQL, WebSocket, and MCP adapters with shared authentication",
      config: {
        nodeEnv: appConfig.nodeEnv,
        adapters,
        auth: {
          jwt: !!appConfig.jwt,
          rbac: !!appConfig.rbac,
          apikey: !!appConfig.apikey?.enabled,
          session: !!appConfig.session?.enabled,
        },
      },
      endpoints: {
        health: "/health",
        docs: "/docs",
        graphql: appConfig.adapters.graphql.endpoint,
        websocket: appConfig.adapters.websocket.path,
        rest: `${appConfig.adapters.rest.prefix}/${appConfig.adapters.rest.version}`,
        mcp: appConfig.adapters.mcp.prefix,
      }
    };
  });

  // Authentication endpoints
  if (appConfig.jwt) {
    const authManager = createAuthManager(getAuthConfig());
    
    // Mock user repository for authentication (replace with real implementation)
    const mockUserRepository = {
      getUserById: async (id: string) => {
        // Mock user data - replace with real database query
        if (id.startsWith("user_")) {
          const username = id.replace("user_", "");
          return {
            id,
            username,
            email: `${username}@example.com`,
            roles: ["user"],
            metadata: { mockUser: true },
          };
        }
        
        // Mock service user
        if (id.includes("service")) {
          return {
            id,
            roles: ["service"],
            metadata: { serviceUser: true },
          };
        }
        
        return null;
      },
    };

    addAuthRoutes(app, authManager, mockUserRepository);

    // Example protected route
    app.get("/protected", {
      preHandler: authManager.createAuthMiddleware({
        required: true,
        permissions: [{ resource: "api:protected", actions: ["read"] }],
      }),
    }, async (request, reply) => {
      if (!request.user) {
        return reply.status(401).send({ error: "Unauthorized" });
      }

      const permissionChecker = authManager.createPermissionChecker(request.user);
      
      return reply.send({
        message: "Access granted to protected endpoint",
        user: {
          id: request.user.id,
          roles: request.user.roles,
        },
        permissions: Array.from(request.user.permissions),
        roleInfo: permissionChecker.getRoleInfo(),
      });
    });

    // Admin-only route
    app.get("/admin", {
      preHandler: authManager.createAuthMiddleware({
        required: true,
        roles: ["admin"],
      }),
    }, async (request, reply) => {
      if (!request.user) {
        return reply.status(401).send({ error: "Unauthorized" });
      }

      const permissionChecker = authManager.createPermissionChecker(request.user);
      
      return reply.send({
        message: "Admin access granted",
        user: request.user,
        roleInfo: permissionChecker.getRoleInfo(),
        rbacManager: authManager.getRBACManager().getAllRoles(),
      });
    });

    // Store auth manager in app for adapter use
    app.addHook("preHandler", async (request, reply) => {
      (request as any).authManager = authManager;
    });
  }

  // TODO: Mount adapters when available
  // - REST API adapter at /api/v1/*
  // - GraphQL endpoint at /graphql
  // - WebSocket server at /ws
  // - MCP HTTP transport at /mcp/*

  return app;
}

/**
 * Create development server with hot reload
 */
export async function createDevServer(appConfig: EnhancedOmniServiceConfig = config): Promise<FastifyInstance> {
  const app = createApp(appConfig);
  const port = appConfig.port || 3000;
  const host = appConfig.host || "0.0.0.0";
  
  await app.listen({ port, host });
  
  console.log(`🚀 Omni Service (dev) started on http://${host}:${port}`);
  console.log(`📚 GraphQL Playground: http://${host}:${port}/docs`);
  console.log(`🔧 Health Check: http://${host}:${port}/health`);
  console.log(`🔐 Authentication: http://${host}:${port}/auth/login`);
  
  if (appConfig.adapters.graphql.enabled) {
    console.log(`📊 GraphQL Endpoint: http://${host}:${port}${appConfig.adapters.graphql.endpoint}`);
  }
  
  if (appConfig.adapters.websocket.enabled) {
    console.log(`📡 WebSocket: ws://${host}:${port}${appConfig.adapters.websocket.path}`);
  }
  
  if (appConfig.adapters.mcp.enabled) {
    console.log(`🔌 MCP Endpoints: http://${host}:${port}${appConfig.adapters.mcp.prefix}`);
  }
  
  return app;
}