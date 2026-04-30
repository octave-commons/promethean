import type { FastifyPluginAsync } from "fastify";
import { all } from "../../lib/duckdb.js";
import { exportPrometheusMetrics, counterInc, gaugeSet } from "../../lib/metrics.js";

export const metricsRoutes: FastifyPluginAsync = async (app) => {
  /**
   * Prometheus metrics endpoint
   * GET /v1/metrics
   * 
   * Note: This endpoint is public (no auth) for Prometheus scraping.
   * Only exposes aggregate metrics, no sensitive data.
   */
  app.get("/metrics", { config: { public: true } }, async (req, reply) => {
    const storageBackend = (app as any).storageBackend ?? "duckdb";
    
    // Update gauges before export
    try {
      if (storageBackend === "mongodb" && app.mongo) {
        // MongoDB stats
        const eventsCount = await app.mongo.events.countDocuments();
        const compactedCount = await app.mongo.compacted.countDocuments();
        
        gaugeSet("openplanner_events_total", eventsCount, { backend: "mongodb" });
        gaugeSet("openplanner_compacted_total", compactedCount, { backend: "mongodb" });
      } else if (app.duck) {
        // DuckDB stats
        const eventsResult = await all(app.duck.conn, "SELECT COUNT(*) as count FROM events");
        const compactedResult = await all(app.duck.conn, "SELECT COUNT(*) as count FROM compacted_memories");
        
        gaugeSet("openplanner_events_total", eventsResult[0]?.count ?? 0, { backend: "duckdb" });
        gaugeSet("openplanner_compacted_total", compactedResult[0]?.count ?? 0, { backend: "duckdb" });
        gaugeSet("openplanner_fts_enabled", app.duck.ftsEnabled ? 1 : 0, { backend: "duckdb" });
      }
    } catch (error) {
      // Log but don't fail
      app.log.warn({ error }, "failed to update metrics gauges");
    }
    
    // Track scrape
    counterInc("openplanner_metrics_scrapes_total", { backend: storageBackend });
    
    const metrics = exportPrometheusMetrics();
    
    reply.type("text/plain; version=0.0.4; charset=utf-8");
    return metrics;
  });
};