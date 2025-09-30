import type { EventEmitter } from 'node:events';

import ollama, { type Message } from 'ollama';

const SYSTEM_PROMPT = 'Generate an engaging Twitch stream title (max 60 characters) based on recent context.';
const BANNED_WORDS = [/\bnsfw\b/i] as const;

export type OllamaClient = Pick<typeof ollama, 'chat'>;

export type TitleContextSource = {
    fetch(): Promise<ReadonlyArray<Message>>;
};

export type TitleStore = {
    save(title: string): Promise<void>;
};

export class MemoryTitleStore implements TitleStore {
    #titles: readonly string[] = [];

    public get titles(): readonly string[] {
        return this.#titles;
    }

    public async save(title: string): Promise<void> {
        this.#titles = [...this.#titles, title];
    }
}

export type DiscordTranscriptEntry = {
    readonly author: string;
    readonly content: string;
};

export class DiscordTranscriptSource implements TitleContextSource {
    public constructor(private readonly getLatest: () => Promise<ReadonlyArray<DiscordTranscriptEntry>>) {}

    public async fetch(): Promise<ReadonlyArray<Message>> {
        const transcript = await this.getLatest();
        return transcript.map((entry) => ({
            role: 'user',
            content: `${entry.author}: ${entry.content}`,
        }));
    }
}

type TitleSafetyDependencies = {
    readonly bannedWords: ReadonlyArray<RegExp>;
};

const DEFAULT_TITLE_GENERATION: Readonly<{
    bannedWords: ReadonlyArray<RegExp>;
    client: OllamaClient;
    model: string;
    systemPrompt: string;
}> = Object.freeze({
    bannedWords: BANNED_WORDS as ReadonlyArray<RegExp>,
    client: ollama as OllamaClient,
    model: 'gemma3:latest',
    systemPrompt: SYSTEM_PROMPT,
});

type GenerateTitleDependencies = typeof DEFAULT_TITLE_GENERATION;

function isTitleSafe(title: string, dependencies: TitleSafetyDependencies = DEFAULT_TITLE_GENERATION): boolean {
    return !dependencies.bannedWords.some((pattern) => pattern.test(title));
}

export type GenerateTwitchStreamTitleOptions = Partial<GenerateTitleDependencies>;

type GenerateTwitchStreamTitleArgs = GenerateTwitchStreamTitleOptions | string | undefined;

function normalizeGenerateTitleOptions(options: GenerateTwitchStreamTitleArgs): GenerateTwitchStreamTitleOptions {
    if (options === undefined) {
        return {};
    }

    if (typeof options === 'string') {
        return { model: options } satisfies GenerateTwitchStreamTitleOptions;
    }

    if (options === null || typeof options !== 'object' || Array.isArray(options)) {
        throw new TypeError('generateTwitchStreamTitle options must be an object or model string');
    }

    return options;
}

export async function generateTwitchStreamTitle(
    context: ReadonlyArray<Message>,
    options: GenerateTwitchStreamTitleOptions | string = {},
): Promise<string> {
    const normalizedOptions = normalizeGenerateTitleOptions(options);
    const { bannedWords, client, model, systemPrompt } = {
        ...DEFAULT_TITLE_GENERATION,
        ...normalizedOptions,
    } satisfies GenerateTitleDependencies;

    const response = await client.chat({
        model,
        messages: [{ role: 'system', content: systemPrompt }, ...context],
    });
    const title = response.message.content.trim();
    if (!isTitleSafe(title, { bannedWords })) {
        throw new Error('Generated title failed safety check');
    }
    return title;
}

export type GenerateAndStoreTitleOptions = GenerateTwitchStreamTitleOptions;

export async function generateAndStoreTitle(
    source: TitleContextSource,
    store: TitleStore,
    options: GenerateAndStoreTitleOptions | string = {},
): Promise<string> {
    const context = await source.fetch();
    const title = await generateTwitchStreamTitle(context, options);
    await store.save(title);
    return title;
}

export type WatchContextAndGenerateOptions = GenerateTwitchStreamTitleOptions;

export function watchContextAndGenerate(
    emitter: EventEmitter,
    source: TitleContextSource,
    store: TitleStore,
    options: WatchContextAndGenerateOptions | string = {},
): void {
    emitter.on('context', async () => {
        try {
            await generateAndStoreTitle(source, store, options);
        } catch (error) {
            console.error('title generation failed', error);
        }
    });
}
