import { topic, fileBackedRegistry } from "@promethean-os/platform";
import { mongoForTenant } from "@promethean-os/effects/mongo.js";

export async function handleSocialMessageCreated(evt: any) {
  const reg = fileBackedRegistry();
  const tenantCfg = await reg.get(evt.provider, evt.tenant);
  const db = mongoForTenant(evt.tenant, tenantCfg.storage.mongo_db);
  // Example upsert model. Real impl should use Mongo driver and unique index on (provider,tenant,foreign_id)
  const doc = {
    provider: evt.provider,
    tenant: evt.tenant,
    foreign_id: evt.message_id,
    author_urn: evt.author_urn,
    space_urn: evt.space_urn,
    text: evt.text,
    attachments: evt.attachments,
    created_at: evt.created_at,
    indexed_at: new Date().toISOString(),
  };

  console.log(
    `[discord-message-indexer] upsert into ${tenantCfg.storage.mongo_db}.messages`,
    {
      key: {
        provider: doc.provider,
        tenant: doc.tenant,
        foreign_id: doc.foreign_id,
      },
    },
  );
  return { db, doc };
}

async function main() {
  // In production, subscribe to the normalized event topic
  const reg = fileBackedRegistry();
  const tenants = await reg.list("discord");
  for (const t of tenants) {
    const eventsTopic = topic({
      provider: t.provider,
      tenant: t.tenant,
      area: "events",
      name: "SocialMessageCreated",
    });

    console.log(`[discord-message-indexer] subscribing to ${eventsTopic}`);
  }
  setInterval(() => {}, 1 << 30);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
