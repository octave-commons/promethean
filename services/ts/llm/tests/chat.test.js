import test from 'ava';
import { start, setCallOllamaFn } from '../src/index.js';

let server;

test.before(async () => {
    process.env.NODE_ENV = 'test';
    setCallOllamaFn(async () => 'hi');
    server = await start(0);
});

test.after.always(() => {
    if (server) server.close();
});

test('serves chat interface', async (t) => {
    const port = server.address().port;
    const res = await fetch(`http://127.0.0.1:${port}/`);
    const text = await res.text();
    t.true(text.includes('LLM Chat'));
});
