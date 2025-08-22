import test from 'ava';
import { SmartGptrRetriever } from '../retriever.js';
const calls = [];
const fakeFetch = async (url, init) => {
    calls.push({ url, init });
    return { json: async () => ({ ok: true, results: [] }) };
};
test('SmartGptrRetriever adds bearer token header', async (t) => {
    const r = new SmartGptrRetriever('http://localhost:3210', 'abc123', fakeFetch);
    await r.retrieve('hello');
    t.true(calls.length > 0);
    const h = calls[0].init.headers;
    t.is(h['authorization'], 'Bearer abc123');
});
