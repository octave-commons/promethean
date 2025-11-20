export type PrivacyProfile =
  | "persistent"
  | "pseudonymous"
  | "ephemeral"
  | "ghost";

export interface HelloCaps {
  proto: "ENSO-1";
  caps: string[];
  agent?: {
    name: string;
    version: string;
  };
  privacy?: {
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

export type HelloPrivacy = NonNullable<HelloCaps["privacy"]>;

export const DEFAULT_PRIVACY_PROFILE: PrivacyProfile = "pseudonymous";

export function resolveHelloPrivacy(
  hello: HelloCaps,
  fallbackProfile: PrivacyProfile = DEFAULT_PRIVACY_PROFILE,
): HelloPrivacy {
  const provided = hello.privacy;
  if (!provided) {
    return { profile: fallbackProfile };
  }
  return { ...provided, profile: provided.profile ?? fallbackProfile };
}
