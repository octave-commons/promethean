import type { CachePolicy } from "./cache.js";

export type RetentionPolicy = {
  readonly messages: { readonly defaultTTL: number; readonly maxTTL: number };
  readonly assets: {
    readonly defaultTTL: number;
    readonly maxTTL: number;
    readonly allowDerivations: boolean;
  };
  readonly logs: {
    readonly keepProtocolLogs: boolean;
    readonly logTTL: number;
  };
  readonly roster: { readonly keepPresenceHistory: boolean };
  readonly index: { readonly allowSearch: boolean; readonly indexTTL: number };
};

export type RoomPolicyPayload = {
  readonly retention: RetentionPolicy;
  readonly cache?: CachePolicy;
  readonly derivations?: Record<string, unknown>;
  readonly flags?: Record<string, unknown>;
};
