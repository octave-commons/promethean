// SPDX-License-Identifier: GPL-3.0-only
import { makeDeterministicEmbedder } from "@promethean/migrations/embedder.js";
import { fileBackedRegistry } from "@promethean/platform/provider-registry.js";
import { makeChromaWrapper } from "@promethean/migrations/chroma.js";

// TODO: This is a stub implementation that just embeds the URL of the attachment.
// In the future we should download the attachment and embed the actual content.
// For images we can use an image embedding model, for text we can use a text embedding model.
// For other types we can either skip or use a generic embedding model.

// The function takes an event object with the following structure:
// {
//   provider: string; // e.g. 'discord'
//   tenant: string; // e.g. 'my-server-id'
//   message_id: string; // e.g. '1234567890'
//   attachments: Array<{
//     urn: string; // e.g. 'attachment-urn'
//     url: string; // e.g. 'https://cdn.discordapp.com/attachments/...'
//     content_type?: string; // e.g. 'image/png' or 'text/plain'
//   }>
// }
// It returns an object with the namespace and the list of embedded attachment IDs:
// {
//   ns: string; // e.g. 'my-chroma-namespace__attachments'
//   ids: string[]; // e.g. ['discord:my-server-id:attachment:attachment-urn', ...]
// }

// TODO: Update evt type when we have a common event type
export async function embedAttachments(evt: any) {
  if (!evt.attachments?.length) return [];
  const reg = fileBackedRegistry();
  const tenantCfg = await reg.get(evt.provider, evt.tenant);
  const ns = `${tenantCfg.storage.chroma_ns}__attachments`;
  const dim = Number(process.env.EMBEDDING_DIM || "1536");
  const model = process.env.EMBEDDING_MODEL || "deterministic:v1";
  const chroma = makeChromaWrapper({
    url: process.env.CHROMA_URL || "http://localhost:8000",
    collection: ns,
    prefix: tenantCfg.storage.chroma_ns,
    embeddingDim: dim,
  });
  //
  // TODO Use a DualStore for consistancy:
  await chroma.ensureCollection();
  //TODO: Use the remote embedding function and use a real model.,
  const embedder = makeDeterministicEmbedder({ modelId: model, dim });
  const results: string[] = [];
  for (const a of evt.attachments) {
    const signal = a.content_type?.startsWith("image/")
      ? { type: "image_url", data: a.url }
      : { type: "text", data: a.url };
    const embedding = await embedder.embedOne(signal);
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

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("attachment-embedder ready (stub run)");
  setInterval(() => {}, 1 << 30);
}
