import test from 'ava';
import request from 'supertest';
import { createApp } from '../index.js';

class FakeRetriever {
    async retrieve() {
        return { search: [] } as any;
    }
}
class FakeBackend {
    async chat() {
        return 'ok';
    }
}

test('POST /v1/completions requires non-empty prompt', async (t) => {
    const app = createApp({
        retriever: new FakeRetriever() as any,
        backend: new FakeBackend() as any,
        backendModel: 'fake',
    });
    // Missing prompt
    let res = await request(app).post('/v1/completions').send({ model: 'fake' }).expect(400);
    t.truthy(res.body.error);
    t.is(res.body.error.type, 'invalid_request_error');

    // Empty prompt string
    res = await request(app)
        .post('/v1/completions')
        .send({ model: 'fake', prompt: '' })
        .expect(400);
    t.truthy(res.body.error);
    t.is(res.body.error.type, 'invalid_request_error');
});
