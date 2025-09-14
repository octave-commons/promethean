import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import {
  registerHealthRoute,
  registerDiagnosticsRoute,
} from "@promethean/web-utils";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function mountFrontends(app: any) {
  const repoRoot = path.resolve(__dirname, "..", "..", "..");
  const packagesDir = path.join(repoRoot, "packages");
  const dirs = fs.readdirSync(packagesDir, { withFileTypes: true });

  for (const dir of dirs) {
    if (!dir.isDirectory()) continue;
    const pkgPath = path.join(packagesDir, dir.name);
    const pkgJsonPath = path.join(pkgPath, "package.json");
    if (!fs.existsSync(pkgJsonPath)) continue;
    const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
    const name: string = pkg.name ?? dir.name;
    const prefix = name.startsWith("@promethean/") ? name.split("/")[1] : name;
    const distFrontend = path.join(pkgPath, "dist", "frontend");
    const staticDir = path.join(pkgPath, "static");

    if (fs.existsSync(distFrontend)) {
      app.register(fastifyStatic, {
        root: distFrontend,
        prefix: `/${prefix}/`,
      });
    }

    if (fs.existsSync(staticDir)) {
      app.register(fastifyStatic, {
        root: staticDir,
        prefix: `/${prefix}/static/`,
      });
    }
  }
}

export async function createServer() {
  const app = Fastify();
  await mountFrontends(app);
  await registerHealthRoute(app, { serviceName: "frontend-service" });
  await registerDiagnosticsRoute(app, { serviceName: "frontend-service" });
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
