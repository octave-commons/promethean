/**
 * Create a new dual store manager instance (functional API)
 */
export async function create(name: string, textKey: string, timeStampKey: string): Promise<any> {
    const chromaClient = await getChromaClient();
    const mongoClient = await getMongoClient();
    const family = `${process.env.AGENT_NAME || 'duck'}_${name}`;
    const db = mongoClient.db('database');
    const aliases = db.collection<AliasDoc>('collection_aliases');
    const alias = await aliases.findOne({ _id: family });

    const embedFnName = alias?.embed?.fn || process.env.EMBEDDING_FUNCTION || 'nomic-embed-text';
    const embeddingFn = alias?.embed
        ? RemoteEmbeddingFunction.fromConfig({
              driver: alias.embed.driver,
              fn: alias.embed.fn,
          })
        : RemoteEmbeddingFunction.fromConfig({
              driver: process.env.EMBEDDING_DRIVER || 'ollama',
              fn: embedFnName,
          });

    const chromaCollection = await chromaClient.getOrCreateCollection({
        name: alias?.target || family,
        embeddingFunction: embeddingFn,
    });

    const mongoCollection = db.collection(family);

    const supportsImages = !embedFnName.toLowerCase().includes('text');

    // Create a simple manager object with the methods we need
    const manager = {
        name: family,
        chromaCollection,
        mongoCollection,
        textKey,
        timeStampKey,
        supportsImages,
        chromaWriteQueue: getOrCreateQueue(name, chromaCollection),
    };

    managerRegistry.set(name, manager);
    return manager;
}
