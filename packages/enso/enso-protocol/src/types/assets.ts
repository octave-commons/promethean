export type AssetPolicyHint = {
  readonly public?: boolean;
  readonly ttlSeconds?: number;
};

export type AssetPut = {
  readonly name?: string;
  readonly mime: string;
  readonly bytes?: number;
  readonly cid?: string;
  readonly room?: string;
  readonly policy?: AssetPolicyHint;
};

export type AssetCommitPayload = {
  readonly cid?: string;
};

export type AssetReadyPayload = {
  readonly cid: string;
  readonly uri: string;
  readonly mime: string;
  readonly bytes: number;
};

export type DerivationPlan = {
  readonly purpose: string;
  readonly via: readonly string[];
  readonly options?: Record<string, unknown>;
};

export type AssetDerivePayload = {
  readonly cid: string;
  readonly plans: readonly DerivationPlan[];
};

export type DerivedAsset = {
  readonly purpose: string;
  readonly uri: string;
  readonly mime: string;
  readonly bytes?: number;
  readonly meta?: Record<string, unknown>;
};

export type AssetDerivedPayload = {
  readonly from: string;
  readonly derived: DerivedAsset;
};

export type AssetDeletePayload = {
  readonly cid: string;
  readonly reason?: string;
  readonly hard?: boolean;
};
