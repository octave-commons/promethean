import type { HelloCaps, PrivacyProfile } from "./types/privacy.js";
import type { Envelope } from "./types/envelope.js";
import { EnsoClient } from "./client.js";
import { EnsoServer } from "./server.js";
import type { ServerSession } from "./server.js";

export interface LocalTransportOptions {
  adjustCapabilities?: (requested: string[]) => string[];
  privacyProfile?: PrivacyProfile;
  wantsE2E?: boolean;
}

export interface LocalConnection {
  session: ServerSession;
  accepted: Envelope<{ profile: PrivacyProfile; wantsE2E: boolean; negotiatedCaps: string[] }>;
  presence: Envelope<{ session: string; caps: string[] }>;
}

export function connectLocal(
  client: EnsoClient,
  server: EnsoServer,
  hello: HelloCaps,
  options: LocalTransportOptions = {},
): LocalConnection {
  const { session, accepted, presence } = server.acceptHandshake(hello, options);

  client.attachTransport({
    send: async (env) => {
      await server.dispatch(session, env);
    },
  });

  client.connect(hello, {
    capabilities: accepted.payload.negotiatedCaps,
    privacyProfile: accepted.payload.profile,
    emitAccepted: false,
  });

  client.receive(accepted);
  client.receive(presence);

  return { session, accepted, presence };
}
