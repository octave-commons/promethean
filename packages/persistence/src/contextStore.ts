/* eslint-disable functional/prefer-immutable-types */
/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */
/* eslint-disable functional/immutable-data */

import type { Where } from 'chromadb';

import { DualStoreManager } from './dualStore.js';
import type { DualStoreEntry, DualStoreMetadata, DualStoreTimestamp } from './types.js';

export type ContextMessage = { role: 'user' | 'assistant' | 'system'; content: string; images?: string[] };

const toEpochMilliseconds = (value: DualStoreTimestamp): number => {
    if (value instanceof Date) return value.getTime();
    if (typeof value === 'string') return new Date(value).getTime();
    return value;
};

export const formatMessage = (
    entry: DualStoreEntry<'text', 'timestamp'>,
    formatTime: (epochMs: number) => string,
): string => {
    const metadata = entry.metadata ?? {};
    const displayName = metadata.userName || 'Unknown user';
    const verb = metadata.isThought ? 'thought' : 'said';
    const formattedTime = formatTime(toEpochMilliseconds(entry.timestamp));
    return `${displayName} ${verb} (${formattedTime}): ${entry.text}`;
};

export type GenericEntry = DualStoreEntry<'text', 'timestamp'>;

type CompileContextOptions = {
    readonly texts?: readonly string[];
    readonly recentLimit?: number;
    readonly queryLimit?: number;
    readonly limit?: number;
    readonly formatAssistantMessages?: boolean;
};

type LegacyCompileArgs = Readonly<[number?, number?, number?, boolean?]>;

const DEFAULT_COMPILE_OPTIONS: Required<CompileContextOptions> = {
    texts: [],
    recentLimit: 10,
    queryLimit: 5,
    limit: 20,
    formatAssistantMessages: false,
};

const normaliseLegacyArgs = ([
    recentLimit,
    queryLimit,
    limit,
    formatAssistantMessages,
]: LegacyCompileArgs): CompileContextOptions => ({
    recentLimit,
    queryLimit,
    limit,
    formatAssistantMessages,
});

const isCompileContextOptions = (
    value: readonly string[] | CompileContextOptions | undefined,
): value is CompileContextOptions | undefined => !Array.isArray(value);

const resolveCompileOptions = (
    value: readonly string[] | CompileContextOptions | undefined,
    legacyArgs: LegacyCompileArgs,
): CompileContextOptions => {
    if (!isCompileContextOptions(value)) {
        return {
            ...normaliseLegacyArgs(legacyArgs),
            texts: value,
        } satisfies CompileContextOptions;
    }

    return value ?? {};
};

const dedupeByText = (entries: readonly GenericEntry[]): GenericEntry[] => {
    const seen = new Set<string>();
    return entries.filter((entry) => {
        const text = entry.text;
        if (seen.has(text)) return false;

        seen.add(text);
        return true;
    });
};

const sortByTimestamp = (entries: readonly GenericEntry[]): GenericEntry[] =>
    [...entries].sort((a, b) => toEpochMilliseconds(a.timestamp) - toEpochMilliseconds(b.timestamp));

const limitByCollectionCount = (
    entries: readonly GenericEntry[],
    limit: number,
    collectionCount: number,
): GenericEntry[] => {
    const materialised = [...entries];
    const maxResults = limit * Math.max(collectionCount, 1) * 2;
    return materialised.length > maxResults ? materialised.slice(-maxResults) : materialised;
};

const toMessage = (
    entry: GenericEntry,
    formatAssistantMessages: boolean,
    formatTime: (epochMs: number) => string,
    assistantName: string,
): ContextMessage => {
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

export type ContextStoreState = {
    readonly collections: ReadonlyMap<string, DualStoreManager<string, string>>;
    readonly formatTime: (epochMs: number) => string;
    readonly assistantName: string;
};

export const createContextStore = (
    formatTime: (epochMs: number) => string = (ms) => new Date(ms).toISOString(),
    assistantName: string = 'Duck',
): ContextStoreState => ({
    collections: new Map(),
    formatTime,
    assistantName,
});

const getCollectionManagers = (state: ContextStoreState): readonly DualStoreManager<string, string>[] =>
    Array.from(state.collections.values());

export const collectionCount = (state: ContextStoreState): number => state.collections.size;

export const listCollectionNames = (state: ContextStoreState): readonly string[] =>
    Array.from(state.collections.keys());

export const createCollection = async (
    state: ContextStoreState,
    name: string,
    textKey: string,
    timeStampKey: string,
): Promise<[ContextStoreState, DualStoreManager<string, string>]> => {
    if (state.collections.has(name)) {
        throw new Error(`Collection ${name} already exists`);
    }

    const collectionManager = await DualStoreManager.create<string, string>(name, textKey, timeStampKey);
    const newCollections = new Map([...state.collections, [name, collectionManager]]);
    const newState = { ...state, collections: newCollections };
    return [newState, collectionManager];
};

export const getOrCreateCollection = async (
    state: ContextStoreState,
    name: string,
): Promise<[ContextStoreState, DualStoreManager<string, string>]> => {
    if (state.collections.has(name)) {
        return [state, state.collections.get(name)!];
    }

    const collectionManager = await DualStoreManager.create<string, string>(name, 'text', 'timestamp');
    const newCollections = new Map([...state.collections, [name, collectionManager]]);
    const newState = { ...state, collections: newCollections };
    return [newState, collectionManager];
};

export const getAllRelatedDocuments = async (
    state: ContextStoreState,
    queries: readonly string[],
    limit: number = 100,
    where?: Where,
): Promise<GenericEntry[]> => {
    if (queries.length === 0) {
        return [];
    }

    const managers = getCollectionManagers(state);
    const related = await Promise.all(
        managers.map((collection) => collection.getMostRelevant([...queries], limit, where)),
    );
    return related.flat();
};

export const getLatestDocuments = async (state: ContextStoreState, limit: number = 100): Promise<GenericEntry[]> => {
    const managers = getCollectionManagers(state);
    const latest = await Promise.all(managers.map((collection) => collection.getMostRecent(limit)));
    return latest.flat();
};

export const getCollection = (state: ContextStoreState, name: string): DualStoreManager<string, string> => {
    const collection = state.collections.get(name);
    if (!collection) {
        throw new Error(`Collection ${name} does not exist`);
    }
    return collection;
};

const compileContextInternal = async (
    state: ContextStoreState,
    options: Required<CompileContextOptions>,
): Promise<ContextMessage[]> => {
    const latest = await getLatestDocuments(state, options.recentLimit);
    const queryTexts = [...(options.texts ?? []), ...latest.map((doc) => doc.text)].slice(-options.queryLimit);
    const [relatedDocs, imageDocs] = await Promise.all([
        getAllRelatedDocuments(state, queryTexts, options.limit),
        getAllRelatedDocuments(state, queryTexts, options.limit, { type: 'image' }),
    ]);

    const combined = [...relatedDocs.filter((doc) => doc.metadata?.type !== 'image'), ...latest, ...imageDocs].filter(
        (entry): entry is GenericEntry => Boolean(entry.metadata) && typeof entry.text === 'string',
    );

    const deduped = dedupeByText(combined);
    const sorted = sortByTimestamp(deduped);
    const limited = limitByCollectionCount(sorted, options.limit, state.collections.size);
    return limited.map((entry) =>
        toMessage(entry, options.formatAssistantMessages, state.formatTime, state.assistantName),
    );
};

export const compileContext = async (
    state: ContextStoreState,
    textsOrOptions: readonly string[] | CompileContextOptions = [],
    ...legacyArgs: LegacyCompileArgs
): Promise<ContextMessage[]> => {
    const options = resolveCompileOptions(textsOrOptions, legacyArgs);

    const definedOptions = Object.fromEntries(
        Object.entries(options).filter(([, value]) => value !== undefined),
    ) as Partial<CompileContextOptions>;

    const resolvedTexts: readonly string[] = definedOptions.texts ?? DEFAULT_COMPILE_OPTIONS.texts;
    const resolved: Required<CompileContextOptions> = {
        ...DEFAULT_COMPILE_OPTIONS,
        ...definedOptions,
        texts: [...resolvedTexts],
    };

    return compileContextInternal(state, resolved);
};

// Functional factory alternative
export type ContextDeps = {
    getCollections: () => ReadonlyArray<DualStoreManager<string, string>>;
    resolveRole: (meta: DualStoreMetadata | undefined) => 'user' | 'assistant' | 'system';
    resolveDisplayName: (meta: DualStoreMetadata | undefined) => string;
    formatTime: (epochMs: number) => string;
};

export type CompileOptions = {
    texts?: readonly string[];
    recentLimit?: number;
    queryLimit?: number;
    limit?: number;
    formatAssistantMessages?: boolean;
};

export const makeContextStore = (
    deps: ContextDeps,
): { compileContext: (opts: CompileOptions) => Promise<ContextMessage[]> } => {
    const toEpochMs = (v: DualStoreTimestamp): number =>
        typeof v === 'number' ? v : typeof v === 'string' ? new Date(v).getTime() : v.getTime();

    const formatMessage = (entry: GenericEntry): string => {
        const meta = entry.metadata ?? {};
        const name = deps.resolveDisplayName(meta);
        const when = deps.formatTime(toEpochMs(entry.timestamp));
        const verb = meta.isThought ? 'thought' : 'said';
        return `${name} ${verb} (${when}): ${entry.text}`;
    };

    const toMessage = (entry: GenericEntry, useFormatted: boolean): ContextMessage => {
        const meta = entry.metadata ?? {};
        if (meta.type === 'image') {
            return {
                role: deps.resolveRole(meta),
                content: typeof meta.caption === 'string' ? meta.caption : '',
                images: [entry.text],
            };
        }
        const content = useFormatted ? formatMessage(entry) : entry.text;
        return { role: deps.resolveRole(meta), content };
    };

    const dedupeByText = (xs: readonly GenericEntry[]) => {
        const seen = new Set<string>();
        return xs.filter((e) => {
            const t = e.text;
            if (seen.has(t)) return false;
            seen.add(t);
            return true;
        });
    };

    const sortByTime = (xs: readonly GenericEntry[]) =>
        [...xs].sort((a, b) => toEpochMs(a.timestamp) - toEpochMs(b.timestamp));

    const getAllRelatedDocuments = async (queries: readonly string[], limit = 100, where?: Where) => {
        if (queries.length === 0) return [];
        const managers = deps.getCollections();
        const related = await Promise.all(managers.map((c) => c.getMostRelevant([...queries], limit, where)));
        return related.flat();
    };

    const getLatestDocuments = async (limit = 100) => {
        const managers = deps.getCollections();
        const latest = await Promise.all(managers.map((c) => c.getMostRecent(limit)));
        return latest.flat();
    };

    const compileContext = async (opts: CompileOptions = {}): Promise<ContextMessage[]> => {
        const { texts = [], recentLimit = 10, queryLimit = 5, limit = 20, formatAssistantMessages = false } = opts;
        const latest = await getLatestDocuments(recentLimit);
        const queryTexts = [...texts, ...latest.map((d) => d.text)].slice(-queryLimit);

        const [related, images] = await Promise.all([
            getAllRelatedDocuments(queryTexts, limit),
            getAllRelatedDocuments(queryTexts, limit, { type: 'image' }),
        ]);

        const combined = [...related.filter((d) => d.metadata?.type !== 'image'), ...latest, ...images].filter(
            (e): e is GenericEntry => typeof e.text === 'string' && e.metadata !== undefined,
        );

        const deduped = dedupeByText(combined);
        const sorted = sortByTime(deduped);
        const limited = sorted.slice(-limit * Math.max(deps.getCollections().length, 1) * 2);
        return limited.map((e) => toMessage(e, formatAssistantMessages));
    };

    return {
        compileContext,
    };
};
