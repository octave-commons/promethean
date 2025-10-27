import test from "ava";
import { DiscordRestProxy } from "@promethean-os/discord";

function makeFetch(
  status: number,
  json: unknown,
  spy?: { calls: Array<{ url: unknown; init: unknown }> },
): typeof fetch {
  return (async (url: RequestInfo | URL, init?: RequestInit) => {
    // eslint-disable-next-line functional/immutable-data
    spy?.calls.push({ url, init });
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => json,
    } as Response;
  }) as typeof fetch;
}

test("enforces per-route token bucket", async (t) => {
  process.env.DISCORD_TOKEN_DUCK = "x";
  const proxy = new DiscordRestProxy();
  const { method, route } = proxy.routeForPostMessage(
    "urn:discord:space:duck:123",
  );
  t.is(method, "POST");
  t.is(route, "/channels/123/messages");

  const spy: { calls: Array<{ url: unknown; init: unknown }> } = { calls: [] };
  const fetchFn = makeFetch(200, {}, spy);

  // consume default capacity (5)
  await Promise.all(
    Array.from({ length: 5 }).map(async () => {
      const r = await proxy.send(
        "discord",
        "duck",
        method,
        route,
        { content: "hi" },
        fetchFn,
      );
      t.true(r.ok);
    }),
  );

  // next call should be limited locally and not invoke fetch
  const r6 = await proxy.send(
    "discord",
    "duck",
    method,
    route,
    { content: "hi" },
    fetchFn,
  );
  t.false(r6.ok);
  t.is(r6.status, 429);
  t.true(typeof r6.retry_after_ms === "number" && r6.retry_after_ms >= 1000);
  t.is(spy.calls.length, 5);
  t.is(r6.bucket, "POST:/channels/:channel/messages");

  const first = spy.calls[0]!;
  t.true(String(first.url).includes("/channels/123/messages"));
  const init = first.init as RequestInit;
  const headers = init.headers as Record<string, string>;
  t.truthy(String(headers.Authorization).startsWith("Bot "));
  t.is(init.method, "POST");
});
