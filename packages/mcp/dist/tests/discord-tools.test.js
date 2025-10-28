import test from 'ava';
import esmock from 'esmock';
const channelIdFrom = (spaceUrn) => {
    const parts = spaceUrn.split(':');
    return parts[parts.length - 1] ?? spaceUrn;
};
const record = (ref, value) => {
    ref.current = [...ref.current, value];
};
const buildRoute = (method, channelId) => ({ method, route: `/channels/${channelId}/messages` });
function createProxyStub() {
    const sendCalls = { current: [] };
    const listCalls = {
        current: [],
    };
    const postUrns = { current: [] };
    return {
        get sendCalls() {
            return sendCalls.current;
        },
        get listCalls() {
            return listCalls.current;
        },
        get postUrns() {
            return postUrns.current;
        },
        routeForPostMessage(spaceUrn) {
            record(postUrns, spaceUrn);
            return buildRoute('POST', channelIdFrom(spaceUrn));
        },
        routeForListMessages(spaceUrn, params) {
            record(listCalls, { spaceUrn, params: params ?? {} });
            return buildRoute('GET', channelIdFrom(spaceUrn));
        },
        async send(...args) {
            const [provider, tenant, method, route, body, fetchFn] = args;
            record(sendCalls, {
                provider,
                tenant,
                method,
                route,
                body,
                fetch: fetchFn,
            });
            return {
                ok: true,
                status: 200,
                body: { id: 'message-1' },
                bucket: `${method}:${route}`,
                retry_after_ms: 1500,
            };
        },
    };
}
test('discord_send_message routes payloads via proxy', async (t) => {
    const modulePath = new URL('../tools/discord.js', import.meta.url).pathname;
    const proxy = createProxyStub();
    const mod = await esmock(modulePath, {
        '@promethean-os/discord': {
            DiscordRestProxy: class {
                constructor() {
                    return proxy;
                }
            },
        },
    });
    const ctx = {
        env: {},
        fetch: (async () => new Response()),
        now: () => new Date(),
    };
    const tool = mod.discordSendMessage(ctx);
    const result = await tool.invoke({
        tenant: 'promethean',
        spaceUrn: 'urn:discord:space:promethean:123',
        message: { content: 'hello' },
    });
    t.is(proxy.sendCalls.length, 1);
    t.deepEqual(proxy.postUrns, ['urn:discord:space:promethean:123']);
    const call = proxy.sendCalls[0];
    t.deepEqual(call, {
        provider: 'discord',
        tenant: 'promethean',
        method: 'POST',
        route: '/channels/123/messages',
        body: { content: 'hello' },
        fetch: ctx.fetch,
    });
    t.deepEqual(result, {
        ok: true,
        status: 200,
        body: { id: 'message-1' },
        bucket: 'POST:/channels/123/messages',
        retryAfterMs: 1500,
    });
});
test('discord_list_messages supports env fallbacks and params', async (t) => {
    const modulePath = new URL('../tools/discord.js', import.meta.url).pathname;
    const proxy = createProxyStub();
    const mod = await esmock(modulePath, {
        '@promethean-os/discord': {
            DiscordRestProxy: class {
                constructor() {
                    return proxy;
                }
            },
        },
    });
    const ctx = {
        env: {
            DISCORD_TENANT: 'duck-guild',
            DISCORD_SPACE_URN: 'urn:discord:space:duck:456',
            DISCORD_PROVIDER: 'discord-cloud',
        },
        fetch: (async () => new Response()),
        now: () => new Date(),
    };
    const tool = mod.discordListMessages(ctx);
    const result = await tool.invoke({ limit: 25, before: '789' });
    t.is(proxy.listCalls.length, 1);
    const listCall = proxy.listCalls[0];
    t.is(listCall.spaceUrn, 'urn:discord:space:duck:456');
    t.deepEqual(listCall.params, { limit: 25, before: '789' });
    t.is(proxy.sendCalls.length, 1);
    const sendCall = proxy.sendCalls[0];
    t.deepEqual(sendCall, {
        provider: 'discord-cloud',
        tenant: 'duck-guild',
        method: 'GET',
        route: '/channels/456/messages',
        body: undefined,
        fetch: ctx.fetch,
    });
    t.deepEqual(result, {
        ok: true,
        status: 200,
        body: { id: 'message-1' },
        bucket: 'GET:/channels/456/messages',
        retryAfterMs: 1500,
    });
});
//# sourceMappingURL=discord-tools.test.js.map