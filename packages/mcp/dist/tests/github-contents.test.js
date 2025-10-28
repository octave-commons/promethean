import test from 'ava';
import { githubContentsWrite } from '../tools/github/contents.js';
const entriesFromHeaders = (headers) => {
    if (headers instanceof Headers) {
        return Array.from(headers.entries()).map(([key, value]) => [key, value]);
    }
    if (Array.isArray(headers)) {
        return headers.map(([key, value]) => [key, value]);
    }
    return Object.entries(headers).map(([key, value]) => [key, value]);
};
const toHeadersRecord = (headers) => {
    if (!headers) {
        return {};
    }
    return entriesFromHeaders(headers).reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};
const toBodyString = (body) => {
    if (body === undefined || body === null) {
        return '';
    }
    return typeof body === 'string' ? body : String(body);
};
const toUrlString = (input) => {
    if (typeof input === 'string') {
        return input;
    }
    if (input instanceof URL) {
        return input.toString();
    }
    if (input instanceof Request) {
        return input.url;
    }
    return String(input);
};
const parseJson = (text) => JSON.parse(text);
const createJsonResponse = (body, status) => new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
});
const expectedUtf8Headers = Object.freeze({
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'X-GitHub-Api-Version': '2022-11-28',
    Authorization: 'Bearer test-token',
});
const expectedUtf8Payload = {
    message: 'docs: add readme',
    content: Buffer.from('Hello, world!', 'utf8').toString('base64'),
    encoding: 'base64',
    branch: 'main',
};
test('github_contents_write encodes utf-8 content', async (t) => {
    const ctx = {
        env: {
            GITHUB_BASE_URL: 'https://api.github.test',
            GITHUB_API_VERSION: '2022-11-28',
            GITHUB_TOKEN: 'test-token',
        },
        fetch: (async (...args) => {
            const [input, init] = args;
            const requestInit = init;
            t.is(toUrlString(input), 'https://api.github.test/repos/promethean/mcp/contents/docs/read%20me.md');
            t.deepEqual(toHeadersRecord(requestInit?.headers), expectedUtf8Headers);
            const payload = parseJson(toBodyString(requestInit?.body));
            t.deepEqual(payload, expectedUtf8Payload);
            return createJsonResponse({ commit: { sha: 'abc123' }, content: { path: 'docs/readme.md' } }, 201);
        }),
        now: () => new Date(),
    };
    const tool = githubContentsWrite(ctx);
    const result = (await tool.invoke({
        owner: 'promethean',
        repo: 'mcp',
        path: 'docs/read me.md',
        message: 'docs: add readme',
        content: 'Hello, world!',
        branch: 'main',
    }));
    t.is(result.status, 201);
    t.deepEqual(result.data.commit, { sha: 'abc123' });
});
test('github_contents_write accepts pre-encoded base64 content', async (t) => {
    t.plan(1);
    const encoded = Buffer.from('binary', 'utf8').toString('base64');
    const ctx = {
        env: {},
        fetch: (async (_input, init) => {
            const payload = parseJson(toBodyString(init?.body));
            t.is(payload.content, encoded);
            return createJsonResponse({ ok: true }, 200);
        }),
        now: () => new Date(),
    };
    const tool = githubContentsWrite(ctx);
    await tool.invoke({
        owner: 'promethean',
        repo: 'mcp',
        path: 'binary.bin',
        message: 'chore: upload',
        content: encoded,
        encoding: 'base64',
    });
});
test('github_contents_write throws on invalid base64 input', async (t) => {
    const ctx = {
        env: {},
        fetch: (async () => {
            throw new Error('fetch should not be called');
        }),
        now: () => new Date(),
    };
    const tool = githubContentsWrite(ctx);
    await t.throwsAsync(() => tool.invoke({
        owner: 'promethean',
        repo: 'mcp',
        path: 'bad.bin',
        message: 'chore: upload',
        content: 'not-base64@@',
        encoding: 'base64',
    }), { message: /invalid base64/i });
});
test('github_contents_write decodes base64 payloads in responses', async (t) => {
    const contentText = 'export const value = 42;';
    const raw = Buffer.from(contentText, 'utf8').toString('base64');
    const ctx = {
        env: {},
        fetch: (async () => new Response(JSON.stringify({
            content: {
                name: 'file.ts',
                encoding: 'base64',
                content: raw,
            },
        }), { status: 200, headers: { 'content-type': 'application/json' } })),
        now: () => new Date(),
    };
    const tool = githubContentsWrite(ctx);
    const result = (await tool.invoke({
        owner: 'promethean',
        repo: 'mcp',
        path: 'src/file.ts',
        message: 'feat: add file',
        content: contentText,
    }));
    t.deepEqual(result.data, {
        content: {
            name: 'file.ts',
            encoding: 'utf-8',
            rawEncoding: 'base64',
            content: contentText,
            rawContent: raw,
        },
    });
});
//# sourceMappingURL=github-contents.test.js.map