import type { PrimaryDatabaseDriver, PrimaryDatabaseConfig, DualStoreEntry } from '../interfaces.js';
/**
 * MongoDB implementation of PrimaryDatabaseDriver
 * Extracted from existing DualStoreManager logic
 */
export declare class MongoDriver<TextKey extends string = 'text', TimeKey extends string = 'createdAt'> implements PrimaryDatabaseDriver<TextKey, TimeKey> {
    readonly name: string;
    readonly config: PrimaryDatabaseConfig;
    private collection;
    constructor(name: string, config: PrimaryDatabaseConfig);
    private getCollection;
    insert(entry: DualStoreEntry<TextKey, TimeKey>): Promise<void>;
    get(id: string): Promise<DualStoreEntry<'text', 'timestamp'> | null>;
    getMostRecent(limit?: number, filter?: any, sorter?: any): Promise<DualStoreEntry<'text', 'timestamp'>[]>;
    update(id: string, update: any): Promise<void>;
    checkConsistency(id: string): Promise<{
        hasDocument: boolean;
        vectorWriteSuccess?: boolean;
        vectorWriteError?: string;
    }>;
    cleanup(): Promise<void>;
}
/**
 * Factory for creating MongoDB drivers
 */
export declare class MongoDriverFactory {
    static readonly supportedTypes: readonly ["mongodb"];
    static validateConfig(config: PrimaryDatabaseConfig): boolean;
    static create(name: string, config: PrimaryDatabaseConfig): Promise<PrimaryDatabaseDriver>;
}
//# sourceMappingURL=mongodb.d.ts.map