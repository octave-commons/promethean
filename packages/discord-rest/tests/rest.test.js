import test from "ava";
import { DiscordRestProxy, BucketLimiter } from "../src/rest.js";

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

test("maps PostMessage route and applies bucket limiter on 429", async (t) => {
  process.env.DISCORD_TOKEN_DUCK = "x";
  const proxy = new DiscordRestProxy(new BucketLimiter());
  const { method, route } = proxy.routeForPostMessage(
    "urn:discord:space:duck:123",
  );
  t.is(method, "POST");
  t.is(route, "/channels/123/messages");

  // First call returns 429, sets limiter
  const spy = { calls: [] };
  const r1 = await proxy.send(
    "discord",
    "duck",
    method,
    route,
    { content: "hi" },
    makeFetch(429, { retry_after: 0.5 }, spy),
  );
  t.false(r1.ok);
  t.is(r1.status, 429);
  t.true((r1.retry_after_ms || 0) >= 500);

  // Next call should be limited by bucket
  const r2 = await proxy.send(
    "discord",
    "duck",
    method,
    route,
    { content: "hi" },
    makeFetch(200, {}, spy),
  );
  t.is(r2.status, 429);
  t.true(spy.calls[0].url.includes("/channels/123/messages"));
  t.is(spy.calls[0].init.method, "POST");
  t.truthy(spy.calls[0].init.headers["Authorization"].startsWith("Bot "));
});
