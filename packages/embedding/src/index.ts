export {
  embedAttachments,
  type AttachmentEvent,
  type AttachmentEmbeddingConfig,
} from "./attachment/index.js";
export { RemoteEmbeddingFunction } from "./remote.js";
export { makeDeterministicEmbedder, assertDim } from "./embedder.js";
export { makeChromaWrapper } from "./chroma.js";
