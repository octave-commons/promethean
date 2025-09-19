export type PrivacyProfile =
  | "persistent"
  | "pseudonymous"
  | "ephemeral"
  | "ghost";

export interface HelloCaps {
  proto: "ENSO-1";
  caps: string[];
  privacy: {
    profile: PrivacyProfile;
    wantsE2E?: boolean;
    allowLogging?: boolean;
    allowTelemetry?: boolean;
  };
  cache?: {
    store: "memory" | "disk" | "s3" | "ipfs";
    scope?: "session" | "room" | "global";
    supportsPartial?: boolean;
    maxBytes?: number;
  };
}
