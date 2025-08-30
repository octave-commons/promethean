Auth: Key rotation and bootstrap

Goal: Establish a secure bootstrap and rotation procedure for the auth service.

Scope:
- Bootstrap admin secret (env or file) to create initial admin client.
- Generate initial RSA keypair; store private securely; publish JWKS; set `kid`.
- Rotation CLI/endpoint to create new key, mark old as retiring; overlap window for dual-verify.
- Document ops runbook and rotation cadence.

Exit Criteria:
- Rotation works without downtime; old tokens valid until expiry; new tokens issued with new kid.

#auth #security #rotation #ready

