import { CollectionManager } from "./collectionManager";
import { AGENT_NAME } from "./agent";

export const discordMessages = await CollectionManager.create<"content", "created_at">(`${AGENT_NAME}_discord_messages`, "content", "created_at");
export const thoughts = await CollectionManager.create<"text", "createdAt">("thoughts", "text", "createdAt");
export const transcripts = await CollectionManager.create<"text", "createdAt">("transcripts", "text", "createdAt");
