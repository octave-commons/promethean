import { validateMongoConnection, getMongoClient } from '../../clients.js';
import { SemanticStoreError } from '../interfaces.js';
/**
 * MongoDB implementation of PrimaryDatabaseDriver
 * Extracted from existing DualStoreManager logic
 */
export class MongoDriver {
    name;
    config;
    collection;
    constructor(name, config) {
        this.name = name;
        this.config = config;
    }
    async getCollection() {
        if (!this.collection) {
            const mongoClient = await getMongoClient();
            const validatedClient = await validateMongoConnection(mongoClient);
            const db = validatedClient.db(this.config.database || 'database');
            this.collection = db.collection(this.name);
        }
        return this.collection;
    }
    async insert(entry) {
        try {
            const collection = await this.getCollection();
            await collection.insertOne(entry);
        }
        catch (error) {
            throw new SemanticStoreError(`Failed to insert document into MongoDB: ${error instanceof Error ? error.message : String(error)}`, {
                operation: 'insert',
                driver: 'mongodb',
                documentId: entry.id,
                originalError: error,
            });
        }
    }
    async get(id) {
        try {
            const collection = await this.getCollection();
            const document = await collection.findOne({ id });
            if (!document) {
                return null;
            }
            const textKey = this.config.options?.textKey || 'text';
            const timeKey = this.config.options?.timeKey || 'createdAt';
            return {
                id: document.id,
                text: document[textKey],
                timestamp: new Date(document[timeKey]).getTime(),
                metadata: document.metadata,
            };
        }
        catch (error) {
            throw new SemanticStoreError(`Failed to get document from MongoDB: ${error instanceof Error ? error.message : String(error)}`, {
                operation: 'get',
                driver: 'mongodb',
                documentId: id,
                originalError: error,
            });
        }
    }
    async getMostRecent(limit = 10, filter = { [this.config.options?.textKey || 'text']: { $nin: [null, ''], $not: /^\s*$/ } }, sorter = { [this.config.options?.timeKey || 'createdAt']: -1 }) {
        try {
            const collection = await this.getCollection();
            const documents = await collection.find(filter).sort(sorter).limit(limit).toArray();
            const textKey = this.config.options?.textKey || 'text';
            const timeKey = this.config.options?.timeKey || 'createdAt';
            return documents.map((entry) => {
                const entryObj = entry;
                return {
                    id: entryObj.id,
                    text: entryObj[textKey],
                    timestamp: new Date(entryObj[timeKey]).getTime(),
                    metadata: entryObj.metadata,
                };
            });
        }
        catch (error) {
            throw new SemanticStoreError(`Failed to get recent documents from MongoDB: ${error instanceof Error ? error.message : String(error)}`, {
                operation: 'getMostRecent',
                driver: 'mongodb',
                originalError: error,
            });
        }
    }
    async update(id, update) {
        try {
            const collection = await this.getCollection();
            await collection.updateOne({ id }, { $set: update });
        }
        catch (error) {
            throw new SemanticStoreError(`Failed to update document in MongoDB: ${error instanceof Error ? error.message : String(error)}`, {
                operation: 'update',
                driver: 'mongodb',
                documentId: id,
                originalError: error,
            });
        }
    }
    async checkConsistency(id) {
        try {
            const document = await this.get(id);
            const hasDocument = document !== null;
            return {
                hasDocument,
                vectorWriteSuccess: document?.metadata?.vectorWriteSuccess,
                vectorWriteError: document?.metadata?.vectorWriteError,
            };
        }
        catch (error) {
            throw new SemanticStoreError(`Failed to check consistency in MongoDB: ${error instanceof Error ? error.message : String(error)}`, {
                operation: 'checkConsistency',
                driver: 'mongodb',
                documentId: id,
                originalError: error,
            });
        }
    }
    async cleanup() {
        // MongoDB connections are managed by the client pool
        // No specific cleanup needed for individual driver
        this.collection = undefined;
    }
}
/**
 * Factory for creating MongoDB drivers
 */
export class MongoDriverFactory {
    static supportedTypes = ['mongodb'];
    static validateConfig(config) {
        return config.type === 'mongodb' && !!config.connection;
    }
    static async create(name, config) {
        if (!this.validateConfig(config)) {
            throw new SemanticStoreError('Invalid MongoDB configuration', { driver: 'mongodb', operation: 'create' });
        }
        return new MongoDriver(name, config);
    }
}
//# sourceMappingURL=mongodb.js.map