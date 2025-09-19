import type { HelloCaps, PrivacyProfile } from "./types/privacy.js";
import type { Envelope } from "./types/envelope.js";
import { EnsoClient } from "./client.js";
import { EnsoServer } from "./server.js";
import type { ServerSession } from "./server.js";

/**
 * Options for establishing a local in-memory transport between the client and
 * server reference implementations.
 */
export interface LocalTransportOptions {
  adjustCapabilities?: (requested: string[]) => string[];
  privacyProfile?: PrivacyProfile;
  wantsE2E?: boolean;
  evaluationMode?: boolean;
}

/**
 * Handle returned by {@link connectLocal}. Allows tests to inspect the
 * negotiated handshake envelopes and tear down the implicit listener when
 * finished.
 */
export interface LocalConnection {
  session: ServerSession;
  accepted: Envelope<{ profile: PrivacyProfile; wantsE2E: boolean; negotiatedCaps: string[] }>;
  presence: Envelope<{ session: string; caps: string[] }>;
  disconnect(): void;
}

/**
 * Wire up {@link EnsoClient} and {@link EnsoServer} using an in-memory
 * transport. This mirrors a WebSocket-like connection for unit and integration
 * tests without requiring network sockets.
 */
export function connectLocal(
  client: EnsoClient,
  server: EnsoServer,
  hello: HelloCaps,
  options: LocalTransportOptions = {},
): LocalConnection {
  let sessionHandle: ServerSession | undefined;
  const forward = (serverSession: ServerSession, envelope: Envelope): void => {
    if (sessionHandle && serverSession.id === sessionHandle.id) {
      client.receive(envelope);
    }
  };

  const handshakeOptions: {
    adjustCapabilities?: (requested: string[]) => string[];
    privacyProfile?: PrivacyProfile;
    wantsE2E?: boolean;
    evaluationMode?: boolean;
  } = {};
  if (options.adjustCapabilities) {
    handshakeOptions.adjustCapabilities = options.adjustCapabilities;
  }
  if (options.privacyProfile) {
    handshakeOptions.privacyProfile = options.privacyProfile;
  }
  if (options.wantsE2E !== undefined) {
    handshakeOptions.wantsE2E = options.wantsE2E;
  }
  if (options.evaluationMode !== undefined) {
    handshakeOptions.evaluationMode = options.evaluationMode;
  }

  const { session, accepted, presence } = server.acceptHandshake(hello, handshakeOptions);

  sessionHandle = session;
  server.on("message", forward);

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

  return {
    session,
    accepted,
    presence,
    disconnect: () => {
      server.off("message", forward);
      sessionHandle = undefined;
    },
  };
}
