Auth Service

- Endpoints:
    - GET `/.well-known/jwks.json`: Public JWKS for token verification.
    - GET `/oauth/authorize`: Authorization Code endpoint (PKCE, OpenAI Custom GPT compatible).
    - POST `/oauth/token`: Issues Bearer JWT via `client_credentials`, `authorization_code`, or `refresh_token`.
    - POST `/oauth/introspect`: Validates access tokens, returns `active` and claims.
    - GET `/healthz`: Liveness check.

- Env vars:
    - `PORT`: Listen port (default 8088)
    - `AUTH_ISSUER`: Issuer URL (default http://localhost:8088)
    - `AUTH_AUDIENCE`: Default audience (optional)
    - `AUTH_ALG`: JWT alg (default EdDSA)
    - `AUTH_PRIVATE_KEY_PEM` / `AUTH_PUBLIC_KEY_PEM`: PEM for asymmetric keys (optional)
    - `AUTH_PRIVATE_JWK` / `AUTH_PUBLIC_JWK`: JWKs (optional)
    - `AUTH_KID`: Key id (optional)
    - `AUTH_TOKEN_TTL_SECONDS`: Access token TTL seconds (default 3600)
    - `AUTH_DEFAULT_SCOPES`: Space-delimited default scopes (optional)
    - `AUTH_STATIC_CLIENTS`: JSON map of static clients, e.g.
      `{ "bridge": { "client_secret": "dev-secret", "scopes": ["index:write"], "aud": "internal" } }`
        - For Authorization Code flow, omit `client_secret` to treat client as public and allow PKCE-based login.

- Dev
    - `pnpm -C services/ts/auth-service install`
    - `pnpm -C services/ts/auth-service start:dev`
    - `pnpm -C services/ts/auth-service test`
