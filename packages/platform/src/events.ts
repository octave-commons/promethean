export type SocialMessageCreated = {
    message_id: string;
    author_urn: string;
    space_urn: string;
    text?: string;
    attachments?: Array<{ urn: string; url: string; content_type?: string; size?: number; sha256?: string }>;
    created_at: string;
    provider: string;
    tenant: string;
    provider_payload?: unknown;
};

export type PostMessage = {
    provider: string;
    tenant: string;
    space_urn: string;
    in_reply_to?: string;
    text: string;
    attachments?: Array<{ data_path?: string; url?: string }>;
};
