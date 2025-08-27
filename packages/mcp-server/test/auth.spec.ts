import test from 'ava';
import { authorize } from '../src/auth.js';

// Token mismatch should return false
// and origin allowlist should restrict origins

test('authorize returns false when token does not match', (t) => {
    const prevToken = process.env.MCP_TOKEN;
    process.env.MCP_TOKEN = 'secret';

    const result = authorize('wrong', 'https://example.com');
    t.false(result);

    if (prevToken === undefined) delete process.env.MCP_TOKEN;
    else process.env.MCP_TOKEN = prevToken;
});

test('authorize respects origin allowlist', (t) => {
    const prevToken = process.env.MCP_TOKEN;
    const prevAllowlist = process.env.MCP_ORIGIN_ALLOWLIST;

    process.env.MCP_TOKEN = 'secret';
    process.env.MCP_ORIGIN_ALLOWLIST = 'https://allowed.com,https://other.com';

    t.true(authorize('secret', 'https://allowed.com'));
    t.false(authorize('secret', 'https://notallowed.com'));

    if (prevToken === undefined) delete process.env.MCP_TOKEN;
    else process.env.MCP_TOKEN = prevToken;

    if (prevAllowlist === undefined) delete process.env.MCP_ORIGIN_ALLOWLIST;
    else process.env.MCP_ORIGIN_ALLOWLIST = prevAllowlist;
});

