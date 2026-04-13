export type SerializableToken = {
  token: string;
  clientId: string;
  scopes: string[];
  resource?: string;
  subject: string;
  extra?: Record<string, unknown>;
  expiresAt: number;
};

export type SerializableCode = {
  code: string;
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  scopes: string[];
  resource?: string;
  subject: string;
  extra?: Record<string, unknown>;
  expiresAt: number;
};

export type SerializableClient = {
  clientId: string;
  clientSecret: string;
  clientName: string;
  redirectUris: string[];
  tokenEndpointAuthMethod: string;
  grantTypes: string[];
  responseTypes: string[];
  clientIdIssuedAt?: number;
  clientSecretExpiresAt?: number;
};

export type SerializableTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
};

export type SerializableRefreshTokenReuse = {
  oldRefreshToken: string;
  clientId: string;
  resource?: string;
  scopeKey: string;
  tokens: SerializableTokenResponse;
  expiresAt: number;
};

export interface Persistence {
  init(): Promise<void>;
  stop(): Promise<void>;
  getCode(code: string): Promise<SerializableCode | undefined>;
  setCode(code: string, value: SerializableCode): Promise<void>;
  deleteCode(code: string): Promise<void>;
  getAccessToken(token: string): Promise<SerializableToken | undefined>;
  setAccessToken(token: string, value: SerializableToken): Promise<void>;
  deleteAccessToken(token: string): Promise<void>;
  getRefreshToken(token: string): Promise<SerializableToken | undefined>;
  setRefreshToken(token: string, value: SerializableToken): Promise<void>;
  deleteRefreshToken(token: string): Promise<void>;
  consumeRefreshToken(token: string): Promise<SerializableToken | undefined>;
  getRefreshTokenReuse(oldRefreshToken: string): Promise<SerializableRefreshTokenReuse | undefined>;
  setRefreshTokenReuse(oldRefreshToken: string, value: SerializableRefreshTokenReuse): Promise<void>;
  getClient(clientId: string): Promise<SerializableClient | undefined>;
  setClient(clientId: string, value: SerializableClient): Promise<void>;
  cleanup(): Promise<number>;
}
