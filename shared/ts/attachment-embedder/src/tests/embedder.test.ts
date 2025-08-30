import test from "ava";
import { embedAttachments } from "../index.js";

test("embeds attachments into provider+tenant namespace", async (t) => {
  process.env.DISCORD_TOKEN_DUCK = "test";
  process.env.EMBEDDING_DIM = "8";
  const out = await embedAttachments({
    message_id: "m1",
    author_urn: "urn:discord:user:duck:u1",
    space_urn: "urn:discord:space:duck:c1",
    attachments: [
      {
        urn: "urn:discord:attachment:duck:a1",
        url: "https://cdn/1",
        content_type: "image/png",
      },
      {
        urn: "urn:discord:attachment:duck:a2",
        url: "https://cdn/2",
        content_type: "text/plain",
      },
    ],
    created_at: new Date().toISOString(),
    provider: "discord",
    tenant: "duck",
  } as any);
  t.truthy(out);
  if (Array.isArray(out)) {
    t.fail("Expected object with 'ns' and 'ids', but got an array");
  } else {
    t.regex(out.ns, /discord__duck/);
    t.is(out.ids.length, 2);
  }
});
