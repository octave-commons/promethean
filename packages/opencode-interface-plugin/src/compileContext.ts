// SPDX-License-Identifier: GPL-3.0-only

import { getContextStore } from './stores.js';

type Message = {
  readonly id: string;
  readonly role: string;
  readonly content: string;
  readonly timestamp?: number | string;
};

type CompileOptions = {
  readonly texts?: readonly string[];
  readonly recentLimit?: number;
  readonly queryLimit?: number;
  readonly limit?: number;
  readonly formatAssistantMessages?: boolean;
};

export async function compileContext(
  textsOrOptions: readonly string[] | CompileOptions = [],
  ...legacyArgs: readonly [number?, number?, number?, boolean?]
): Promise<Message[]> {
  // Normalize arguments
  let options: CompileOptions;
  if (Array.isArray(textsOrOptions)) {
    options = { texts: textsOrOptions as string[] };
  } else {
    options = textsOrOptions as CompileOptions;
  }

  const recentLimit = options.recentLimit ?? legacyArgs[0] ?? 10;
  const queryLimit = options.queryLimit ?? legacyArgs[1] ?? 5;
  const limit = options.limit ?? legacyArgs[2] ?? 20;

  try {
    const store = await getContextStore();

    // Get recent messages
    const recentMessages = await store.getMostRecent(recentLimit);

    // Get relevant messages based on query texts
    let relevantMessages: any[] = [];
    if (options.texts && options.texts.length > 0) {
      relevantMessages = await store.getMostRelevant([...options.texts], queryLimit);
    }

    // Combine and deduplicate messages
    const allMessages = [...relevantMessages, ...recentMessages];
    const uniqueMessages = allMessages.filter(
      (msg, index, arr) => arr.findIndex((m) => m.text === msg.text) === index,
    );

    // Convert to Message format and limit results
    return uniqueMessages.slice(0, limit).map(
      (entry): Message => ({
        id: entry.id,
        role: entry.metadata?.role || 'user',
        content: entry.text,
        timestamp: entry.timestamp,
      }),
    );
  } catch (error) {
    console.error('Error compiling context:', error);
    return [];
  }
}
