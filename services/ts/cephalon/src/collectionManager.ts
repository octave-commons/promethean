import { Collection as ChromaCollection, ChromaClient } from 'chromadb';
import { Collection, MongoClient, ObjectId, OptionalUnlessRequiredId, WithId } from 'mongodb';
import { AGENT_NAME } from '../../../../shared/js/env.js';
const chromaClient = new ChromaClient();
const mongoClient = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
import crypto from 'crypto';
export type DiscordEntry = CollectionEntry<'content', 'created_at'>;
export type ThoughtEntry = CollectionEntry<'text', 'createdAt'>;

export type CollectionEntry<TextKey extends string = 'text', TimeKey extends string = 'createdAt'> = {
	_id?: ObjectId; // MongoDB internal ID
	id?: string;
	metadata?: any;
} & {
	[K in TextKey]: string;
} & {
	[K in TimeKey]: number;
};
export type CollectionQueryResult = {
	ids: string[];
	documents: string[];
	metadatas: any[];
	distances?: number[];
};
export class CollectionManager<TextKey extends string = 'text', TimeKey extends string = 'createdAt'> {
	name: string;
	chromaCollection: ChromaCollection;
	mongoCollection: Collection<CollectionEntry<TextKey, TimeKey>>;
	textKey: TextKey;
	timeStampKey: TimeKey;

	constructor(
		name: string,
		chromaCollection: ChromaCollection,
		mongoCollection: Collection<CollectionEntry<TextKey, TimeKey>>,
		textKey: TextKey,
		timeStampKey: TimeKey,
	) {
		this.name = name;
		this.chromaCollection = chromaCollection;
		this.mongoCollection = mongoCollection;
		this.textKey = textKey;
		this.timeStampKey = timeStampKey;
	}

	static async create<TTextKey extends string = 'text', TTimeKey extends string = 'createdAt'>(
		name: string,
		textKey: TTextKey,
		timeStampKey: TTimeKey,
	) {
		const collectionName = `${AGENT_NAME}_${name}`;
		const chromaCollection = await chromaClient.getOrCreateCollection({ name: collectionName });
		const db = mongoClient.db('database');
		const mongoCollection = db.collection<CollectionEntry<TTextKey, TTimeKey>>(collectionName);
		return new CollectionManager(collectionName, chromaCollection, mongoCollection, textKey, timeStampKey);
	}

	// AddEntry method:
	async addEntry(entry: CollectionEntry<TextKey, TimeKey>) {
		if (!entry.id) {
			entry.id = crypto.randomUUID();
		}

		if (!entry[this.timeStampKey]) {
			entry[this.timeStampKey] = Date.now() as CollectionEntry<TextKey, TimeKey>[TimeKey];
		}

		if (!entry.metadata) entry.metadata = {};
		entry.metadata[this.timeStampKey] = entry[this.timeStampKey];

		// console.log("Adding entry to collection", this.name, entry);

		await this.chromaCollection.add({
			ids: [entry.id],
			documents: [entry[this.textKey]],
			metadatas: [entry.metadata],
		});

		await this.mongoCollection.insertOne({
			id: entry.id,
			[this.textKey]: entry[this.textKey],
			[this.timeStampKey]: entry[this.timeStampKey],
			metadata: entry.metadata,
		} as OptionalUnlessRequiredId<CollectionEntry<TextKey, TimeKey>>);
	}

	async getMostRecent(
		limit: number = 10,
		mongoFilter: any = {},
		sorter: any = { [this.timeStampKey]: -1 },
	): Promise<CollectionEntry<'text', 'timestamp'>[]> {
		// console.log("Getting most recent entries from collection", this.name, "with limit", limit);
		return (await this.mongoCollection.find(mongoFilter).sort(sorter).limit(limit).toArray()).map(
			(entry: WithId<CollectionEntry<TextKey, TimeKey>>) => ({
				id: entry.id,
				text: (entry as Record<TextKey, any>)[this.textKey],
				timestamp: new Date((entry as Record<TimeKey, any>)[this.timeStampKey]).getTime(),
				metadata: entry.metadata,
			}),
		) as CollectionEntry<'text', 'timestamp'>[];
	}
	async getMostRelevant(queryTexts: string[], limit: number): Promise<CollectionEntry<'text', 'timestamp'>[]> {
		// console.log("Getting most relevant entries from collection", this.name, "for queries", queryTexts, "with limit", limit);
		if (!queryTexts || queryTexts.length === 0) return Promise.resolve([]);

		const queryResult = await this.chromaCollection.query({
			queryTexts,
			nResults: limit,
		});
		const uniqueThoughts = new Set();
		const ids = queryResult.ids.flat(2);
		const meta = queryResult.metadatas.flat(2);
		return queryResult.documents
			.flat(2)
			.map((doc, i) => ({
				id: ids[i],
				text: doc,
				metadata: meta[i],
				timestamp: meta[i]?.timeStamp || meta[i]?.[this.timeStampKey] || Date.now(),
			}))
			.filter((doc) => {
				if (!doc.text) return false; // filter out undefined text
				if (uniqueThoughts.has(doc.text)) return false; // filter out duplicates
				uniqueThoughts.add(doc.text);
				return true;
			}) as CollectionEntry<'text', 'timestamp'>[];
	}
}
