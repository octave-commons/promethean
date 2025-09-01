export type ClientCredsConfig = {
  authUrl: string; // e.g. http://localhost:8088
  clientId: string;
  clientSecret: string;
  scope?: string; // space-delimited
  audience?: string | undefined;
};

type TokenState = {
  access_token: string;
  expires_at: number; // epoch seconds
};

async function fetchToken(
  cfg: ClientCredsConfig,
): Promise<{ access_token: string; expires_in?: number } | null> {
  try {
    const res = await fetch(`${cfg.authUrl.replace(/\/$/, "")}/oauth/token`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        grant_type: "client_credentials",
        client_id: cfg.clientId,
        client_secret: cfg.clientSecret,
        scope: cfg.scope,
        aud: cfg.audience,
      }),
    });
    if (!res.ok) return null;
    const body = (await res.json()) as any;
    if (!body?.access_token) return null;
    return {
      access_token: String(body.access_token),
      expires_in: body.expires_in,
    };
  } catch {
    return null;
  }
}

export function createTokenProviderFromEnv():
  | (() => Promise<string | undefined>)
  | undefined {
  const url = process.env.AUTH_SERVICE_URL;
  const id = process.env.AUTH_CLIENT_ID;
  const secret = process.env.AUTH_CLIENT_SECRET;
  const scope = process.env.AUTH_SCOPE || "index:write";
  const audience = process.env.AUTH_AUDIENCE;
  if (!url || !id || !secret) return undefined;
  const cfg: ClientCredsConfig = {
    authUrl: url,
    clientId: id,
    clientSecret: secret,
    scope,
    audience,
  };
  let cached: TokenState | null = null;
  return async () => {
    const now = Math.floor(Date.now() / 1000);
    if (cached && now < cached.expires_at - 60) return cached.access_token; // refresh 60s early
    const tok = await fetchToken(cfg);
    if (!tok) return undefined;
    const ttl =
      typeof tok.expires_in === "number" && tok.expires_in > 0
        ? tok.expires_in
        : 3600;
    cached = { access_token: tok.access_token, expires_at: now + ttl };
    return cached.access_token;
  };
}
