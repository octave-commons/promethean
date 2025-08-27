
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


import test from 'ava';

import { authorize } from '../src/auth.js';

test('returns false when token mismatches', (t) => {
    const old = process.env.MCP_TOKEN;
    process.env.MCP_TOKEN = 'secret';
    t.false(authorize('wrong', undefined));
    t.true(authorize('secret', undefined));
    if (old === undefined) delete process.env.MCP_TOKEN;
    else process.env.MCP_TOKEN = old;
});

test('respects MCP_ORIGIN_ALLOWLIST', (t) => {
    const old = process.env.MCP_ORIGIN_ALLOWLIST;
    process.env.MCP_ORIGIN_ALLOWLIST = 'https://allowed.com';
    t.true(authorize(undefined, 'https://allowed.com'));
    t.false(authorize(undefined, 'https://blocked.com'));
    if (old === undefined) delete process.env.MCP_ORIGIN_ALLOWLIST;
    else process.env.MCP_ORIGIN_ALLOWLIST = old;
});

test('rejects mismatched token', (t) => {
    const prev = process.env.MCP_TOKEN;
    try {
        process.env.MCP_TOKEN = 'secret';
        t.false(authorize('wrong', undefined));
    } finally {
        if (prev === undefined) delete process.env.MCP_TOKEN;
        else process.env.MCP_TOKEN = prev;
    }
});

test('checks origin against allowlist', (t) => {
    const prev = process.env.MCP_ORIGIN_ALLOWLIST;
    try {
        process.env.MCP_ORIGIN_ALLOWLIST = 'https://allowed.com,https://other.com';
        t.true(authorize(undefined, 'https://allowed.com'));
        t.false(authorize(undefined, 'https://evil.com'));
    } finally {
        if (prev === undefined) delete process.env.MCP_ORIGIN_ALLOWLIST;
        else process.env.MCP_ORIGIN_ALLOWLIST = prev;
    }
});
