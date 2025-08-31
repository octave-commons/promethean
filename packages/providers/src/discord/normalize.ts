// loosen typing to avoid cross-package type coupling

export function normalizeDiscordMessage(raw: any, tenant: string): any {
    return {
        message_id: raw.id,
        author_urn: `urn:discord:user:${tenant}:${raw.author.id}`,
        space_urn: `urn:discord:channel:${tenant}:${raw.channel_id}`,
        text: raw.content,
        attachments: raw.attachments?.map((a: any) => ({
            urn: `urn:discord:attachment:${tenant}:${a.id}`,
            url: a.url,
            content_type: a.content_type,
            size: a.size,
            sha256: a.hash,
        })),
        created_at: raw.timestamp,
        provider: 'discord',
        tenant,
        provider_payload: raw,
    };
}
