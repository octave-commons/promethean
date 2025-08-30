import { DualStoreManager } from "@promethean/persistence/dualStore.js";
import { AGENT_NAME } from "../../../../shared/js/env.js";

export const discordMessages = await DualStoreManager.create<
  "content",
  "created_at"
>(`${AGENT_NAME}_discord_messages`, "content", "created_at");
export const thoughts = await DualStoreManager.create<"text", "createdAt">(
  "thoughts",
  "text",
  "createdAt",
);
export const transcripts = await DualStoreManager.create<"text", "createdAt">(
  "transcripts",
  "text",
  "createdAt",
);
