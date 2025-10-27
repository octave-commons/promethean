import type { DualStoreEntry, DualStoreMetadata, DualStoreTimestamp } from '../../types.js';
import type { ContextMessage, ContextState, DualStoreAdapter } from './types.js';

export type GenericEntry = DualStoreEntry<'text', 'timestamp'>;

const toEpochMilliseconds = (value: DualStoreTimestamp): number => {
    if (value instanceof Date) return value.getTime();
    if (typeof value === 'string') return new Date(value).getTime();
    return Number(value);
};

export const formatMessage = (
    entry: GenericEntry,
    formatTime: (epochMs: number) => string,
): string => {
    const metadata = entry.metadata ?? {};
    const displayName = metadata.userName || 'Unknown user';
    const verb = metadata.isThought ? 'thought' : 'said';
    const formattedTime = formatTime(toEpochMilliseconds(entry.timestamp));
    return `${displayName} ${verb} (${formattedTime}): ${entry.text}`;
};

export const dedupeByText = (entries: readonly GenericEntry[]): GenericEntry[] => {
    const seen = new Set<string>();
    return entries.filter((entry) => {
        if (seen.has(entry.text)) return false;
        seen.add(entry.text);
        return true;
    });
};

export const sortByTimestamp = (entries: readonly GenericEntry[]): GenericEntry[] =>
    [...entries].sort((a, b) => toEpochMilliseconds(a.timestamp) - toEpochMilliseconds(b.timestamp));

export const limitByCollectionCount = (
    entries: readonly GenericEntry[],
    limit: number,
    collectionCount: number,
): GenericEntry[] => {
    const materialised = [...entries];
    const maxResults = limit * Math.max(collectionCount, 1) * 2;
    return materialised.length > maxResults ? materialised.slice(-maxResults) : materialised;
};

export const toMessage = (
    entry: GenericEntry,
    formatAssistantMessages: boolean,
    state: ContextState,
): ContextMessage => {
    const metadata = entry.metadata ?? {};
    const assistantName = state.assistantName;
    const isAssistant = metadata.userName === assistantName;

    if (metadata.type === 'image') {
        return {
            role: isAssistant ? (metadata.isThought ? 'system' : 'assistant') : 'user',
            content: typeof metadata.caption === 'string' ? metadata.caption : '',
            images: [entry.text],
        };
    }

    const content = isAssistant && !formatAssistantMessages ? entry.text : formatMessage(entry, state.formatTime);
    return {
        role: isAssistant ? (metadata.isThought ? 'system' : 'assistant') : 'user',
        content,
    };
};

export const getCollections = (state: ContextState): readonly DualStoreAdapter[] =>
    Array.from(state.collections.values());

