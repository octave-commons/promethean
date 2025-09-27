import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";

import { registerFilesRoutes } from "./files.js";
import { registerSearchRoutes } from "./search.js";
import { registerSinkRoutes } from "./sinks.js";
import { registerIndexerRoutes } from "./indexer.js";
import { registerAgentRoutes } from "./agents.js";
import { registerExecRoutes, type ExecDeps } from "./exec.js";
import { FastifyInstance } from "fastify";
import rateLimit from "@fastify/rate-limit";

type V1Deps = Pick<ExecDeps, "runCommand">;

export async function registerV1Routes(
  app: FastifyInstance,
  deps: V1Deps = {},
): Promise<void> {
  // Everything defined here will be reachable under /v1 because of the prefix in fastifyApp.js
  await app.register(
    async function v1(v1: FastifyInstance) {
      type RootedFastify = FastifyInstance & { ROOT_PATH?: string };
      const parent = app as RootedFastify;
      const scoped = v1 as RootedFastify;
      const rootPath = parent.ROOT_PATH ?? process.cwd();
      const canDecorate = typeof scoped.decorate === "function";
      const hasRootPath =
        typeof scoped.hasDecorator === "function" &&
        scoped.hasDecorator("ROOT_PATH");
      if (canDecorate && !hasRootPath) {
        scoped.decorate("ROOT_PATH", rootPath);
      } else {
        scoped.ROOT_PATH = rootPath;
      }
      // Swagger JUST for v1 (encapsulation keeps it scoped)

      await v1.register(rateLimit, {
        max: 100, // max 100 requests per windowMs
        timeWindow: 15 * 60 * 1000, // 15 minutes
      });
      const baseUrl =
        process.env.PUBLIC_BASE_URL ||
        `http://localhost:${process.env.PORT || 3210}`;
      const authEnabled =
        String(process.env.AUTH_ENABLED || "false").toLowerCase() === "true";
      const swaggerOpts: any = {
        openapi: {
          openapi: "3.1.0",
          info: { title: "Promethean SmartGPT Bridge — v1", version: "1.1.0" },
          servers: [{ url: baseUrl }],
        },
        exposeRoute: true,
      };

      if (authEnabled) {
        swaggerOpts.openapi.components = {
          securitySchemes: {
            apiKey: {
              type: "apiKey",
              name: "x-pi-token",
              in: "header",
            },
          },
        };
        swaggerOpts.openapi.security = [{ apiKey: [] }];
      }
      let hasSwagger = true;
      try {
        await v1.register(swagger, swaggerOpts);
        await v1.register(swaggerUi, {
          routePrefix: "/docs",
          uiConfig: { docExpansion: "list" },
        });
      } catch {
        hasSwagger = false;
      }

      // expose the generated v1 spec
      v1.get(
        "/openapi.json",
        { schema: { hide: true } },
        async (_req: any, reply: any) => {
          const doc =
            hasSwagger && typeof v1.swagger === "function"
              ? v1.swagger()
              : swaggerOpts.openapi;
          reply.type("application/json").send(doc);
        },
      );

      registerFilesRoutes(v1);
      registerSearchRoutes(v1);
      registerSinkRoutes(v1);
      registerIndexerRoutes(v1);
      registerAgentRoutes(v1);
      registerExecRoutes(v1, deps);
    },
    { prefix: "/v1" },
  );
}
