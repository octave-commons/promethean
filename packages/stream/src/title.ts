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

const DEFAULT_TITLE_GENERATION = Object.freeze({
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

export async function generateTwitchStreamTitle(
    context: ReadonlyArray<Message>,
    options: GenerateTwitchStreamTitleOptions = {},
): Promise<string> {
    const { bannedWords, client, model, systemPrompt } = {
        ...DEFAULT_TITLE_GENERATION,
        ...options,
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
    options: GenerateAndStoreTitleOptions = {},
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
    options: WatchContextAndGenerateOptions = {},
): void {
    emitter.on('context', async () => {
        try {
            await generateAndStoreTitle(source, store, options);
        } catch (error) {
            console.error('title generation failed', error);
        }
    });
}
