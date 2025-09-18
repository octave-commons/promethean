import type { EventEmitter } from 'node:events';

import ollama, { type Message } from 'ollama';

const SYSTEM_PROMPT = 'Generate an engaging Twitch stream title (max 60 characters) based on recent context.';
const BANNED_WORDS = [/\bnsfw\b/i];

type OllamaClient = {
    chat: typeof ollama.chat;
};

let activeOllama: OllamaClient = ollama;

export function setOllamaClient(client: OllamaClient): void {
    activeOllama = client;
}

export function resetOllamaClient(): void {
    activeOllama = ollama;
}

export type TitleContextSource = {
    fetch(): Promise<Message[]>;
};

export type TitleStore = {
    save(title: string): Promise<void>;
};

export class MemoryTitleStore implements TitleStore {
    public titles: string[] = [];

    async save(title: string): Promise<void> {
        this.titles.push(title);
    }
}

export type DiscordTranscriptEntry = {
    author: string;
    content: string;
};

export class DiscordTranscriptSource implements TitleContextSource {
    constructor(private readonly getLatest: () => Promise<DiscordTranscriptEntry[]>) {}

    async fetch(): Promise<Message[]> {
        const transcript = await this.getLatest();
        return transcript.map((t) => ({
            role: 'user',
            content: `${t.author}: ${t.content}`,
        }));
    }
}

function isTitleSafe(title: string): boolean {
    return !BANNED_WORDS.some((re) => re.test(title));
}

export async function generateTwitchStreamTitle(context: Message[], model = 'gemma3:latest'): Promise<string> {
    const res = await activeOllama.chat({
        model,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...context],
    });
    const title = res.message.content.trim();
    if (!isTitleSafe(title)) {
        throw new Error('Generated title failed safety check');
    }
    return title;
}

export async function generateAndStoreTitle(
    source: TitleContextSource,
    store: TitleStore,
    model = 'gemma3:latest',
): Promise<string> {
    const context = await source.fetch();
    const title = await generateTwitchStreamTitle(context, model);
    await store.save(title);
    return title;
}

export function watchContextAndGenerate(
    emitter: EventEmitter,
    source: TitleContextSource,
    store: TitleStore,
    model = 'gemma3:latest',
): void {
    emitter.on('context', async () => {
        try {
            await generateAndStoreTitle(source, store, model);
        } catch (err) {
            console.error('title generation failed', err);
        }
    });
}
