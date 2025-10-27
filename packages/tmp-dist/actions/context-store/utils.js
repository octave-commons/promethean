const toEpochMilliseconds = (value) => {
    if (value instanceof Date)
        return value.getTime();
    if (typeof value === 'string')
        return new Date(value).getTime();
    return Number(value);
};
export const formatMessage = (entry, formatTime) => {
    const metadata = entry.metadata ?? {};
    const displayName = metadata.userName || 'Unknown user';
    const verb = metadata.isThought ? 'thought' : 'said';
    const formattedTime = formatTime(toEpochMilliseconds(entry.timestamp));
    return `${displayName} ${verb} (${formattedTime}): ${entry.text}`;
};
export const dedupeByText = (entries) => {
    const seen = new Set();
    return entries.filter((entry) => {
        if (seen.has(entry.text))
            return false;
        seen.add(entry.text);
        return true;
    });
};
export const sortByTimestamp = (entries) => [...entries].sort((a, b) => toEpochMilliseconds(a.timestamp) - toEpochMilliseconds(b.timestamp));
export const limitByCollectionCount = (entries, limit, collectionCount) => {
    const materialised = [...entries];
    const maxResults = limit * Math.max(collectionCount, 1) * 2;
    return materialised.length > maxResults ? materialised.slice(-maxResults) : materialised;
};
export const toMessage = (entry, formatAssistantMessages, state) => {
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
export const getCollections = (state) => Array.from(state.collections.values());
