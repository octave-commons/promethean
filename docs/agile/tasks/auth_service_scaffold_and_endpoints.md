---
uuid: "ef909fd1-19f0-43d4-b022-35d29ec053c7"
title: "auth service scaffold and endpoints"
slug: "auth_service_scaffold_and_endpoints"
status: "incoming"
priority: "P3"
labels: ["auth", "service", "scaffold", "endpoints"]
created_at: "2025-10-07T20:25:05.643Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---


```
Auth Service: Scaffold + Endpoints
```
Goal: Implement a minimal OAuth2.1 service for internal use.

Stack:
- TypeScript (Node), Fastify or Express. Path: `services/ts/auth/`.
- MongoDB for client + keys. Env-configurable connection.

Scope (MVP):
- `POST /oauth/token` client_credentials: Validate client_id/secret, issue RS256 JWT with scopes + 5–15m TTL.
- `GET /.well-known/jwks.json`: Publish public keys (kid, kty, e, n, alg, use).
- `GET /.well-known/openid-configuration`: Minimal metadata issuer, jwks_uri, token_endpoint.
- `GET /health`: Liveness/readiness.
- Key rotation worker + admin CLI to generate new keypair and mark old key retiring (overlap window).

Exit Criteria:
- Service starts locally, issues + verifies tokens (via JWKS) end-to-end.
- Basic tests for token issuance, expiration, invalid secret, and JWKS fetch.

#incoming #auth #oauth #service




