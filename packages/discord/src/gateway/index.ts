import { fileBackedRegistry, topic } from "@promethean-os/platform"; // , SocialMessageCreated, toUrn

// Stub Gateway: would connect to Discord WS, normalize MESSAGE_CREATE to SocialMessageCreated
async function main() {
  const reg = fileBackedRegistry();
  const tenants = await reg.list("discord");
  for (const t of tenants) {
    const rawTopic = topic({
      provider: t.provider,
      tenant: t.tenant,
      area: "gateway",
      name: "raw",
    });
    const normTopic = topic({
      provider: t.provider,
      tenant: t.tenant,
      area: "events",
      name: "SocialMessageCreated",
    });
    console.log(`[discord-gateway] would publish ${rawTopic} and ${normTopic}`);
  }

  // example normalizer helper
  // function normalizeMessageCreate(payload: any): SocialMessageCreated {
  //     return {
  //         message_id: String(payload.id),
  //         author_urn: toUrn(
  //             'discord',
  //             'user',
  //             payload.tenant ?? 'duck',
  //             String(payload.author?.id ?? ''),
  //         ),
  //         space_urn: toUrn(
  //             'discord',
  //             'space',
  //             payload.tenant ?? 'duck',
  //             String(payload.channel_id ?? ''),
  //         ),
  //         text: payload.content ?? undefined,
  //         attachments: [],
  //         created_at: new Date().toISOString(),
  //         provider: 'discord',
  //         tenant: payload.tenant ?? 'duck',
  //         provider_payload: payload,
  //     };
  // }

  setInterval(() => {}, 1 << 30);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
