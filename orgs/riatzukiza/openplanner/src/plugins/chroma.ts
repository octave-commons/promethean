import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import type { OpenPlannerConfig } from "../lib/config.js";
import { resolveEmbeddingModel } from "../lib/embedding-models.js";
import { openChroma, type Chroma } from "../lib/chroma.js";
import { OllamaEmbeddingFunction } from "../lib/embeddings.js";

declare module "fastify" {
  interface FastifyInstance {
    chroma: Chroma;
  }
}

export const chromaPlugin = fp<OpenPlannerConfig>(async (app, cfg) => {
  const hotEmbeddingCache = new Map<string, OllamaEmbeddingFunction>();
  const compactEmbeddingCache = new Map<string, OllamaEmbeddingFunction>();

  const getModelForScope = (scope: { source?: string; kind?: string; project?: string }): string =>
    resolveEmbeddingModel(cfg.embeddingModels, scope);

  const getEmbeddingFunctionFor = (scope: { source?: string; kind?: string; project?: string }): OllamaEmbeddingFunction => {
    const model = getModelForScope(scope);
    const cached = hotEmbeddingCache.get(model);
    if (cached) return cached;

    const created = new OllamaEmbeddingFunction(model, cfg.ollamaBaseUrl, {
      truncate: cfg.ollamaEmbedTruncate,
      numCtx: cfg.ollamaEmbedNumCtx,
      apiKey: cfg.ollamaApiKey,
    });
    hotEmbeddingCache.set(model, created);
    return created;
  };

  const getCompactEmbeddingFunction = (): OllamaEmbeddingFunction => {
    const model = cfg.compactEmbedModel;
    const cached = compactEmbeddingCache.get(model);
    if (cached) return cached;

    const created = new OllamaEmbeddingFunction(model, cfg.ollamaBaseUrl, {
      truncate: cfg.ollamaEmbedTruncate,
      numCtx: cfg.ollamaEmbedNumCtx,
      apiKey: cfg.ollamaApiKey,
    });
    compactEmbeddingCache.set(model, created);
    return created;
  };

  const chroma = await openChroma(
    cfg.chromaUrl,
    {
      collectionName: cfg.chromaCollection,
      embeddingFunction: getEmbeddingFunctionFor({}),
      embeddingFunctionFor: getEmbeddingFunctionFor,
      resolveEmbeddingModel: getModelForScope,
    },
    {
      collectionName: cfg.chromaCompactCollection,
      embeddingFunction: getCompactEmbeddingFunction(),
      embeddingFunctionFor: () => getCompactEmbeddingFunction(),
      resolveEmbeddingModel: () => cfg.compactEmbedModel,
    },
  );

  app.decorate("chroma", chroma);
  app.log.info(
    {
      chromaUrl: cfg.chromaUrl,
      collection: chroma.collectionName,
      compactCollection: chroma.compactCollectionName,
      ollamaBaseUrl: cfg.ollamaBaseUrl,
      defaultEmbedModel: cfg.embeddingModels.defaultModel,
      compactEmbedModel: cfg.compactEmbedModel,
      sourceOverrideCount: Object.keys(cfg.embeddingModels.bySource).length,
      kindOverrideCount: Object.keys(cfg.embeddingModels.byKind).length,
      projectOverrideCount: Object.keys(cfg.embeddingModels.byProject).length
    },
    "chroma ready"
  );
});
