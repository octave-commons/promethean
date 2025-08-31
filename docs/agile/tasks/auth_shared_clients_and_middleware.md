Auth: Shared clients and middleware (TS + Python)

Goal: Provide small libraries to fetch/verify tokens and inject auth into HTTP/WebSocket requests.

Scope:
- TS: `shared/ts/src/auth/` token verifier (JWKS cache, kid rotation), HTTP middleware for Express/Fastify, helper to fetch client_credentials token.
- Python: `shared/py/auth/` verifier (PyJWT + JWKS cache), FastAPI/Starlette middleware, helper to fetch client_credentials token.
- Config: `AUTH_ISSUER`, `AUTH_JWKS_URL`, `AUTH_AUDIENCE`, `AUTH_CLIENT_ID`, `AUTH_CLIENT_SECRET`.
- Docs + examples for bridging to SmartGPT Bridge, file-watcher, cephalon.

Exit Criteria:
- Unit tests verifying signature, expiry, audience, and scope checks.
- Example snippets integrated in service READMEs.

#incoming #auth #libraries #ts #python

