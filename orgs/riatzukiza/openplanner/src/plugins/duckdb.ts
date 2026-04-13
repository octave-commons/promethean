import fp from "fastify-plugin";
import type { OpenPlannerConfig } from "../lib/config.js";
import { openDuckDB, type Duck } from "../lib/duckdb.js";
import { paths } from "../lib/paths.js";

declare module "fastify" {
  interface FastifyInstance {
    duck: Duck;
  }
}

export const duckdbPlugin = fp<OpenPlannerConfig>(async (app, cfg) => {
  const p = paths(cfg.dataDir);
  const duck = await openDuckDB(p.dbPath);
  app.decorate("duck", duck);
  app.log.info({ dbPath: p.dbPath, ftsEnabled: duck.ftsEnabled }, "duckdb ready");

  app.addHook("onClose", async () => {
    await new Promise<void>((resolve) => duck.conn.close(() => resolve()));
    await new Promise<void>((resolve) => duck.db.close(() => resolve()));
  });
});
