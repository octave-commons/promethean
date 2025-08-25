import test from 'ava';
import request from 'supertest';
import { createApp } from '../index.js';

class FakeRetriever {
    calls: any[] = [];
    async retrieve(q: string) {
        this.calls.push(q);
        return {
            search: [
                {
                    path: 'AGENTS.md',
                    snippet: 'Promethean Framework overview',
                    startLine: 1,
                    endLine: 3,
                },
            ],
        } as any;
    }
}

class FakeBackend {
    async chat() {
        return 'Hello from fake backend';
    }
}

test('POST /v1/chat/completions returns OpenAI-compatible response', async (t) => {
    const retriever = new FakeRetriever() as any;
    const app = createApp({ retriever, backendModel: 'fake', backend: new FakeBackend() as any });
    const res = await request(app)
        .post('/v1/chat/completions')
        .send({ model: 'fake', messages: [{ role: 'user', content: 'hi' }] })
        .expect(200);
    t.truthy(res.body.id);
    t.is(res.body.object, 'chat.completion');
    t.true(Array.isArray(res.body.choices));
    t.truthy(res.body.usage);
});

test('POST /v1/completions returns OpenAI-compatible response', async (t) => {
    const retriever = new FakeRetriever() as any;
    const app = createApp({ retriever, backendModel: 'fake', backend: new FakeBackend() as any });
    const res = await request(app)
        .post('/v1/completions')
        .send({ model: 'fake', prompt: 'Say hello' })
        .expect(200);
    t.truthy(res.body.id);
    t.is(res.body.object, 'text_completion');
    t.true(Array.isArray(res.body.choices));
    t.truthy(res.body.usage);
});
