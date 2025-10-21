export {
  setIndexerLogger,
  getIndexerLogger,
  setChromaClient,
  setEmbeddingFactory,
  resetChroma,
  resetEmbeddingCache,
  getChroma,
  gatherRepoFiles,
  indexFile,
  removeFileFromIndex,
  reindexAll,
  reindexSubset,
  search,
  collectionForFamily,
  embeddingEnvConfig,
  buildEmbeddingFn,
  indexerManager,
  createIndexerManager,
  IndexerManager,
  type CollectionLike,
  type ChromaLike,
} from "./indexer.js";

export {
  createLevelCacheStateStore,
  createMemoryStateStore,
  setIndexerStateStore,
  getIndexerStateStore,
  loadBootstrapState,
  saveBootstrapState,
  deleteBootstrapState,
  type BootstrapState,
  type IndexerStateBody,
  type IndexerStateStore,
} from "./state/index.js";

export {
  RemoteEmbeddingFunction,
  setEmbeddingOverride,
  type EmbeddingOverride,
  type EmbeddingOverrideContext,
} from "./embedding.js";

export {
  createInclusionChecker,
  deriveExtensions,
  expandBraces,
  toPosixPath,
} from "./glob.js";
