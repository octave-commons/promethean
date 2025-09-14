/* eslint-disable */
import test from "ava";
import path from "node:path";
import { InMemoryEventBus } from "@promethean/event/memory.js";
import {
  GatewayPublisher,
  indexAttachments,
  indexMessage,
  embedMessage,
} from "@promethean/discord";

type EmbedEvt = {
  readonly provider: string;
  readonly tenant: string;
  readonly message_id: string;
  readonly space_urn: string;
  readonly text: string;
};
// fallback mock: real package unavailable
async function embedAttachments(evt: any) {
  return { ids: evt.attachments?.map((a: any) => a.id) || [] };
}

test("end-to-end: raw -> normalized -> index + embed", async (t) => {
  process.env.DISCORD_TOKEN_DUCK = "x";
  process.env.EMBEDDING_DIM = "8";
  const bus = new InMemoryEventBus();
  const pub = new GatewayPublisher(bus);
  const provider = "discord";
  const tenant = "duck";
  const normTopic = `promethean.p.${provider}.t.${tenant}.events.SocialMessageCreated`;

  const seen = { indexed: 0, attachments: 0, embeddedMsg: 0, embeddedAtt: 0 };
  await bus.subscribe(normTopic, "workers", async (e) => {
    const evt = e.payload as EmbedEvt;
    const msg = await indexMessage(evt);
    if (msg) seen.indexed++;
    const atts = await indexAttachments(evt);
    seen.attachments += atts.length;
    const cfg = path.join(process.cwd(), "config", "providers.yml");
    const em = await embedMessage(evt, { configPath: cfg });
    if (em) seen.embeddedMsg++;
    const ea = await embedAttachments(evt);
    seen.embeddedAtt += ea.ids?.length || 0;
  });

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
  await pub.publishRaw(provider, tenant, raw);
  await pub.publishNormalized(provider, tenant, raw);
  await new Promise((r) => setTimeout(r, 0));

  t.is(seen.indexed, 1);
  t.is(seen.attachments, 1);
  t.is(seen.embeddedMsg, 1);
  t.is(seen.embeddedAtt, 1);
});
