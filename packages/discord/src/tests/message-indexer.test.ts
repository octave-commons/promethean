import test from "ava";
import { indexMessage } from "@promethean-os/discord";

test("indexes with provider+tenant key", async (t) => {
  process.env.DISCORD_TOKEN_DUCK = "test";
  const out = await indexMessage({
    message_id: "m1",
    author_urn: "urn:discord:user:duck:au1",
    space_urn: "urn:discord:space:duck:ch1",
    text: "hello",
    attachments: [],
    created_at: new Date().toISOString(),
    provider: "discord",
    tenant: "duck",
  });
  t.is((out as any).doc.provider, "discord");
  t.is((out as any).doc.tenant, "duck");
  t.is((out as any).doc.foreign_id, "m1");
});
