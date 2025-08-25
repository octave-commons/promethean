import test from 'node:test';
import assert from 'node:assert/strict';
import { startSitesServer } from '../../scripts/serve-sites.js';

test('serves LLM chat via file server', async () => {
    const server = await startSitesServer(0);
    const port = server.address().port;
    const res = await fetch(`http://127.0.0.1:${port}/llm-chat/`);
    const text = await res.text();
    server.close();
    assert.ok(text.includes('LLM Chat'));
});
