import { AGENT_NAME } from "@promethean-os/legacy/env.js";
import { DualStoreManager as Dual } from "@promethean-os/persistence/dualStore.js";
export const discordMessages = await Dual.create(
  `${AGENT_NAME}_discord_messages`,
  "content",
  "created_at",
);
export const thoughts = await Dual.create("thoughts", "text", "createdAt");
export const transcripts = await Dual.create(
  "transcripts",
  "text",
  "createdAt",
);
