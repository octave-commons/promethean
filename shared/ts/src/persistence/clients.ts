import { MongoClient } from 'mongodb';
import { ChromaClient } from 'chromadb';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const CHROMA_URL = process.env.CHROMA_URL || 'http://localhost:8000';

let mongoClient: MongoClient | null = null;
let chromaClient: ChromaClient | null = null;

export async function getMongoClient(): Promise<MongoClient> {
    if (!mongoClient) {
        mongoClient = new MongoClient(MONGO_URI);
        await mongoClient.connect();
    }
    return mongoClient;
}

export async function getChromaClient(): Promise<ChromaClient> {
    if (!chromaClient) {
        chromaClient = new ChromaClient({ path: CHROMA_URL });
    }
    return chromaClient;
}
