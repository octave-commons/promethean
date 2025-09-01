import test from 'ava';
import { EventEmitter } from 'node:events';
import ollama, { type Message } from 'ollama';
import {
    generateTwitchStreamTitle,
    generateAndStoreTitle,
    watchContextAndGenerate,
    MemoryTitleStore,
} from '@promethean/stream/title.js';

interface TitleContextSource {
    fetch(): Promise<Message[]>;
}

const message: Message = {
    role: 'user',
    content: 'Speedrunning classic RPGs today!',
};

test('generateTwitchStreamTitle uses ollama.chat', async (t) => {
    const proto = Object.getPrototypeOf(ollama) as {
        chat: (args: { model: string; messages: Message[] }) => Promise<{ message: { content: string } }>;
    };
    const original = proto.chat;
    proto.chat = async (args) => {
        t.is(args.model, 'gemma3:latest');
        t.truthy(args.messages.find((m) => m.role === 'system'));
        return { message: { content: 'Fastest RPG Runs!' } };
    };

    const title = await generateTwitchStreamTitle([message]);
    t.is(title, 'Fastest RPG Runs!');

    proto.chat = original;
});

test('generateTwitchStreamTitle rejects unsafe titles', async (t) => {
    const proto = Object.getPrototypeOf(ollama) as {
        chat: (args: { model: string; messages: Message[] }) => Promise<{ message: { content: string } }>;
    };
    const original = proto.chat;
    proto.chat = async () => ({ message: { content: 'NSFW adventure' } });

    await t.throwsAsync(() => generateTwitchStreamTitle([message]));

    proto.chat = original;
});

test('generateAndStoreTitle saves generated title', async (t) => {
    const proto = Object.getPrototypeOf(ollama) as {
        chat: (args: { model: string; messages: Message[] }) => Promise<{ message: { content: string } }>;
    };
    const original = proto.chat;
    proto.chat = async () => ({ message: { content: 'Fastest RPG Runs!' } });

    const source: TitleContextSource = {
        fetch: async () => [message],
    };
    const store = new MemoryTitleStore();

    const title = await generateAndStoreTitle(source, store);
    t.is(title, 'Fastest RPG Runs!');
    t.deepEqual(store.titles, ['Fastest RPG Runs!']);

    proto.chat = original;
});

test('watchContextAndGenerate reacts to context event', async (t) => {
    const proto = Object.getPrototypeOf(ollama) as {
        chat: (args: { model: string; messages: Message[] }) => Promise<{ message: { content: string } }>;
    };
    const original = proto.chat;
    proto.chat = async () => ({ message: { content: 'Fastest RPG Runs!' } });

    const source: TitleContextSource = {
        fetch: async () => [message],
    };
    const store = new MemoryTitleStore();
    const emitter = new EventEmitter();

    watchContextAndGenerate(emitter, source, store);
    emitter.emit('context');
    await new Promise((r) => setTimeout(r, 0));

    t.deepEqual(store.titles, ['Fastest RPG Runs!']);

    proto.chat = original;
});
