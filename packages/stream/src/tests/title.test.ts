import { EventEmitter } from 'node:events';

import test from 'ava';
import ollama, { type Message } from 'ollama';
import {
    DiscordTranscriptSource,
    MemoryTitleStore,
    generateAndStoreTitle,
    generateTwitchStreamTitle,
    watchContextAndGenerate,
    type GenerateTwitchStreamTitleOptions,
} from '../title.js';

type ChatRequest = Parameters<typeof ollama.chat>[0];
type ChatResponse = Awaited<ReturnType<typeof ollama.chat>>;
type ChatFunction = typeof ollama.chat;

const withChatStub = (
    handler: (request: ChatRequest & { readonly stream?: false }) => Promise<ChatResponse>,
): GenerateTwitchStreamTitleOptions => ({
    client: {
        chat: ((request: ChatRequest) => {
            if (request.stream === true) {
                throw new Error('streaming responses are not supported in this test stub');
            }
            return handler(request as ChatRequest & { readonly stream?: false });
        }) as ChatFunction,
    },
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
    const options = withChatStub(async ({ messages }) => {
        if (messages === undefined) {
            throw new Error('chat request missing messages');
        }
        const systemMessage = messages[0];
        t.is(systemMessage?.role, 'system');
        return {
            message: { content: 'Cozy coding stream' },
        } satisfies { message: { content: string } } as ChatResponse;
    });
    const title = await generateTwitchStreamTitle([{ role: 'user', content: 'build UI' }], options);
    t.is(title, 'Cozy coding stream');

    // Unsafe title triggers rejection
    const unsafeOptions = withChatStub(
        async () =>
            ({
                message: { content: 'NSFW surprise' },
            }) satisfies { message: { content: string } } as ChatResponse,
    );
    await t.throwsAsync(() => generateTwitchStreamTitle([], unsafeOptions), {
        message: /failed safety check/,
    });
});

test.serial('generateTwitchStreamTitle preserves legacy model string parameter', async (t) => {
    const customModel = 'duck-model';
    const originalChat = ollama.chat;

    try {
        (ollama as { chat: ChatFunction }).chat = (async ({ model }: ChatRequest) => {
            t.is(model, customModel);
            return {
                message: { content: 'Legacy compatible stream' },
            } satisfies { message: { content: string } } as ChatResponse;
        }) as ChatFunction;

        const title = await generateTwitchStreamTitle([], customModel);
        t.is(title, 'Legacy compatible stream');
    } finally {
        (ollama as { chat: ChatFunction }).chat = originalChat;
    }

    await t.throwsAsync(() => generateTwitchStreamTitle([], 42 as unknown as GenerateTwitchStreamTitleOptions), {
        instanceOf: TypeError,
    });

    const options = withChatStub(async ({ model }: ChatRequest) => {
        t.is(model, 'gemma3:latest');
        return {
            message: { content: 'Object options still work' },
        } satisfies { message: { content: string } } as ChatResponse;
    });

    const titled = await generateTwitchStreamTitle([], options);
    t.is(titled, 'Object options still work');
});

test.serial('generateAndStoreTitle fetches context, generates title, and saves it', async (t) => {
    const source = {
        fetch: async () => [{ role: 'user', content: 'context' }],
    } satisfies {
        fetch: () => Promise<ReadonlyArray<Message>>;
    };
    const store = new MemoryTitleStore();
    const options = withChatStub(
        async () =>
            ({
                message: { content: 'Friendly vibes' },
            }) satisfies { message: { content: string } } as ChatResponse,
    );

    const title = await generateAndStoreTitle(source, store, options);
    t.is(title, 'Friendly vibes');
    t.deepEqual(store.titles, ['Friendly vibes']);
});

test.serial('watchContextAndGenerate listens for context events and logs failures', async (t) => {
    const emitter = new EventEmitter();
    const store = new MemoryTitleStore();
    const source = {
        fetch: async () => [{ role: 'user', content: 'context' }],
    } satisfies {
        fetch: () => Promise<ReadonlyArray<Message>>;
    };

    const originalError = console.error;

    const errorCall = new Promise<readonly unknown[]>((resolve) => {
        console.error = (...args: readonly unknown[]) => {
            resolve(args);
        };
    });

    try {
        const responses = ['Stream time', 'nsfw mention'] as const;
        const iterator: IterableIterator<string> = responses[Symbol.iterator]();
        const options = withChatStub(async () => {
            const next = iterator.next();
            const content = typeof next.value === 'string' ? next.value : 'fallback';
            return {
                message: { content },
            } satisfies { message: { content: string } } as ChatResponse;
        });
        watchContextAndGenerate(emitter, source, store, options);
        emitter.emit('context');
        await new Promise((resolve) => setImmediate(resolve));
        t.is(store.titles[0], 'Stream time');

        emitter.emit('context');
        const [, error] = await errorCall;
        t.truthy(error);
        t.is(store.titles.length, 1);
    } finally {
        console.error = originalError;
    }
});
