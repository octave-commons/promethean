import { MongoClient } from 'mongodb';
import { ChromaClient } from 'chromadb';
export declare const validateMongoConnection: (client: MongoClient) => Promise<MongoClient>;
export declare const getMongoClient: () => Promise<MongoClient>;
export declare const getChromaClient: () => Promise<ChromaClient>;
export declare const __setMongoClientForTests: (client: MongoClient | null) => void;
export declare const __setChromaClientForTests: (client: ChromaClient | null) => void;
export declare const __resetPersistenceClientsForTests: () => void;
export declare const cleanupClients: () => Promise<void>;
//# sourceMappingURL=clients.d.ts.map