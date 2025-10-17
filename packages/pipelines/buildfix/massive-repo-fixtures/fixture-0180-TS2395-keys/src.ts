import {
  exportJWK,
  generateKeyPair,
  importJWK,
  importPKCS8,
  importSPKI,
  JWK,
  KeyLike,
  SignJWT,
  jwtVerify,
} from "jose";

export type SupportedAlg =
  | "EdDSA"
  | "RS256"
  | "RS512"
  | "ES256"
  | "ES384"
  | "ES512"
  | "HS256";

type KeyState = {
  alg: SupportedAlg;
  kid: string;
  privateKey: KeyLike;
  publicKey: KeyLike;
  publicJwk: JWK;
};

let statePromise: Promise<KeyState> | null = null;

function env(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim().length > 0 ? v : undefined;
}

function pickAlg(): SupportedAlg {
  const alg = (env("AUTH_ALG") as SupportedAlg) || "EdDSA";
  return alg;
}

function randomKid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export async function initKeys(): Promise<KeyState> {
  if (statePromise) return statePromise;
  statePromise = (async () => {
    const alg = pickAlg();

    const envPriv = env("AUTH_PRIVATE_KEY_PEM");
    const envPub = env("AUTH_PUBLIC_KEY_PEM");
    const envJwkPriv = env("AUTH_PRIVATE_JWK");
    const envJwkPub = env("AUTH_PUBLIC_JWK");
    let privateKey: KeyLike;
    let publicKey: KeyLike;
    let publicJwk: JWK;

    if (envJwkPriv) {
      const jwk = JSON.parse(envJwkPriv) as JWK;
      privateKey = (await importJWK(jwk, jwk.alg as string)) as KeyLike;
      if (envJwkPub) {
        publicKey = (await importJWK(
          JSON.parse(envJwkPub) as JWK,
          jwk.alg as string,
        )) as KeyLike;
      } else {
        publicJwk = { ...(jwk as any) };
        delete (publicJwk as any).d;
        publicKey = (await importJWK(publicJwk, jwk.alg as string)) as KeyLike;
      }
      publicJwk ||= await exportJWK(publicKey);
    } else if (envPriv && envPub) {
      if (alg === "EdDSA") {
        privateKey = await importPKCS8(envPriv, alg);
        publicKey = await importSPKI(envPub, alg);
      } else if (alg.startsWith("RS")) {
        privateKey = await importPKCS8(envPriv, alg);
        publicKey = await importSPKI(envPub, alg);
      } else if (alg.startsWith("ES")) {
        privateKey = await importPKCS8(envPriv, alg);
        publicKey = await importSPKI(envPub, alg);
      } else {
        throw new Error(`Unsupported PEM import for alg ${alg}`);
      }
      publicJwk = await exportJWK(publicKey);
    } else {
      // Generate a fresh keypair for dev.
      const { publicKey: pub, privateKey: priv } = await generateKeyPair(
        alg === "HS256" ? "HS256" : alg,
      );
      privateKey = priv;
      publicKey = pub;
      publicJwk = await exportJWK(publicKey);
    }

    const kid = env("AUTH_KID") || randomKid();
    publicJwk.kid = kid;
    publicJwk.alg = alg;
    publicJwk.use = "sig";

    return { alg, kid, privateKey, publicKey, publicJwk };
  })();
  return statePromise;
}

export async function jwks() {
  const st = await initKeys();
  return { keys: [st.publicJwk] };
}

export async function signAccessToken(
  payload: Record<string, any>,
  opts?: { expiresIn?: string | number },
) {
  const st = await initKeys();
  const issuer = env("AUTH_ISSUER") || "http://localhost:8088";
  const exp =
    opts?.expiresIn ??
    (process.env.AUTH_TOKEN_TTL_SECONDS
      ? Number(process.env.AUTH_TOKEN_TTL_SECONDS)
      : 3600);
  const now = Math.floor(Date.now() / 1000);
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: st.alg, kid: st.kid })
    .setIssuedAt(now)
    .setIssuer(issuer)
    .setExpirationTime(typeof exp === "number" ? now + exp : exp)
    .sign(st.privateKey);
  return jwt;
}

export async function verifyToken(token: string) {
  const st = await initKeys();
  const issuer = env("AUTH_ISSUER") || "http://localhost:8088";
  const res = await jwtVerify(token, st.publicKey, { issuer });
  return res;
}

undefinedVariable;