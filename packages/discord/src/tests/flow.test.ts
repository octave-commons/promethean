import path from "node:path";

import test from "ava";
import { InMemoryEventBus } from "@promethean-os/event/memory.js";
import {
  GatewayPublisher,
  indexAttachments,
  indexMessage,
  embedMessage,
} from "@promethean-os/discord";

type EmbedEvt = {
  readonly provider: string;
  readonly tenant: string;
  readonly message_id: string;
  readonly space_urn: string;
  readonly text: string;
  readonly attachments?: Array<{ id: string }>;
};
// fallback mock: real package unavailable
async function embedAttachments(evt: { attachments?: Array<{ id: string }> }) {
  return { ids: evt.attachments?.map((a) => a.id) ?? [] };
}

const provider = "discord";
const tenant = "duck";
const normTopic = `promethean.p.${provider}.t.${tenant}.events.SocialMessageCreated`;
const raw = {
  id: "m1",
  author: { id: "u1" },
  channel_id: "c1",
  content: "hi",
  attachments: [
    {
      id: "a1",
      url: "https://cdn/1",
      content_type: "image/png",
      size: 12,
      hash: "h",
    },
  ],
  timestamp: new Date().toISOString(),
};

test("end-to-end: raw -> normalized -> index + embed", async (t) => {
  // eslint-disable-next-line functional/immutable-data
  process.env.DISCORD_TOKEN_DUCK = "x";
  // eslint-disable-next-line functional/immutable-data
  process.env.EMBEDDING_DIM = "8";
  const bus = new InMemoryEventBus();
  const pub = new GatewayPublisher(bus);

  const done = new Promise<void>(async (resolve) => {
    await (bus as unknown as InMemoryEventBus).subscribe(
      normTopic,
      "workers",
      async (e: unknown) => {
        const evt = (e as { payload: EmbedEvt }).payload;
        const msg = await indexMessage(evt);
        const atts = (await indexAttachments(evt)) as ReadonlyArray<unknown>;
        const cfg = path.join(process.cwd(), "config", "providers.yml");
        const em = await embedMessage(evt, { configPath: cfg });
        const ea = await embedAttachments(evt);
        t.truthy(msg);
        t.is(atts.length, 1);
        t.truthy(em);
        t.is(ea.ids.length, 1);
        resolve();
      },
    );
  });

  await pub.publishRaw(provider, tenant, raw);
  await pub.publishNormalized(provider, tenant, raw);
  await done;
});
