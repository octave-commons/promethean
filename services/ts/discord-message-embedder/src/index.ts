import { fileBackedRegistry } from '@shared/prom-lib';
import { makeChromaWrapper } from '@shared/prom-lib';
import { makeDeterministicEmbedder } from '@shared/prom-lib';

export async function embedMessage(evt: any) {
    if (!evt.text || !evt.text.trim()) return null;
    const reg = fileBackedRegistry();
    const tenantCfg = await reg.get(evt.provider, evt.tenant);
    const ns = `${tenantCfg.storage.chroma_ns}__messages`;
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
    const embedding = await embedder.embedOne(evt.text);
    await chroma.upsert([
        {
            id: `${evt.provider}:${evt.tenant}:message:${evt.message_id}`,
            embedding,
            metadata: {
                provider: evt.provider,
                tenant: evt.tenant,
                foreign_id: evt.message_id,
                space_urn: evt.space_urn,
            },
            document: evt.text,
        },
    ]);
    return { ns, id: `${evt.provider}:${evt.tenant}:message:${evt.message_id}` };
}

if (import.meta.url === `file://${process.argv[1]}`) {
    console.log('discord-message-embedder ready (stub run)');
    setInterval(() => {}, 1 << 30);
}
