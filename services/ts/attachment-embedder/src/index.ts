import { makeDeterministicEmbedder } from '@shared/ts/dist/migrations/embedder';
import { fileBackedRegistry } from '@shared/ts/dist/platform/provider-registry';
import { makeChromaWrapper } from '@shared/ts/dist/migrations/chroma';

export async function embedAttachments(evt) {
    if (!evt.attachments?.length) return [];
    const reg = fileBackedRegistry();
    const tenantCfg = await reg.get(evt.provider, evt.tenant);
    const ns = `${tenantCfg.storage.chroma_ns}__attachments`;
    const dim = Number(process.env.EMBEDDING_DIM || '1536');
    const model = process.env.EMBEDDING_MODEL || 'deterministic:v1';
    const chroma = makeChromaWrapper({
        url: process.env.CHROMA_URL || 'http://localhost:8000',
        collection: ns,
        prefix: tenantCfg.storage.chroma_ns,
        embeddingDim: dim,
    });
    await chroma.ensureCollection();
    const embedder = makeDeterministicEmbedder({ modelId: model, dim });
    const results: string[] = [];
    for (const a of evt.attachments) {
        const signal = a.content_type?.startsWith('image/')
            ? { type: 'image_url', data: a.url }
            : { type: 'text', data: a.url };
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
    console.log('attachment-embedder ready (stub run)');
    setInterval(() => {}, 1 << 30);
}
