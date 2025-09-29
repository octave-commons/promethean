import test from "ava";

import { buildFastifyApp } from "../../fastifyApp.js";

test.serial("buildFastifyApp enforces configurable rate limits", async (t) => {
  const app = await buildFastifyApp(
    process.cwd(),
    {},
    {
      rateLimit: { max: 2, timeWindow: 1000 },
    },
  );
  t.teardown(async () => {
    await app.close();
  });
  app.get("/__rate-limit-test", async () => ({ ok: true }));
  await app.ready();

  const first = await app.inject({
    method: "GET",
    url: "/__rate-limit-test",
  });
  t.is(first.statusCode, 200);

  const second = await app.inject({
    method: "GET",
    url: "/__rate-limit-test",
  });
  t.is(second.statusCode, 200);

  const third = await app.inject({
    method: "GET",
    url: "/__rate-limit-test",
  });
  t.is(third.statusCode, 429);
});
