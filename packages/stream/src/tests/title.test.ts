import test from 'ava';
import { EventEmitter } from 'node:events';
import ollama, { type Message } from 'ollama';
import {
    DiscordTranscriptSource,
    MemoryTitleStore,
    generateAndStoreTitle,
    generateTwitchStreamTitle,
    watchContextAndGenerate,
    resetOllamaClient,
    setOllamaClient,
} from '../title.js';

const stubChat = (impl: (request: any) => Promise<any>) => {
    setOllamaClient({
        chat: impl as unknown as typeof ollama.chat,
    });
};

test.afterEach.always(() => {
    resetOllamaClient();
});

test('DiscordTranscriptSource formats entries as chat messages', async (t) => {
    const source = new DiscordTranscriptSource(async () => [
        { author: 'duck', content: 'quack' },
        { author: 'goose', content: 'honk' },
    ]);
    const messages = await source.fetch();
    t.deepEqual(messages, [
        { role: 'user', content: 'duck: quack' },
        { role: 'user', content: 'goose: honk' },
    ]);
});

test('MemoryTitleStore collects saved titles', async (t) => {
    const store = new MemoryTitleStore();
    await store.save('first');
    await store.save('second');
    t.deepEqual(store.titles, ['first', 'second']);
});

test.serial('generateTwitchStreamTitle delegates to ollama and enforces safety', async (t) => {
    const calls: Message[][] = [];
    stubChat(async ({ messages }: { messages: Message[] }) => {
        calls.push(messages);
        return { message: { content: 'Cozy coding stream' } } as any;
    });
    const title = await generateTwitchStreamTitle([{ role: 'user', content: 'build UI' }]);
    t.is(title, 'Cozy coding stream');
    t.is(calls[0]?.[0]?.role, 'system');

    // Unsafe title triggers rejection
    stubChat(async () => ({ message: { content: 'NSFW surprise' } }));
    await t.throwsAsync(() => generateTwitchStreamTitle([]), {
        message: /failed safety check/,
    });
});

test.serial('generateAndStoreTitle fetches context, generates title, and saves it', async (t) => {
    const source = { fetch: async () => [{ role: 'user', content: 'context' }] };
    const store = new MemoryTitleStore();
    stubChat(async () => ({ message: { content: 'Friendly vibes' } }));

    const title = await generateAndStoreTitle(source, store);
    t.is(title, 'Friendly vibes');
    t.deepEqual(store.titles, ['Friendly vibes']);
});

test.serial('watchContextAndGenerate listens for context events and logs failures', async (t) => {
    const emitter = new EventEmitter();
    const store = new MemoryTitleStore();
    let attempts = 0;

    const source = {
        fetch: async () => {
            attempts += 1;
            return [{ role: 'user', content: 'context' }];
        },
    };

    const errors: unknown[] = [];
    const originalError = console.error;
    console.error = (...args: unknown[]) => {
        errors.push(args);
    };

    try {
        stubChat(async () => ({ message: { content: 'Stream time' } }));
        watchContextAndGenerate(emitter, source, store);
        emitter.emit('context');
        await new Promise((resolve) => setImmediate(resolve));
        t.is(store.titles[0], 'Stream time');
        t.is(attempts, 1);

        // Make generation fail and ensure error logged without throwing
        stubChat(async () => ({ message: { content: 'nsfw mention' } }));
        emitter.emit('context');
        await new Promise((resolve) => setImmediate(resolve));
        t.true(errors.length > 0);
        t.is(store.titles.length, 1);
    } finally {
        console.error = originalError;
    }
});
