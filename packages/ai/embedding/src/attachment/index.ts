import { fileBackedRegistry } from "@promethean/platform";

import {
  makeDeterministicEmbedder,
  assertDim,
  type Embedder,
} from "../embedder.js";
import { makeChromaWrapper } from "../chroma.js";

export type AttachmentInfo = {
  urn: string;
  url: string;
  content_type?: string;
  size?: number;
  sha256?: string;
};

export type AttachmentEvent = {
  provider: string;
  tenant: string;
  message_id: string;
  attachments: AttachmentInfo[];
};

export type AttachmentEmbeddingConfig = {
  chromaUrl: string;
  dim: number;
  textModelId: string;
  imageModelId: string;
  fetch?: typeof fetch;
  providerConfigPath?: string;
  timeoutMs?: number; // default 10000
  allowedHosts?: string[]; // e.g., ['cdn.discordapp.com', 'your-cdn.tld']
};

type TenantConfig = Readonly<{
  storage: Readonly<{ chroma_ns: string }>;
}>;

type RegistryLike = Readonly<{
  get(provider: string, tenant: string): Promise<unknown>;
}>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const hasOwn = <K extends PropertyKey>(
  value: Record<string, unknown>,
  key: K,
): value is Record<K, unknown> => Object.prototype.hasOwnProperty.call(value, key);

const toTenantConfig = (value: unknown): TenantConfig => {
  if (!isRecord(value)) throw new Error("Invalid tenant configuration");
  if (!hasOwn(value, "storage"))
    throw new Error("Missing storage configuration");
  const storageValue = value.storage;
  if (!isRecord(storageValue)) throw new Error("Invalid storage configuration");
  if (!hasOwn(storageValue, "chroma_ns"))
    throw new Error("Missing chroma namespace");
  const chromaNs = storageValue.chroma_ns;
  if (typeof chromaNs !== "string" || chromaNs.length === 0)
    throw new Error("Invalid chroma namespace");
  return {
    storage: {
      chroma_ns: chromaNs,
    },
  };
};

const toRegistry = (value: unknown): RegistryLike => {
  if (!isRecord(value)) throw new Error("Invalid registry instance");
  if (!hasOwn(value, "get")) throw new Error("Registry missing get method");
  const getFn = value.get;
  if (typeof getFn !== "function")
    throw new Error("Registry get is not callable");
  return {
    async get(provider: string, tenant: string) {
      return getFn.call(value, provider, tenant);
    },
  };
};

type FetchLike = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

const createFetchWithTimeout =
  (fetchImpl: FetchLike, timeoutMs: number): FetchLike =>
  async (input, init) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetchImpl(input, { ...init, signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  };

const ensureAllowedUrl = (
  attachment: AttachmentInfo,
  allowedHosts: ReadonlyArray<string> | undefined,
): URL => {
  const url = new URL(attachment.url);
  if (url.protocol !== "https:")
    throw new Error(`Blocked non-HTTPS URL: ${attachment.url}`);
  if (allowedHosts && !allowedHosts.includes(url.host))
    throw new Error(`Blocked host not in allowlist: ${url.host}`);
  return url;
};

const selectEmbedder = async (
  cache: Map<string, Embedder>,
  modelId: string,
  dim: number,
): Promise<Embedder> => {
  if (!cache.has(modelId))
    cache.set(modelId, makeDeterministicEmbedder({ modelId, dim }));
  return cache.get(modelId)!;
};

const resolveContentType = (
  attachment: AttachmentInfo,
  response: Response,
): string =>
  attachment.content_type || response.headers.get("content-type") || "";

const embedContent = async (
  contentType: string,
  response: Response,
  cache: Map<string, Embedder>,
  cfg: AttachmentEmbeddingConfig,
): Promise<number[]> =>
  contentType.startsWith("image/")
    ? selectEmbedder(cache, cfg.imageModelId, cfg.dim).then(
        async (embedder) => {
          const buffer = await response.arrayBuffer();
          const payload = Buffer.from(buffer).toString("base64");
          return embedder.embedOne({ type: "image_base64", data: payload });
        },
      )
    : selectEmbedder(cache, cfg.textModelId, cfg.dim).then(async (embedder) => {
        const text = await response.text();
        return embedder.embedOne(text);
      });

const buildMetadata = (
  evt: AttachmentEvent,
  attachment: AttachmentInfo,
  contentType: string,
) => ({
  provider: evt.provider,
  tenant: evt.tenant,
  foreign_id: evt.message_id,
  attachment_urn: attachment.urn,
  url: attachment.url,
  content_type: contentType || undefined,
  size: attachment.size ?? undefined,
  sha256: attachment.sha256 ?? undefined,
});

const createAttachmentProcessor = (
  evt: AttachmentEvent,
  cfg: AttachmentEmbeddingConfig,
  chroma: ReturnType<typeof makeChromaWrapper>,
  fetchWithTimeout: FetchLike,
) => {
  const cache = new Map<string, Embedder>();
  const allowedHosts = cfg.allowedHosts ? [...cfg.allowedHosts] : undefined;
  return async (attachment: AttachmentInfo): Promise<string | null> => {
    ensureAllowedUrl(attachment, allowedHosts);
    const response = await fetchWithTimeout(attachment.url);
    if (!response.ok)
      throw new Error(`Fetch failed: ${attachment.url} (${response.status})`);
    const contentType = resolveContentType(attachment, response);
    const embedding = await embedContent(contentType, response, cache, cfg);
    assertDim(embedding, cfg.dim);
    const id = `${evt.provider}:${evt.tenant}:attachment:${attachment.urn}`;
    await chroma.upsert([
      {
        id,
        embedding,
        metadata: buildMetadata(evt, attachment, contentType),
        document: attachment.url,
      },
    ]);
    return id;
  };
};

export async function embedAttachments(
  evt: AttachmentEvent,
  cfg: AttachmentEmbeddingConfig,
): Promise<{ ns: string; ids: string[] }> {
  const reg = toRegistry(fileBackedRegistry(cfg.providerConfigPath));
  const tenantCfg = toTenantConfig(await reg.get(evt.provider, evt.tenant));
  const ns = `${tenantCfg.storage.chroma_ns}__attachments`;
  if (!evt.attachments?.length) return { ns, ids: [] };
  const chroma = makeChromaWrapper({
    url: cfg.chromaUrl,
    collection: ns,
    prefix: tenantCfg.storage.chroma_ns,
    embeddingDim: cfg.dim,
  });
  await chroma.ensureCollection();

  const fetchWithTimeout = createFetchWithTimeout(
    cfg.fetch ?? fetch,
    cfg.timeoutMs ?? 10_000,
  );
  const processAttachment = createAttachmentProcessor(
    evt,
    cfg,
    chroma,
    fetchWithTimeout,
  );
  const ids = await Promise.all(
    evt.attachments.map((attachment) =>
      processAttachment(attachment).catch(() => null),
    ),
  );
  return { ns, ids: ids.filter((id): id is string => id !== null) };
}
