import test from 'ava';
import { authorize } from '../src/auth.js';

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
