---
uuid: 5334798c-3a31-4edc-822b-e761c0354509
title: auth key rotation and bootstrap
status: todo
priority: P3
labels: []
created_at: '2025-09-15T02:02:58.508Z'
---
Auth: Key rotation and bootstrap

Goal: Establish a secure bootstrap and rotation procedure for the auth service.

Scope:
- Bootstrap admin secret (env or file) to create initial admin client.
- Generate initial RSA keypair; store private securely; publish JWKS; set `kid`.
- Rotation CLI/endpoint to create new key, mark old as retiring; overlap window for dual-verify.
- Document ops runbook and rotation cadence.

Exit Criteria:
- Rotation works without downtime; old tokens valid until expiry; new tokens issued with new kid.

#incoming #auth #security #rotation


