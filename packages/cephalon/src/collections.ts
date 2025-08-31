import { AGENT_NAME } from "@promethean/legacy/env.js";

import { DualStoreManager as Dual } from '@promethean/persistence/dualStore.js';
export const discordMessages = await (Dual as any).create(`${AGENT_NAME}_discord_messages`, 'content', 'created_at');
export const thoughts = await (Dual as any).create('thoughts', 'text', 'createdAt');
export const transcripts = await (Dual as any).create('transcripts', 'text', 'createdAt');
