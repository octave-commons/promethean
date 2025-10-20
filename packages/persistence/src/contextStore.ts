import type { Where } from 'chromadb';

import { DualStoreManager } from './dualStore.js';
import type { DualStoreEntry, DualStoreTimestamp } from './types.js';

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

export class ContextStore {
    private collections: ReadonlyMap<string, DualStoreManager<string, string>> = new Map();
    private formatTime: (epochMs: number) => string;
    private assistantName: string;

    constructor(
        formatTime: (epochMs: number) => string = (ms) => new Date(ms).toISOString(),
        assistantName: string = 'Duck',
    ) {
        this.formatTime = formatTime;
        this.assistantName = assistantName;
    }

    private getCollectionManagers(): readonly DualStoreManager<string, string>[] {
        return Array.from(this.collections.values());
    }

    collectionCount(): number {
        return this.collections.size;
    }

    listCollectionNames(): readonly string[] {
        return Array.from(this.collections.keys());
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
    async getOrCreateCollection(name: string): Promise<DualStoreManager<string, string>> {
        if (this.collections.has(name)) {
            return this.collections.get(name)!;
        }

        const collectionManager = await DualStoreManager.create<string, string>(name, 'text', 'timestamp');
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
    ): Promise<ContextMessage[]> {
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

        return this.compileContextInternal(resolved);
    }

    private async compileContextInternal(options: Required<CompileContextOptions>): Promise<ContextMessage[]> {
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
        return limited.map((entry) =>
            toMessage(entry, options.formatAssistantMessages, this.formatTime, this.assistantName),
        );
    }
}
