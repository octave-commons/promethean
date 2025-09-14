import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import fastifyStatic from "@fastify/static";
import Fastify, { type FastifyInstance } from "fastify";
import {
  registerDiagnosticsRoute,
  registerHealthRoute,
} from "@promethean/web-utils";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function mountFrontends(app: Readonly<FastifyInstance>): Promise<void> {
  const repoRoot = path.resolve(__dirname, "..", "..", "..");
  const packagesDir = path.join(repoRoot, "packages");
  const dirs = fs.readdirSync(packagesDir, { withFileTypes: true });

  dirs.forEach((dir) => {
    if (!dir.isDirectory()) return;
    const pkgPath = path.join(packagesDir, dir.name);
    const pkgJsonPath = path.join(pkgPath, "package.json");
    if (!fs.existsSync(pkgJsonPath)) return;
    const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8")) as unknown as {
      name?: string;
    };
    const name: string = pkg.name ?? dir.name;
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
  });
}

export async function createServer(): Promise<FastifyInstance> {
  const app = Fastify();
  await mountFrontends(app);
  const healthRoute = registerHealthRoute as (
    app: FastifyInstance,
    opts: { readonly serviceName: string },
  ) => Promise<void>;
  const diagnosticsRoute = registerDiagnosticsRoute as (
    app: FastifyInstance,
    opts: { readonly serviceName: string },
  ) => Promise<void>;
  await healthRoute(app, { serviceName: "frontend-service" });
  await diagnosticsRoute(app, { serviceName: "frontend-service" });
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
