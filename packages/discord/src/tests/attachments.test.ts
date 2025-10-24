import test from "ava";
import { indexAttachments } from "@promethean-os/discord";

test("indexes attachments for provider+tenant", async (t) => {
  process.env.DISCORD_TOKEN_DUCK = "test";
  const out = await indexAttachments({
    message_id: "m1",
    author_urn: "urn:discord:user:duck:au1",
    space_urn: "urn:discord:space:duck:ch1",
    attachments: [
      { urn: "urn:discord:attachment:duck:a1", url: "https://cdn/1" },
      { urn: "urn:discord:attachment:duck:a2", url: "https://cdn/2" },
    ],
    created_at: new Date().toISOString(),
    provider: "discord",
    tenant: "duck",
  });
  t.is(out.length, 2);
  t.true(
    out.every(
      (a: { provider: string; tenant: string }) =>
        a.provider === "discord" && a.tenant === "duck",
    ),
  );
});
