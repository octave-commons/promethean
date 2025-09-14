import path from "node:path";

import test from "ava";
import { z } from "zod";

import { fileBackedRegistry } from "../fileBackedRegistry.js";

test("loads providers.yml using generic registry", async (t) => {
  const schema = z.object({
    providers: z.array(
      z.object({
        provider: z.string(),
        tenant: z.string(),
        credentials: z.record(z.string()),
      }),
    ),
  });
  const reg = fileBackedRegistry<{
    provider: string;
    tenant: string;
    credentials: Record<string, string>;
  }>({
    configPath: path.resolve(process.cwd(), "../../config/providers.yml"),
    schema,
  });
  const one = await reg.get("discord", "duck");
  t.is(one.provider, "discord");
  t.is(one.tenant, "duck");
  const all = await reg.list("discord");
  t.true(all.length >= 1);
});
