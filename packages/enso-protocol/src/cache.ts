export type CID = `cid:sha256-${string}`;
export interface CacheKey {
  cid: CID;
  purpose?: "raw" | "text" | "image" | "thumbnail" | "index" | "manifest";
  metaHash?: CID;
}
export interface CacheEntry {
  key: CacheKey;
  uri: string;
  bytes: number;
  mime: string;
  visibility: "session" | "room" | "global";
  ttl: number;
  tags?: string[];
  meta?: Record<string, unknown>;
}

export class CacheRegistry {
  private map = new Map<string, CacheEntry>(); // key → entry
  private key(k: CacheKey) {
    return JSON.stringify(k);
  }
  put(e: CacheEntry) {
    this.map.set(this.key(e.key), e);
  }
  get(k: CacheKey) {
    return this.map.get(this.key(k));
  }
  evict(k: CacheKey) {
    this.map.delete(this.key(k));
  }
}
