import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import Fastify, {
  type FastifyInstance,
  type FastifyReply,
  type FastifyRequest,
} from "fastify";
import fastifyStatic from "@fastify/static";
import {
  registerHealthRoute,
  registerDiagnosticsRoute,
} from "@promethean/web-utils";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function mountFrontends(app: FastifyInstance): Promise<void> {
  const repoRoot = path.resolve(__dirname, "..", "..", "..");
  const packagesDir = path.join(repoRoot, "packages");
  const dirs = fs.readdirSync(packagesDir, { withFileTypes: true });

  for (const dir of dirs) {
    if (!dir.isDirectory()) continue;
    const pkgPath = path.join(packagesDir, dir.name);
    const pkgJsonPath = path.join(pkgPath, "package.json");
    if (!fs.existsSync(pkgJsonPath)) continue;
    const pkgRaw = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8")) as unknown;
    const pkgName =
      typeof pkgRaw === "object" &&
      pkgRaw !== null &&
      "name" in pkgRaw &&
      typeof (pkgRaw as { name?: unknown }).name === "string"
        ? (pkgRaw as { name: string }).name
        : undefined;
    const name = pkgName ?? dir.name;
    const prefix = name.startsWith("@promethean/") ? name.split("/")[1] : name;
    const distFrontend = path.join(pkgPath, "dist", "frontend");
    const staticDir = path.join(pkgPath, "static");

    if (fs.existsSync(distFrontend)) {
      app.register(fastifyStatic, {
        root: distFrontend,
        prefix: `/${prefix}/`,
        decorateReply: false,
      });
    }

    if (fs.existsSync(staticDir)) {
      app.register(fastifyStatic, {
        root: staticDir,
        prefix: `/${prefix}/static/`,
        decorateReply: false,
      });
    }
  }
}

export async function createServer(): Promise<FastifyInstance> {
  const app = Fastify();
  await mountFrontends(app);
  const registerHealthRouteTyped = registerHealthRoute as (
    app: FastifyInstance,
    opts: { serviceName?: string },
  ) => Promise<void>;
  const registerDiagnosticsRouteTyped = registerDiagnosticsRoute as (
    app: FastifyInstance,
    opts: { serviceName?: string },
  ) => Promise<void>;
  await registerHealthRouteTyped(app, { serviceName: "frontend-service" });
  await registerDiagnosticsRouteTyped(app, { serviceName: "frontend-service" });
  app.get("/version", async (_req: FastifyRequest, reply: FastifyReply) =>
    reply.send({ version: "1.0.0" }),
  );
  await app.ready();
  return app;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT ?? 4500);
  const server = await createServer();
  server.listen({ port, host: "0.0.0.0" }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
