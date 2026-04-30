import type { Persistence, SerializableClient, SerializableCode, SerializableToken } from "../persistence/types.js";

export type OAuthProviderOptions = {
  baseUrl: URL;
  autoApprove: boolean;
  predefinedClients: SerializableClient[];
  accessTokenTtlSeconds: number;
  refreshTokenTtlSeconds: number;
  persistence: Persistence;
};

export interface OAuthProvider {
  clientsStore: {
    getClient(clientId: string): Promise<SerializableClient | undefined>;
    ensurePublicClient(clientId: string, redirectUri: string): Promise<SerializableClient>;
  };
  authorize(
    client: SerializableClient,
    options: {
      state?: string;
      scopes: string[];
      redirectUri: string;
      codeChallenge: string;
      resource?: URL;
    },
    res: {
      redirect: (status: number, url: string) => void;
      setHeader: (name: string, value: string) => void;
    },
  ): Promise<void>;
  stop(): Promise<void>;
}

export class SimpleOAuthProvider implements OAuthProvider {
  readonly clientsStore: {
    getClient(clientId: string): Promise<SerializableClient | undefined>;
    ensurePublicClient(clientId: string, redirectUri: string): Promise<SerializableClient>;
  };

  private readonly baseUrl: URL;
  private readonly autoApprove: boolean;
  private readonly predefinedClients: Map<string, SerializableClient>;
  private readonly accessTokenTtlSeconds: number;
  private readonly refreshTokenTtlSeconds: number;
  private readonly persistence: Persistence;

  constructor(options: OAuthProviderOptions) {
    this.baseUrl = options.baseUrl;
    this.autoApprove = options.autoApprove;
    this.predefinedClients = new Map(options.predefinedClients.map((c) => [c.client_id, c]));
    this.accessTokenTtlSeconds = options.accessTokenTtlSeconds;
    this.refreshTokenTtlSeconds = options.refreshTokenTtlSeconds;
    this.persistence = options.persistence;

    this.clientsStore = {
      getClient: async (clientId: string) => {
        const predefined = this.predefinedClients.get(clientId);
        if (predefined) return predefined;
        return this.persistence.getClient(clientId);
      },
      ensurePublicClient: async (clientId: string, redirectUri: string) => {
        const existing = await this.clientsStore.getClient(clientId);
        if (existing) {
          if (!existing.redirect_uris.includes(redirectUri)) {
            existing.redirect_uris.push(redirectUri);
            await this.persistence.setClient(clientId, existing);
          }
          return existing;
        }

        const newClient: SerializableClient = {
          client_id: clientId,
          redirect_uris: [redirectUri],
          token_endpoint_auth_method: "none",
          grant_types: ["authorization_code", "refresh_token"],
          response_types: ["code"],
        };
        await this.persistence.setClient(clientId, newClient);
        return newClient;
      },
    };
  }

  async authorize(
    client: SerializableClient,
    options: {
      state?: string;
      scopes: string[];
      redirectUri: string;
      codeChallenge: string;
      resource?: URL;
    },
    res: {
      redirect: (status: number, url: string) => void;
      setHeader: (name: string, value: string) => void;
    },
  ): Promise<void> {
    const code = crypto.randomUUID();
    const codeValue: SerializableCode = {
      code,
      clientId: client.client_id,
      redirectUri: options.redirectUri,
      codeChallenge: options.codeChallenge,
      scope: options.scopes.join(" "),
      resource: options.resource?.toString(),
      expiresAt: Math.floor(Date.now() / 1000) + 300,
    };

    await this.persistence.setCode(code, codeValue);

    const redirectUrl = new URL(options.redirectUri);
    redirectUrl.searchParams.set("code", code);
    if (options.state) {
      redirectUrl.searchParams.set("state", options.state);
    }

    res.redirect(302, redirectUrl.toString());
  }

  async stop(): Promise<void> {
    await this.persistence.stop();
  }
}