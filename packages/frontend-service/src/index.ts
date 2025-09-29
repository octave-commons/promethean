import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import Fastify, { type FastifyInstance } from "fastify";
import fastifyStatic from "@fastify/static";
import {
  registerDiagnosticsRoute,
  registerHealthRoute,
} from "@promethean/web-utils";
import type { ReadonlyDeep } from "type-fest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---- small, pure utils ------------------------------------------------------

const fileExists = (p: string): boolean => fs.existsSync(p);

const readJson = <T>(p: string): T | undefined =>
  fileExists(p) ? (JSON.parse(fs.readFileSync(p, "utf8")) as T) : undefined;

type PackageDirInfo = Readonly<{ pkgDir: string; fallback: string }>;

const packageNameForDir = ({ pkgDir, fallback }: PackageDirInfo): string => {
  const pkgJsonPath = path.join(pkgDir, "package.json");
  if (!fileExists(pkgJsonPath)) return fallback;
  const raw = readJson<{ name?: unknown }>(pkgJsonPath);
  const name =
    raw && typeof raw === "object" && typeof raw.name === "string"
      ? raw.name
      : undefined;
  return name ?? fallback;
};

type PackageNameInfo = Readonly<{ name: string }>;

const urlPrefixFromPkgName = ({ name }: PackageNameInfo): string =>
  name.startsWith("@promethean/") ? name.split("/")[1] ?? name : name;

type PackageMount = Readonly<{
  pkgPath: string;
  prefix: string;
}>;

const discoverPackageMounts = (
  packagesDir: string,
): ReadonlyArray<PackageMount> => {
  if (!fileExists(packagesDir)) {
    return [];
  }

  return fs
    .readdirSync(packagesDir, { withFileTypes: true })
    .reduce<ReadonlyArray<PackageMount>>((acc, dirent) => {
      if (!dirent.isDirectory()) {
        return acc;
      }

      const pkgPath = path.join(packagesDir, dirent.name);
      const pkgName = packageNameForDir({
        pkgDir: pkgPath,
        fallback: dirent.name,
      });
      const prefix = urlPrefixFromPkgName({ name: pkgName });

      return [...acc, { pkgPath, prefix }];
    }, []);
};

// ---- mounts -----------------------------------------------------------------

export type CreateServerOptions = ReadonlyDeep<{
  packagesDir?: string;
}>;

export async function createServer(
  options?: CreateServerOptions,
): Promise<ReadonlyDeep<FastifyInstance>> {
  const app = Fastify();
  const immutableApp = app as ReadonlyDeep<FastifyInstance>;

  const resolvedOptions = options ?? ({} as CreateServerOptions);
  const repoRoot = path.resolve(__dirname, "..", "..", "..");
  const defaultPackagesDir = path.join(repoRoot, "packages");
  const packagesDir = resolvedOptions.packagesDir ?? defaultPackagesDir;

  discoverPackageMounts(packagesDir).forEach(({ pkgPath, prefix }) => {
    const distFrontend = path.join(pkgPath, "dist", "frontend");
    const staticDir = path.join(pkgPath, "static");

    if (fileExists(distFrontend)) {
      immutableApp.register(fastifyStatic, {
        root: distFrontend,
        prefix: `/${prefix}/`,
        decorateReply: false,
      });
    }

    if (fileExists(staticDir)) {
      immutableApp.register(fastifyStatic, {
        root: staticDir,
        prefix: `/${prefix}/static/`,
        decorateReply: false,
      });
    }
  });

  const serviceIdentity: ReadonlyDeep<{ serviceName?: string }> = {
    serviceName: "frontend-service",
  } as const;

  await registerHealthRoute(app, serviceIdentity);
  await registerDiagnosticsRoute(app, serviceIdentity);

  immutableApp.get("/version", async (_req, reply) =>
    reply.send({ version: "1.0.0" }),
  );

  await immutableApp.ready();
  return immutableApp;
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
