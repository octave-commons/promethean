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
  registerDiagnosticsRoute,
  registerHealthRoute,
} from "@promethean/web-utils";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---- small, pure utils ------------------------------------------------------

const fileExists = (p: string): boolean => {
  try {
    fs.accessSync(p, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
};

const readJson = <T>(p: string): T | undefined => {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8")) as T;
  } catch {
    return undefined;
  }
};

const packageNameForDir = (pkgDir: string, fallback: string): string => {
  const pkgJsonPath = path.join(pkgDir, "package.json");
  if (!fileExists(pkgJsonPath)) return fallback;
  const raw = readJson<{ name?: unknown }>(pkgJsonPath);
  const name =
    raw && typeof raw === "object" && typeof raw.name === "string"
      ? raw.name
      : undefined;
  return name ?? fallback;
};

const urlPrefixFromPkgName = (name: string): string =>
  name.startsWith("@promethean/") ? name.split("/")[1] ?? name : name;

// ---- mounts -----------------------------------------------------------------

async function mountFrontends(app: FastifyInstance): Promise<void> {
  const repoRoot = path.resolve(__dirname, "..", "..", "..");
  const packagesDir = path.join(repoRoot, "packages");

  const dirs =
    fs
      .readdirSync(packagesDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name) ?? [];

  for (const dirName of dirs) {
    const pkgPath = path.join(packagesDir, dirName);
    const pkgName = packageNameForDir(pkgPath, dirName);
    const prefix = urlPrefixFromPkgName(pkgName);

    const distFrontend = path.join(pkgPath, "dist", "frontend");
    const staticDir = path.join(pkgPath, "static");

    if (fileExists(distFrontend)) {
      app.register(fastifyStatic, {
        root: distFrontend,
        prefix: `/${prefix}/`,
        decorateReply: false,
      });
    }

    if (fileExists(staticDir)) {
      app.register(fastifyStatic, {
        root: staticDir,
        prefix: `/${prefix}/static/`,
        decorateReply: false,
      });
    }
  }
}

// ---- server -----------------------------------------------------------------

export async function createServer(): Promise<FastifyInstance> {
  const app = Fastify();

  await mountFrontends(app);

  // Use permissive typings to match upstream utils without over-constraining here
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

// ---- entrypoint -------------------------------------------------------------

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT ?? 4500);
  const server = await createServer();
  server.listen({ port, host: "0.0.0.0" }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
