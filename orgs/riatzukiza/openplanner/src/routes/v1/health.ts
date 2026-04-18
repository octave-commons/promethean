import type { FastifyPluginAsync } from "fastify";

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get("/health", async () => ({
    ok: true,
    time: new Date().toISOString(),
    ftsEnabled: app.duck.ftsEnabled,
    vectorCollections: {
      hot: app.chroma.collectionName,
      compact: app.chroma.compactCollectionName,
    },
    embeddingModels: {
      hot: app.chroma.resolveEmbeddingModel?.({}) ?? null,
      compact: app.chroma.resolveCompactEmbeddingModel?.({}) ?? null,
    }
  }));
};
