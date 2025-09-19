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
  accepted: Envelope<{
    profile: PrivacyProfile;
    wantsE2E: boolean;
    negotiatedCaps: string[];
  }>;
  presence: Envelope<{ session: string; caps: string[] }>;
  disconnect(): void;
}

/**
 * Wire up {@link EnsoClient} and {@link EnsoServer} using an in-memory
 * transport. This mirrors a WebSocket-like connection for unit and integration
 * tests without requiring network sockets.
 */
export async function connectLocal(
  client: EnsoClient,
  server: EnsoServer,
  hello: HelloCaps,
  options: LocalTransportOptions = {},
): Promise<LocalConnection> {
  const handshakeHello: HelloCaps = {
    ...hello,
    caps: [...hello.caps],
    privacy: { ...hello.privacy },
    ...(hello.agent ? { agent: { ...hello.agent } } : {}),
    ...(hello.cache ? { cache: { ...hello.cache } } : {}),
  };
  let sessionHandle: ServerSession | undefined;
  let acceptedEnvelope:
    | Envelope<{
        profile: PrivacyProfile;
        wantsE2E: boolean;
        negotiatedCaps: string[];
        agent?: HelloCaps["agent"];
        cache?: HelloCaps["cache"];
      }>
    | undefined;
  let presenceEnvelope:
    | Envelope<{ session: string; caps: string[] }>
    | undefined;

  const forward = (serverSession: ServerSession, envelope: Envelope): void => {
    if (sessionHandle && serverSession.id === sessionHandle.id) {
      client.receive(envelope);
    }
  };

  const handshakeOptions = {
    adjustCapabilities: options.adjustCapabilities,
    privacyProfile: options.privacyProfile,
    wantsE2E: options.wantsE2E,
    evaluationMode: options.evaluationMode,
  };
  const shouldOverride = Object.values(handshakeOptions).some(
    (value) => value !== undefined,
  );

  if (shouldOverride) {
    server.prepareHandshake((incoming) => ({
      ...(handshakeOptions.adjustCapabilities
        ? { adjustCapabilities: handshakeOptions.adjustCapabilities }
        : {}),
      privacyProfile:
        handshakeOptions.privacyProfile ?? incoming.privacy.profile,
      ...(handshakeOptions.wantsE2E !== undefined
        ? { wantsE2E: handshakeOptions.wantsE2E }
        : {}),
      ...(handshakeOptions.evaluationMode !== undefined
        ? { evaluationMode: handshakeOptions.evaluationMode }
        : {}),
    }));
  }

  const handshakeResult = new Promise<void>((resolve) => {
    const handler = (payload: unknown) => {
      const {
        session,
        accepted,
        presence,
        hello: emittedHello,
      } = payload as {
        session: ServerSession;
        accepted: Envelope<{
          profile: PrivacyProfile;
          wantsE2E: boolean;
          negotiatedCaps: string[];
          agent?: HelloCaps["agent"];
          cache?: HelloCaps["cache"];
        }>;
        presence: Envelope<{ session: string; caps: string[] }>;
        hello: HelloCaps;
      };
      if (emittedHello !== handshakeHello) {
        return;
      }
      sessionHandle = session;
      acceptedEnvelope = accepted;
      presenceEnvelope = presence;
      server.off("handshake", handler);
      resolve();
    };
    server.on("handshake", handler);
  });

  server.on("message", forward);

  client.attachTransport({
    send: async (env) => {
      await server.dispatch(sessionHandle, env);
    },
  });

  await client.connect(handshakeHello);
  await handshakeResult;

  if (!sessionHandle || !acceptedEnvelope || !presenceEnvelope) {
    throw new Error("Handshake did not complete");
  }

  return {
    session: sessionHandle,
    accepted: acceptedEnvelope,
    presence: presenceEnvelope,
    disconnect: () => {
      if (sessionHandle) {
        server.disconnectSession(sessionHandle.id);
      }
      server.off("message", forward);
      sessionHandle = undefined;
    },
  };
}
