import { fileBackedRegistry, topic } from "@promethean-os/platform";
import { mongoForTenant } from "@promethean-os/effects/mongo.js";

export async function handleSocialMessageCreated(evt: any) {
  if (!evt.attachments?.length) return [];
  const reg = fileBackedRegistry();
  const tenantCfg = await reg.get(evt.provider, evt.tenant);
  mongoForTenant(evt.tenant, tenantCfg.storage.mongo_db);
  const now = new Date().toISOString();
  return evt.attachments.map((a: any) => ({
    provider: evt.provider,
    tenant: evt.tenant,
    foreign_id: evt.message_id,
    attachment_urn: a.urn,
    url: a.url,
    content_type: a.content_type,
    size: a.size,
    sha256: a.sha256,
    created_at: evt.created_at,
    indexed_at: now,
  }));
}

async function main() {
  const reg = fileBackedRegistry();
  const tenants = await reg.list("discord");
  for (const t of tenants) {
    const eventsTopic = topic({
      provider: t.provider,
      tenant: t.tenant,
      area: "events",
      name: "SocialMessageCreated",
    });

    console.log(`[discord-attachment-indexer] subscribing to ${eventsTopic}`);
  }
  setInterval(() => {}, 1 << 30);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
