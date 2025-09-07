import test from "ava";
import { DiscordRestProxy } from "@promethean/discord";

function makeFetch(status, json, spy) {
  return async (url, init) => {
    if (spy) spy.calls.push({ url, init });
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => json,
    };
  };
}

test("enforces per-route token bucket", async (t) => {
  process.env.DISCORD_TOKEN_DUCK = "x";
  const proxy = new DiscordRestProxy();
  const { method, route } = proxy.routeForPostMessage(
    "urn:discord:space:duck:123",
  );
  t.is(method, "POST");
  t.is(route, "/channels/123/messages");

  const spy = { calls: [] };
  const fetchFn = makeFetch(200, {}, spy);

  // consume default capacity (5)
  for (let i = 0; i < 5; i++) {
    const r = await proxy.send(
      "discord",
      "duck",
      method,
      route,
      { content: "hi" },
      fetchFn,
    );
    t.true(r.ok);
  }

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

  // record first call details
  t.true(spy.calls[0].url.includes("/channels/123/messages"));
  t.truthy(spy.calls[0].init.headers.Authorization.startsWith("Bot "));
  t.is(spy.calls[0].init.method, "POST");
});
