export type UUID = string;
export type Timestamp = string;

export interface Envelope<T = unknown> {
  id: UUID;
  ts: Timestamp;
  room: string;
  from: string; // sessionId
  kind: "event" | "stream";
  type: string; // e.g. "content.post", "voice.frame"
  seq?: number; // per stream
  rel?: { replyTo?: UUID; parents?: UUID[] };
  payload: T;
  sig?: string; // optional Ed25519
}
