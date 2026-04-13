import type { FastifyPluginAsync } from "fastify";
import { healthRoutes } from "./health.js";
import { blobRoutes } from "./blobs.js";
import { eventRoutes } from "./events.js";
import { searchRoutes } from "./search.js";
import { sessionRoutes } from "./sessions.js";
import { jobRoutes } from "./jobs.js";

export const v1Routes: FastifyPluginAsync = async (app) => {
  await app.register(healthRoutes);
  await app.register(blobRoutes);
  await app.register(eventRoutes);
  await app.register(searchRoutes);
  await app.register(sessionRoutes);
  await app.register(jobRoutes);
};
