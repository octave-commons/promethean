export type CacheVisibility = "session" | "room" | "global";

export type CacheKeyDescriptor = {
  readonly cid: string;
  readonly purpose: string;
};

export type CachePut = {
  readonly key: CacheKeyDescriptor;
  readonly uri?: string;
  readonly bytes: number;
  readonly mime: string;
  readonly visibility: CacheVisibility;
  readonly ttlSeconds?: number;
  readonly tags?: readonly string[];
  readonly meta?: Record<string, unknown>;
};

export type CacheHit = {
  readonly key: CacheKeyDescriptor;
  readonly uri: string;
  readonly bytes?: number;
  readonly mime?: string;
};

export type CacheMiss = {
  readonly key: CacheKeyDescriptor;
};

export type CacheEvict = {
  readonly key: CacheKeyDescriptor;
  readonly reason: string;
};

export type CachePartial = {
  readonly key: CacheKeyDescriptor;
  readonly range: { readonly start: number; readonly end?: number };
  readonly uri?: string;
};

export type CachePolicy = {
  readonly scope: CacheVisibility;
  readonly maxBytesPerRoom?: number;
  readonly maxBytesPerEntry?: number;
  readonly allowedMime?: readonly string[];
  readonly defaultTTLSeconds?: number;
  readonly pinTags?: readonly string[];
  readonly privateTags?: readonly string[];
};
