---
uuid: "e4b85f6b-4112-4c52-84d2-17695ae5e67c"
title: "auth shared clients and middleware"
slug: "auth_shared_clients_and_middleware"
status: "incoming"
priority: "P3"
labels: ["auth", "shared", "middleware", "clients"]
created_at: "2025-10-11T01:03:32.220Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---


























Auth: Shared clients and middleware TS + Python

Goal: Provide small libraries to fetch/verify tokens and inject auth into HTTP/WebSocket requests.

Scope:
- TS: `shared/ts/src/auth/` token verifier (JWKS cache, kid rotation), HTTP middleware for Express/Fastify, helper to fetch client_credentials token.
- Python: `shared/py/auth/` verifier PyJWT + JWKS cache, FastAPI/Starlette middleware, helper to fetch client_credentials token.
- Config: `AUTH_ISSUER`, `AUTH_JWKS_URL`, `AUTH_AUDIENCE`, `AUTH_CLIENT_ID`, `AUTH_CLIENT_SECRET`.
- Docs + examples for bridging to SmartGPT Bridge, file-watcher, cephalon.

Exit Criteria:
- Unit tests verifying signature, expiry, audience, and scope checks.
- Example snippets integrated in service READMEs.

#incoming #auth #libraries #ts #python

























