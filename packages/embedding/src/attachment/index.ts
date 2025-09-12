import { fileBackedRegistry } from "@promethean/platform/provider-registry.js";

import { makeDeterministicEmbedder, type Embedder } from "../embedder.js";
import { makeChromaWrapper } from "../chroma.js";

export interface AttachmentInfo {
  urn: string;
  url: string;
  content_type?: string;
  size?: number;
  sha256?: string;
}

export interface AttachmentEvent {
  provider: string;
  tenant: string;
  message_id: string;
  attachments: AttachmentInfo[];
}

export interface AttachmentEmbeddingConfig {
  chromaUrl: string;
  dim: number;
  textModelId: string;
  imageModelId: string;
  fetch?: typeof fetch;
  providerConfigPath?: string;
}

async function selectEmbedder(
  cache: Record<string, Embedder>,
  modelId: string,
  dim: number,
): Promise<Embedder> {
  if (!cache[modelId])
    cache[modelId] = makeDeterministicEmbedder({ modelId, dim });
  return cache[modelId]!;
}

export async function embedAttachments(
  evt: AttachmentEvent,
  cfg: AttachmentEmbeddingConfig,
) {
  if (!evt.attachments?.length) return { ns: "", ids: [] };

  const reg = fileBackedRegistry(cfg.providerConfigPath);
  const tenantCfg = await reg.get(evt.provider, evt.tenant);
  const ns = `${tenantCfg.storage.chroma_ns}__attachments`;
  const chroma = makeChromaWrapper({
    url: cfg.chromaUrl,
    collection: ns,
    prefix: tenantCfg.storage.chroma_ns,
    embeddingDim: cfg.dim,
  });
  await chroma.ensureCollection();

  const fetchImpl = cfg.fetch ?? fetch;
  const results: string[] = [];
  const embedderCache: Record<string, Embedder> = {};

  for (const a of evt.attachments) {
    const res = await fetchImpl(a.url);
    const ct = a.content_type || res.headers.get("content-type") || "";
    let embedding: number[];
    if (ct.startsWith("image/")) {
      const ab = await res.arrayBuffer();
      const b64 = Buffer.from(ab).toString("base64");
      const emb = await selectEmbedder(
        embedderCache,
        cfg.imageModelId,
        cfg.dim,
      );
      embedding = await emb.embedOne({ type: "image_base64", data: b64 });
    } else {
      const text = await res.text();
      const emb = await selectEmbedder(embedderCache, cfg.textModelId, cfg.dim);
      embedding = await emb.embedOne(text);
    }

    const id = `${evt.provider}:${evt.tenant}:attachment:${a.urn}`;
    await chroma.upsert([
      {
        id,
        embedding,
        metadata: {
          provider: evt.provider,
          tenant: evt.tenant,
          foreign_id: evt.message_id,
          attachment_urn: a.urn,
          url: a.url,
        },
        document: a.url,
      },
    ]);
    results.push(id);
  }

  return { ns, ids: results };
}
