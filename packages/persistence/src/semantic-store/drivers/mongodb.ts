import type { Collection, OptionalUnlessRequiredId, WithId } from 'mongodb';
import { validateMongoConnection, getMongoClient } from '../../clients.js';
import type { PrimaryDatabaseDriver, PrimaryDatabaseConfig, DualStoreEntry } from '../interfaces.js';
import { SemanticStoreError } from '../interfaces.js';

/**
 * MongoDB implementation of PrimaryDatabaseDriver
 * Extracted from existing DualStoreManager logic
 */
export class MongoDriver<TextKey extends string = 'text', TimeKey extends string = 'createdAt'>
    implements PrimaryDatabaseDriver<TextKey, TimeKey>
{
    readonly name: string;
    readonly config: PrimaryDatabaseConfig;
    private collection: Collection<DualStoreEntry<TextKey, TimeKey>> | undefined;

    constructor(name: string, config: PrimaryDatabaseConfig) {
        this.name = name;
        this.config = config;
    }

    private async getCollection(): Promise<Collection<DualStoreEntry<TextKey, TimeKey>>> {
        if (!this.collection) {
            const mongoClient = await getMongoClient();
            const validatedClient = await validateMongoConnection(mongoClient);
            const db = validatedClient.db(this.config.database || 'database');
            this.collection = db.collection<DualStoreEntry<TextKey, TimeKey>>(this.name);
        }
        return this.collection;
    }

    async insert(entry: DualStoreEntry<TextKey, TimeKey>): Promise<void> {
        try {
            const collection = await this.getCollection();
            await collection.insertOne(entry as OptionalUnlessRequiredId<DualStoreEntry<TextKey, TimeKey>>);
        } catch (error) {
            throw new SemanticStoreError(
                `Failed to insert document into MongoDB: ${error instanceof Error ? error.message : String(error)}`,
                {
                    operation: 'insert',
                    driver: 'mongodb',
                    documentId: entry.id,
                    originalError: error,
                },
            );
        }
    }

    async get(id: string): Promise<DualStoreEntry<'text', 'timestamp'> | null> {
        try {
            const collection = await this.getCollection();
            const document = await collection.findOne({ id } as any);

            if (!document) {
                return null;
            }

            const textKey = (this.config.options?.textKey as TextKey) || 'text';
            const timeKey = (this.config.options?.timeKey as TimeKey) || 'createdAt';

            return {
                id: document.id,
                text: (document as any)[textKey],
                timestamp: new Date((document as any)[timeKey]).getTime(),
                metadata: document.metadata,
            } as DualStoreEntry<'text', 'timestamp'>;
        } catch (error) {
            throw new SemanticStoreError(
                `Failed to get document from MongoDB: ${error instanceof Error ? error.message : String(error)}`,
                {
                    operation: 'get',
                    driver: 'mongodb',
                    documentId: id,
                    originalError: error,
                },
            );
        }
    }

    async getMostRecent(
        limit: number = 10,
        filter: any = { [(this.config.options?.textKey as TextKey) || 'text']: { $nin: [null, ''], $not: /^\s*$/ } },
        sorter: any = { [(this.config.options?.timeKey as TimeKey) || 'createdAt']: -1 },
    ): Promise<DualStoreEntry<'text', 'timestamp'>[]> {
        try {
            const collection = await this.getCollection();
            const documents = await collection.find(filter).sort(sorter).limit(limit).toArray();

            const textKey = (this.config.options?.textKey as TextKey) || 'text';
            const timeKey = (this.config.options?.timeKey as TimeKey) || 'createdAt';

            return documents.map((entry: WithId<DualStoreEntry<TextKey, TimeKey>>) => {
                const entryObj = entry as any;
                return {
                    id: entryObj.id,
                    text: entryObj[textKey],
                    timestamp: new Date(entryObj[timeKey]).getTime(),
                    metadata: entryObj.metadata,
                };
            }) as DualStoreEntry<'text', 'timestamp'>[];
        } catch (error) {
            throw new SemanticStoreError(
                `Failed to get recent documents from MongoDB: ${error instanceof Error ? error.message : String(error)}`,
                {
                    operation: 'getMostRecent',
                    driver: 'mongodb',
                    originalError: error,
                },
            );
        }
    }

    async update(id: string, update: any): Promise<void> {
        try {
            const collection = await this.getCollection();
            await collection.updateOne({ id } as any, { $set: update } as any);
        } catch (error) {
            throw new SemanticStoreError(
                `Failed to update document in MongoDB: ${error instanceof Error ? error.message : String(error)}`,
                {
                    operation: 'update',
                    driver: 'mongodb',
                    documentId: id,
                    originalError: error,
                },
            );
        }
    }

    async checkConsistency(id: string): Promise<{
        hasDocument: boolean;
        vectorWriteSuccess?: boolean;
        vectorWriteError?: string;
    }> {
        try {
            const document = await this.get(id);
            const hasDocument = document !== null;

            return {
                hasDocument,
                vectorWriteSuccess: document?.metadata?.vectorWriteSuccess,
                vectorWriteError: document?.metadata?.vectorWriteError,
            };
        } catch (error) {
            throw new SemanticStoreError(
                `Failed to check consistency in MongoDB: ${error instanceof Error ? error.message : String(error)}`,
                {
                    operation: 'checkConsistency',
                    driver: 'mongodb',
                    documentId: id,
                    originalError: error,
                },
            );
        }
    }

    async cleanup(): Promise<void> {
        // MongoDB connections are managed by the client pool
        // No specific cleanup needed for individual driver
        this.collection = undefined as any;
    }
}

/**
 * Factory for creating MongoDB drivers
 */
export class MongoDriverFactory {
    static readonly supportedTypes = ['mongodb'] as const;

    static validateConfig(config: PrimaryDatabaseConfig): boolean {
        return config.type === 'mongodb' && !!config.connection;
    }

    static async create(name: string, config: PrimaryDatabaseConfig): Promise<PrimaryDatabaseDriver> {
        if (!this.validateConfig(config)) {
            throw new SemanticStoreError('Invalid MongoDB configuration', { driver: 'mongodb', operation: 'create' });
        }

        return new MongoDriver(name, config);
    }
}
