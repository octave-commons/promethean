import { jwtVerify, createRemoteJWKSet, JWTPayload } from "jose";

export interface JwtConfig {
  jwksUrl?: string; // for rotating keys
  secret?: string; // HS256 fallback
  audience?: string;
  issuer?: string;
  clockToleranceSec?: number;
}

export interface AuthClaims extends JWTPayload {
  sub?: string;
  scopes?: string[]; // e.g., ["publish:heartbeat.*","subscribe:process.**"]
  policy?: { rules: any[] }; // optional embedded policy JSON
}

export async function verifyJWT(
  token: string,
  cfg: JwtConfig,
): Promise<AuthClaims> {
  const opts: any = {
    audience: cfg.audience,
    issuer: cfg.issuer,
    clockTolerance: (cfg.clockToleranceSec ?? 5) + "s",
  };
  if (cfg.jwksUrl) {
    const jwks = createRemoteJWKSet(new URL(cfg.jwksUrl));
    const { payload } = await jwtVerify(token, jwks, opts);
    return payload as AuthClaims;
  } else if (cfg.secret) {
    // jose wants a Uint8Array
    const key = new TextEncoder().encode(cfg.secret);
    const { payload } = await jwtVerify(token, key, opts);
    return payload as AuthClaims;
  } else {
    throw new Error("No JWT verifier configured");
  }
}
