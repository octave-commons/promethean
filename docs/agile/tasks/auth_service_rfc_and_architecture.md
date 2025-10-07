---
```
uuid: ee61990a-388c-469f-8397-92073bebb9e8
```
title: auth service rfc and architecture
status: todo
priority: P3
labels: []
```
created_at: '2025-09-15T02:02:58.524Z'
```
---
Auth Service: RFC and Architecture

Goal: Design a centralized internal auth provider for Promethean services.

Why: 19+ services require consistent, secure service-to-service auth. Current static tokens are ad hoc.

Key Decisions:
- Protocol: OAuth2.1 Client Credentials service-to-service with JWT (JWS, RS256) access tokens.
- Endpoints: `POST /oauth/token` client_credentials, `GET /.well-known/openid-configuration`, `GET /.well-known/jwks.json`, `POST /introspect` (optional), `POST /rotate` admin-only, `GET /health`.
- Token Claims: `iss`, `sub` (service id), `aud` service/group, `exp`, `iat`, `scope` space-delimited, `kid`.
- Storage: MongoDB (clients collection with hashed secret, scopes, status; keys collection for JWKS, rotation metadata).
- Signing: Asymmetric (RS256). Maintain key set with rotation; publish JWKS.
- Scopes: Align with permission gate actions and bridge/topics (e.g., `publish:agent.llm.result`, `indexer:write`, `heartbeat:read`).
- Trust Model: Internal-only exposure, but standards-based to allow future external federation.

Deliverables:
- Markdown RFC with sequence diagrams, data models, example tokens, error codes, and rotation strategy (kid overlap window).
- Alignment doc mapping existing `checkPermission`/permission gate to OAuth scopes.

Exit Criteria:
- Approved RFC; tickets created for scaffold, clients, and service integration.

#incoming #auth #oauth #architecture


