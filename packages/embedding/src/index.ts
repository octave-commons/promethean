export {
  embedAttachments,
  type AttachmentInfo,
  type AttachmentEvent,
  type AttachmentEmbeddingConfig,
} from "./attachment/index.js";
export {
  RemoteEmbeddingFunction,
  setEmbeddingOverride,
  type EmbeddingOverride,
  type EmbeddingOverrideContext,
} from "./remote.js";
export { makeDeterministicEmbedder, assertDim } from "./embedder.js";
export { makeChromaWrapper } from "./chroma.js";
