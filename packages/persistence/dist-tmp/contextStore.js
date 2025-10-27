import { DualStoreManager } from './dualStore.js';
const toEpochMilliseconds = (value) => {
    if (value instanceof Date)
        return value.getTime();
    if (typeof value === 'string')
        return new Date(value).getTime();
    return value;
};
export const formatMessage = (entry, formatTime) => {
    const metadata = entry.metadata ?? {};
    const displayName = metadata.userName || 'Unknown user';
    const verb = metadata.isThought ? 'thought' : 'said';
    const formattedTime = formatTime(toEpochMilliseconds(entry.timestamp));
    return `${displayName} ${verb} (${formattedTime}): ${entry.text}`;
};
const DEFAULT_COMPILE_OPTIONS = {
    texts: [],
    recentLimit: 10,
    queryLimit: 5,
    limit: 20,
    formatAssistantMessages: false,
};
const normaliseLegacyArgs = ([recentLimit, queryLimit, limit, formatAssistantMessages,]) => ({
    recentLimit,
    queryLimit,
    limit,
    formatAssistantMessages,
});
const isCompileContextOptions = (value) => !Array.isArray(value);
const resolveCompileOptions = (value, legacyArgs) => {
    if (!isCompileContextOptions(value)) {
        return {
            ...normaliseLegacyArgs(legacyArgs),
            texts: value,
        };
    }
    return value ?? {};
};
const dedupeByText = (entries) => {
    const seen = new Set();
    return entries.filter((entry) => {
        const text = entry.text;
        if (seen.has(text))
            return false;
        seen.add(text);
        return true;
    });
};
const sortByTimestamp = (entries) => [...entries].sort((a, b) => toEpochMilliseconds(a.timestamp) - toEpochMilliseconds(b.timestamp));
const limitByCollectionCount = (entries, limit, collectionCount) => {
    const materialised = [...entries];
    const maxResults = limit * Math.max(collectionCount, 1) * 2;
    return materialised.length > maxResults ? materialised.slice(-maxResults) : materialised;
};
const toMessage = (entry, formatAssistantMessages, formatTime, assistantName) => {
    const metadata = entry.metadata ?? {};
    const isAssistant = metadata.userName === assistantName;
    if (metadata.type === 'image') {
        return {
            role: isAssistant ? (metadata.isThought ? 'system' : 'assistant') : 'user',
            content: typeof metadata.caption === 'string' ? metadata.caption : '',
            images: [entry.text],
        };
    }
    const content = isAssistant && !formatAssistantMessages ? entry.text : formatMessage(entry, formatTime);
    return {
        role: isAssistant ? (metadata.isThought ? 'system' : 'assistant') : 'user',
        content,
    };
};
export const createContextStore = (formatTime = (ms) => new Date(ms).toISOString(), assistantName = 'Duck') => ({
    collections: new Map(),
    formatTime,
    assistantName,
});
const getCollectionManagers = (state) => Array.from(state.collections.values());
export const collectionCount = (state) => state.collections.size;
export const listCollectionNames = (state) => Array.from(state.collections.keys());
export const createCollection = async (state, name, textKey, timeStampKey) => {
    if (state.collections.has(name)) {
        throw new Error(`Collection ${name} already exists`);
    }
    const collectionManager = await DualStoreManager.create(name, textKey, timeStampKey);
    const newCollections = new Map(state.collections);
    newCollections.set(name, collectionManager);
    const newState = { ...state, collections: newCollections };
    return [newState, collectionManager];
};
export const getOrCreateCollection = async (state, name) => {
    if (state.collections.has(name)) {
        return [state, state.collections.get(name)];
    }
    const collectionManager = await DualStoreManager.create(name, 'text', 'timestamp');
    const newCollections = new Map(state.collections);
    newCollections.set(name, collectionManager);
    const newState = { ...state, collections: newCollections };
    return [newState, collectionManager];
};
export const getAllRelatedDocuments = async (state, queries, limit = 100, where) => {
    if (queries.length === 0) {
        return [];
    }
    const managers = getCollectionManagers(state);
    const related = await Promise.all(managers.map((collection) => collection.getMostRelevant([...queries], limit, where)));
    return related.flat();
};
export const getLatestDocuments = async (state, limit = 100) => {
    const managers = getCollectionManagers(state);
    const latest = await Promise.all(managers.map((collection) => collection.getMostRecent(limit)));
    return latest.flat();
};
export const getCollection = (state, name) => {
    const collection = state.collections.get(name);
    if (!collection) {
        throw new Error(`Collection ${name} does not exist`);
    }
    return collection;
};
const compileContextInternal = async (state, options) => {
    const latest = await getLatestDocuments(state, options.recentLimit);
    const queryTexts = [...(options.texts ?? []), ...latest.map((doc) => doc.text)].slice(-options.queryLimit);
    const [relatedDocs, imageDocs] = await Promise.all([
        getAllRelatedDocuments(state, queryTexts, options.limit),
        getAllRelatedDocuments(state, queryTexts, options.limit, { type: 'image' }),
    ]);
    const combined = [...relatedDocs.filter((doc) => doc.metadata?.type !== 'image'), ...latest, ...imageDocs].filter((entry) => Boolean(entry.metadata) && typeof entry.text === 'string');
    const deduped = dedupeByText(combined);
    const sorted = sortByTimestamp(deduped);
    const limited = limitByCollectionCount(sorted, options.limit, state.collections.size);
    return limited.map((entry) => toMessage(entry, options.formatAssistantMessages, state.formatTime, state.assistantName));
};
export const compileContext = async (state, textsOrOptions = [], ...legacyArgs) => {
    const options = resolveCompileOptions(textsOrOptions, legacyArgs);
    const definedOptions = Object.fromEntries(Object.entries(options).filter(([, value]) => value !== undefined));
    const resolvedTexts = definedOptions.texts ?? DEFAULT_COMPILE_OPTIONS.texts;
    const resolved = {
        ...DEFAULT_COMPILE_OPTIONS,
        ...definedOptions,
        texts: [...resolvedTexts],
    };
    return compileContextInternal(state, resolved);
};
const formatContextMessage = (deps, entry) => {
    const meta = entry.metadata ?? {};
    const name = deps.resolveDisplayName(meta);
    const when = deps.formatTime(toEpochMilliseconds(entry.timestamp));
    const verb = meta.isThought ? 'thought' : 'said';
    return `${name} ${verb} (${when}): ${entry.text}`;
};
const toContextMessage = (deps, entry, useFormatted) => {
    const meta = entry.metadata ?? {};
    if (meta.type === 'image') {
        return {
            role: deps.resolveRole(meta),
            content: typeof meta.caption === 'string' ? meta.caption : '',
            images: [entry.text],
        };
    }
    const content = useFormatted ? formatContextMessage(deps, entry) : entry.text;
    return { role: deps.resolveRole(meta), content };
};
const combineAndFilterDocuments = (related, latest, images) => [...related.filter((d) => d.metadata?.type !== 'image'), ...latest, ...images].filter((e) => typeof e.text === 'string' && e.metadata !== undefined);
const processDocumentsForContext = (deps, combined, formatAssistantMessages, limit) => {
    const deduped = dedupeByText(combined);
    const sorted = sortByTimestamp(deduped);
    const limited = sorted.slice(-limit * Math.max(deps.getCollections().length, 1) * 2);
    return limited.map((e) => toContextMessage(deps, e, formatAssistantMessages));
};
const getRelatedDocumentsForContext = async (deps, queries, limit = 100, where) => {
    if (queries.length === 0)
        return [];
    const managers = deps.getCollections();
    const related = await Promise.all(managers.map((c) => c.getMostRelevant([...queries], limit, where)));
    return related.flat();
};
const getLatestDocumentsForContext = async (deps, limit = 100) => {
    const managers = deps.getCollections();
    const latest = await Promise.all(managers.map((c) => c.getMostRecent(limit)));
    return latest.flat();
};
export const makeContextStore = (deps) => {
    const compileContext = async (opts = {}) => {
        const { texts = [], recentLimit = 10, queryLimit = 5, limit = 20, formatAssistantMessages = false } = opts;
        const latest = await getLatestDocumentsForContext(deps, recentLimit);
        const queryTexts = [...texts, ...latest.map((d) => d.text)].slice(-queryLimit);
        const [related, images] = await Promise.all([
            getRelatedDocumentsForContext(deps, queryTexts, limit),
            getRelatedDocumentsForContext(deps, queryTexts, limit, { type: 'image' }),
        ]);
        const combined = combineAndFilterDocuments(related, latest, images);
        return processDocumentsForContext(deps, combined, formatAssistantMessages, limit);
    };
    return {
        compileContext,
    };
};
// Original ContextStore class for backward compatibility
export class ContextStore {
    collections;
    constructor() {
        this.collections = new Map();
    }
    async createCollection(name, textKey, timeStampKey) {
        if (this.collections.has(name)) {
            throw new Error(`Collection ${name} already exists`);
        }
        const collectionManager = await DualStoreManager.create(name, textKey, timeStampKey);
        this.collections.set(name, collectionManager);
        return collectionManager;
    }
    async getOrCreateCollection(name) {
        if (this.collections.has(name)) {
            return this.collections.get(name);
        }
        const collectionManager = await DualStoreManager.create(name, 'text', 'timestamp');
        this.collections.set(name, collectionManager);
        return collectionManager;
    }
    async getAllRelatedDocuments(querys, limit = 100, where) {
        console.log('Getting related documents for querys:', querys.length, 'with limit:', limit);
        const results = [];
        for (const collection of this.collections.values()) {
            results.push(await collection.getMostRelevant(querys, limit, where));
        }
        return results.flat();
    }
    async getLatestDocuments(limit = 100) {
        const result = [];
        for (const collection of this.collections.values()) {
            result.push(await collection.getMostRecent(limit));
        }
        console.log('Getting latest documents from collections:', this.collections.size);
        return result.flat();
    }
    getCollection(name) {
        if (!this.collections.has(name))
            throw new Error(`Collection ${name} does not exist`);
        console.log('Getting collection:', name);
        return this.collections.get(name);
    }
    collectionCount() {
        return this.collections.size;
    }
    listCollectionNames() {
        return Array.from(this.collections.keys());
    }
    async compileContext(texts = [], recentLimit = 10, // how many recent documents to include
    queryLimit = 5, // how many of the recent documents to use in the query
    limit = 20, // how many documents to return in total
    formatAssistantMessages = false) {
        console.log('Compiling context with texts:', texts.length, 'and limit:', limit);
        const latest = await this.getLatestDocuments(recentLimit);
        const query = [...texts, ...latest.map((doc) => doc.text)].slice(-queryLimit);
        const related = await this.getAllRelatedDocuments(query, limit);
        const images = await this.getAllRelatedDocuments(query, limit, {
            type: 'image',
        });
        const uniqueThoughts = new Set();
        return Promise.all([related, latest, images]).then(([relatedDocs, latestDocs, imageDocs]) => {
            let results = [...relatedDocs.filter((doc) => doc.metadata?.type !== 'image'), ...latestDocs, ...imageDocs]
                .filter((doc) => {
                if (!doc.text)
                    return false; // filter out undefined text
                if (uniqueThoughts.has(doc.text))
                    return false; // filter out duplicates
                if (!doc.metadata)
                    return false;
                uniqueThoughts.add(doc.text);
                return true;
            })
                .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            console.log("You won't believe this but... the results are this long:", results.length);
            console.log('The limit was', limit);
            if (results.length > limit * this.collections.size * 2) {
                results = results.slice(-(limit * this.collections.size * 2));
            }
            return results.map((m) => m.metadata?.type === 'image'
                ? {
                    role: m.metadata?.userName === 'Duck'
                        ? m.metadata?.isThought
                            ? 'system'
                            : 'assistant'
                        : 'user',
                    content: m.metadata?.caption || '',
                    images: [m.text],
                }
                : {
                    role: m.metadata?.userName === 'Duck'
                        ? m.metadata?.isThought
                            ? 'system'
                            : 'assistant'
                        : 'user',
                    content: m.metadata?.userName === 'Duck'
                        ? formatAssistantMessages
                            ? formatMessage(m, (ms) => new Date(ms).toISOString())
                            : m.text
                        : formatMessage(m, (ms) => new Date(ms).toISOString()),
                });
        });
    }
}
