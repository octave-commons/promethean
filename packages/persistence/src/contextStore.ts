import type { Message } from 'ollama';
import type { Where } from 'chromadb';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';

import { DualStoreManager } from './dualStore.js';
import type { DualStoreEntry, DualStoreMetadata, DualStoreTimestamp } from './types.js';

TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo('en-US');

const toEpochMilliseconds = (value: DualStoreTimestamp): number => {
    if (value instanceof Date) return value.getTime();
    if (typeof value === 'string') return new Date(value).getTime();
    return value;
};

const resolveDisplayName = (metadata: DualStoreMetadata | undefined): string => {
    if (!metadata?.userName) return 'Unknown user';
    return metadata.userName === 'Duck' ? 'You' : metadata.userName;
};

const resolveRole = (metadata: DualStoreMetadata | undefined): Message['role'] => {
    if (!metadata || metadata.userName !== 'Duck') return 'user';
    return metadata.isThought ? 'system' : 'assistant';
};

export const formatMessage = (entry: DualStoreEntry<'text', 'timestamp'>): string => {
    const metadata = entry.metadata ?? {};
    const displayName = resolveDisplayName(metadata);
    const verb = metadata.isThought ? 'thought' : 'said';
    const formattedTime = timeAgo.format(toEpochMilliseconds(entry.timestamp));
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

const dedupeByText = (entries: readonly GenericEntry[]): GenericEntry[] =>
    entries.filter((entry, index, array) => array.findIndex((candidate) => candidate.text === entry.text) === index);

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

const toMessage = (entry: GenericEntry, formatAssistantMessages: boolean): Message => {
    const metadata = entry.metadata ?? {};
    if (metadata.type === 'image') {
        return {
            role: resolveRole(metadata),
            content: typeof metadata.caption === 'string' ? metadata.caption : '',
            images: [entry.text],
        };
    }

    const content = metadata.userName === 'Duck' && !formatAssistantMessages ? entry.text : formatMessage(entry);
    return {
        role: resolveRole(metadata),
        content,
    };
};

export class ContextStore {
    private collections: ReadonlyMap<string, DualStoreManager<string, string>> = new Map();

    private getCollectionManagers(): readonly DualStoreManager<string, string>[] {
        return Array.from(this.collections.values());
    }

    async createCollection(
        name: string,
        textKey: string,
        timeStampKey: string,
    ): Promise<DualStoreManager<string, string>> {
        if (this.collections.has(name)) {
            throw new Error(`Collection ${name} already exists`);
        }

        const collectionManager = await DualStoreManager.create<string, string>(name, textKey, timeStampKey);
        this.collections = new Map([...this.collections, [name, collectionManager]]);
        return collectionManager;
    }

    async getAllRelatedDocuments(
        queries: readonly string[],
        limit: number = 100,
        where?: Where,
    ): Promise<GenericEntry[]> {
        if (queries.length === 0) {
            return [];
        }

        const managers = this.getCollectionManagers();
        const related = await Promise.all(
            managers.map((collection) => collection.getMostRelevant([...queries], limit, where)),
        );
        return related.flat();
    }

    async getLatestDocuments(limit: number = 100): Promise<GenericEntry[]> {
        const managers = this.getCollectionManagers();
        const latest = await Promise.all(managers.map((collection) => collection.getMostRecent(limit)));
        return latest.flat();
    }

    getCollection(name: string): DualStoreManager<string, string> {
        const collection = this.collections.get(name);
        if (!collection) {
            throw new Error(`Collection ${name} does not exist`);
        }
        return collection;
    }

    async compileContext(
        textsOrOptions: readonly string[] | CompileContextOptions = [],
        ...legacyArgs: LegacyCompileArgs
    ): Promise<Message[]> {
        const options = resolveCompileOptions(textsOrOptions, legacyArgs);

        const resolvedTexts: readonly string[] = options.texts ?? DEFAULT_COMPILE_OPTIONS.texts;
        const resolved: Required<CompileContextOptions> = {
            ...DEFAULT_COMPILE_OPTIONS,
            ...options,
            texts: [...resolvedTexts],
        };

        return this.compileContextInternal(resolved);
    }

    private async compileContextInternal(options: Required<CompileContextOptions>): Promise<Message[]> {
        const latest = await this.getLatestDocuments(options.recentLimit);
        const queryTexts = [...(options.texts ?? []), ...latest.map((doc) => doc.text)].slice(-options.queryLimit);
        const [relatedDocs, imageDocs] = await Promise.all([
            this.getAllRelatedDocuments(queryTexts, options.limit),
            this.getAllRelatedDocuments(queryTexts, options.limit, { type: 'image' }),
        ]);

        const combined = [
            ...relatedDocs.filter((doc) => doc.metadata?.type !== 'image'),
            ...latest,
            ...imageDocs,
        ].filter((entry): entry is GenericEntry => Boolean(entry.metadata) && typeof entry.text === 'string');

        const deduped = dedupeByText(combined);
        const sorted = sortByTimestamp(deduped);
        const limited = limitByCollectionCount(sorted, options.limit, this.collections.size);
        return limited.map((entry) => toMessage(entry, options.formatAssistantMessages));
    }
}
