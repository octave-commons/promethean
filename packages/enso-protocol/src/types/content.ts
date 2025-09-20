export type BlobURI =
  | `enso://asset/${string}`
  | `ipfs://${string}`
  | `https://${string}`
  | `file://${string}`;

export type TextPart = {
  kind: "text";
  text: string;
  mime?: "text/plain" | "text/markdown";
  lang?: string;
};
export type ImagePart = {
  kind: "image";
  uri: BlobURI;
  mime: "image/png" | "image/jpeg" | "image/webp";
  width?: number;
  height?: number;
  alt?: string;
};
export type AttachmentPart = {
  kind: "attachment";
  uri: BlobURI;
  mime: string;
  bytes: number;
  name?: string;
  derived?: Array<{
    purpose: "text" | "image" | "thumbnail";
    uri: BlobURI;
    mime: string;
    meta?: Record<string, unknown>;
  }>;
};
export type ContentPart = TextPart | ImagePart | AttachmentPart;

export interface ChatMessage {
  role: "human" | "agent" | "system";
  parts: ContentPart[];
  expiresAt?: string;
  burnOnRead?: boolean;
  forbidIndex?: boolean;
  watermark?: "none" | "local" | "cryptographic";
}
