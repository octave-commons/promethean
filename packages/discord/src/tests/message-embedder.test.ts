import path from "node:path";

import test from "ava";
import { embedMessage } from "@promethean-os/discord";

type EmbedEvt = {
  readonly provider: string;
  readonly tenant: string;
  readonly message_id: string;
  readonly space_urn: string;
  readonly text: string;
};

test("embeds text into provider+tenant namespace", async (t) => {
  process.env.DISCORD_TOKEN_DUCK = "test";
  process.env.EMBEDDING_DIM = "16";
  const cfg = path.join(process.cwd(), "config", "providers.yml");
  const out = await embedMessage(
    {
      message_id: "m1",
      author_urn: "urn:discord:user:duck:u1",
      space_urn: "urn:discord:space:duck:c1",
      text: "hello",
      created_at: new Date().toISOString(),
      provider: "discord",
      tenant: "duck",
    } as EmbedEvt,
    { configPath: cfg },
  );
  t.truthy(out);
  t.regex(out!.ns, /discord__duck/);
});
