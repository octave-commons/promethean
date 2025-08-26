// @shared/ts/dist/urn.ts
export const toUrn = (provider: string, kind: string, tenant: string, id: string) =>
    `urn:${provider}:${kind}:${tenant}:${id}`;
// @shared/ts/dist/topic.ts
export const topic = (p: { provider: string; tenant: string; area: string; name: string }) =>
    `promethean.p.${p.provider}.t.${p.tenant}.${p.area}.${p.name}`;
// @shared/ts/dist/events.ts
export type SocialMessageCreated = {
    message_id: string;
    author_urn: string;
    space_urn: string;
    text?: string;
    attachments?: Array<{ urn: string; url: string; content_type?: string; size?: number; sha256?: string }>;
    created_at: string;
    provider: string;
    tenant: string;
    provider_payload?: any;
};

export type PostMessage = {
    provider: string;
    tenant: string;
    space_urn: string;
    in_reply_to?: string;
    text: string;
    attachments?: Array<{ data_path?: string; url?: string }>;
};
