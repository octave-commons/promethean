import { ChromaClient } from 'chromadb';
import { RemoteEmbeddingFunction } from '@shared/ts/dist/embeddings/remote.js';
import { MongoClient, ObjectId, Collection } from 'mongodb';
import { AGENT_NAME } from '@shared/js/env.js';
import { HeartbeatClient } from '@shared/js/heartbeat/index.js';
import { collectionFor, CONFIG_FP } from '@shared/js/embeddings/versioning.js';

const chromaClient = new ChromaClient();

type MessageMetaData = { timeStamp: number; userName: string };
type ChromaQuery = {
	ids: string[];
	documents: string[];
	metadatas: MessageMetaData[];
};
type DiscordMessage = {
	_id: ObjectId;
	created_at: number;
	author: number;
	channel: number;
	channel_name: string;
	author_name: string;
	content: string | null;
	embedding_status?: Record<string, 'processing' | 'done' | 'error'>;
};

const MONGO_CONNECTION_STRING = process.env.MONGODB_URI || `mongodb://localhost`;
const EMBED_VERSION = process.env.EMBED_VERSION || new Date().toISOString().slice(0, 10);
const EMBEDDING_DRIVER = process.env.EMBEDDING_DRIVER || 'ollama';
const EMBEDDING_FUNCTION = process.env.EMBEDDING_FUNCTION || 'nomic-embed-text';
const EMBED_DIMS = Number(process.env.EMBED_DIMS || 768);

(async () => {
	const hb = new HeartbeatClient();
	await hb.sendOnce().catch(() => process.exit(1));
	hb.start();

	const mongoClient = new MongoClient(MONGO_CONNECTION_STRING);
	await mongoClient.connect();
	const db = mongoClient.db('database');

	const family = `${AGENT_NAME}_discord_messages`;
	const collectionName = family;
	const discordMessagesCollection: Collection<DiscordMessage> = db.collection(collectionName);

	const aliases = db.collection<{ _id: string }>('collection_aliases');
	const cfg = {
		driver: EMBEDDING_DRIVER,
		fn: EMBEDDING_FUNCTION,
		dims: EMBED_DIMS,
	};
	const target = collectionFor(family, EMBED_VERSION, cfg);
	await aliases.updateOne(
		{ _id: family },
		{
			$setOnInsert: { _id: family },
			$set: {
				target,
				embed: { ...cfg, version: EMBED_VERSION, config_fp: CONFIG_FP(cfg) },
			},
		},
		{ upsert: true },
	);

	const chromaCollection = await chromaClient.getOrCreateCollection({
		name: target,
		embeddingFunction: RemoteEmbeddingFunction.fromConfig({
			driver: EMBEDDING_DRIVER,
			fn: EMBEDDING_FUNCTION,
		}),
		metadata: { family, version: EMBED_VERSION, ...cfg },
	});

	await discordMessagesCollection.createIndex({
		[`embedding_status.${EMBED_VERSION}`]: 1,
		content: 1,
	});

	while (true) {
		await new Promise((res) => setTimeout(res, 1000));

		const messages = (await discordMessagesCollection
			.find({
				[`embedding_status.${EMBED_VERSION}`]: { $ne: 'done' },
				content: { $nin: [null, ''], $not: /^\s*$/ },
			})
			.limit(100)
			.toArray()) as Array<DiscordMessage & { content: string }>;

		if (messages.length === 0) {
			console.log(`[${family}] No pending for version ${EMBED_VERSION}. Sleeping 1 minute…`);
			await new Promise((res) => setTimeout(res, 60_000));
			continue;
		}

		const ids = messages.map((m) => m._id.toHexString());
		console.log(`Embedding ${messages.length} messages → ${target}`);

		await discordMessagesCollection.updateMany(
			{ _id: { $in: messages.map((m) => m._id) } },
			{ $set: { [`embedding_status.${EMBED_VERSION}`]: 'processing' } },
		);

		const chromaQuery: ChromaQuery = {
			ids,
			documents: messages.map((m) => m.content),
			metadatas: messages.map((m) => ({
				timeStamp: m.created_at,
				userName: m.author_name,
				version: EMBED_VERSION,
				driver: EMBEDDING_DRIVER,
				fn: EMBEDDING_FUNCTION,
				dims: EMBED_DIMS,
			})),
		};
		console.log('chroma query', chromaQuery);

		try {
			console.log({
				EMBEDDING_DRIVER,
				EMBEDDING_FUNCTION,
				EMBED_DIMS,
				EMBED_VERSION,
			});
			await chromaCollection.upsert(chromaQuery);
			await discordMessagesCollection.updateMany(
				{ _id: { $in: messages.map((m) => m._id) } },
				{ $set: { [`embedding_status.${EMBED_VERSION}`]: 'done' } },
			);
		} catch (e) {
			console.error('Upsert failed', e);
			await discordMessagesCollection.updateMany(
				{ _id: { $in: messages.map((m) => m._id) } },
				{ $set: { [`embedding_status.${EMBED_VERSION}`]: 'error' } },
			);
		}
	}
})();
