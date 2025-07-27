import { ChromaClient } from "chromadb";
import { MongoClient, ObjectId, Collection } from "mongodb";

import * as dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });  // 👈 resolve from wherever you want

const AGENT_NAME = process.env.AGENT_NAME || "duck";

const chromaClient = new ChromaClient();

type MessageMetaData = {
    timeStamp:number;
    userName: string;
}

type ChromaQuery = {
    ids: string[];
    documents: string[];
    metadatas: MessageMetaData[]
};

type DiscordMessage = {
    _id: ObjectId;
    id?: number;
    recipient: number;
    startTime?: number;
    endTime?: number;

    created_at :number
    author: number;
    channel: number;
    channel_name: string;
    author_name: string;
    content: string | null;
    is_embedded?: boolean;
};

const MONGO_CONNECTION_STRING = process.env.MONGODB_URI || `mongodb://localhost`;

(async () => {
    const mongoClient = new MongoClient(MONGO_CONNECTION_STRING);
    try {
        await mongoClient.connect();
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        return;
    }

    const db = mongoClient.db("database");
    const collectionName = `${AGENT_NAME}_discord_messages`;
    const discordMessagesCollection: Collection<DiscordMessage> = db.collection(collectionName);

    const chromaCollection = await chromaClient.getOrCreateCollection({
        name: collectionName
    });

    while (true) {

            await new Promise((res) => setTimeout(res, 1000));
        const messages = await discordMessagesCollection
            .find({
                has_meta_data:{$exists:false},
                content:{ $ne: null}
            })
            .limit(100)
            .toArray() as Array<Omit<DiscordMessage, 'content'> & { content: string }>;

        if (messages.length === 0) {
            console.log("No new messages, sleeping 1 minute")
            await new Promise((res) => setTimeout(res, 60000));
            continue;
        }

        console.log("embedding", messages.length, "messages and transcripts")

        const chromaQuery: ChromaQuery = {
            ids: messages.map((msg) => msg._id.toHexString()),
            documents: messages.map((msg) => msg.content) ,
            metadatas: messages.map(msg => ({
                timeStamp: msg?.startTime || msg.created_at,
                userName: msg.author_name

            }))
        };

        await chromaCollection.upsert(chromaQuery);
        // Mark these messages as embedded
        const messageIds = messages.map((msg) => msg._id);
        await discordMessagesCollection.updateMany(
            { _id: { $in: messageIds } },
            { $set: { is_embedded: true,
                      embedding_has_time_stamp:true,
                      has_meta_data:true} }
        );
    }
})();
