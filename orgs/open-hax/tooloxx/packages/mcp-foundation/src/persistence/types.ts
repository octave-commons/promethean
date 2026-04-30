export type SerializableCode = {
  code: string;
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  scope: string;
  resource?: string;
  expiresAt: number;
};

export type SerializableToken = {
  accessToken: string;
  refreshToken?: string;
  clientId: string;
  scope: string;
  resource?: string;
  identity?: {
    type: "github";
    login: string;
    id: number;
  };
  expiresAt: number;
};

export type SerializableRefreshTokenReuse = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

export type SerializableClient = {
  client_id: string;
  client_secret?: string;
  client_name?: string;
  redirect_uris: string[];
  token_endpoint_auth_method?: string;
  grant_types?: string[];
  response_types?: string[];
  scope?: string;
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