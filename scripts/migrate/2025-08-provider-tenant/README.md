Migration: Provider + Tenant partitioning

- Add compound unique indexes on `{ provider, tenant, foreign_id }` for message-like collections.
- Create Chroma namespaces `<provider>__<tenant>__messages` and `<provider>__<tenant>__attachments`.
- Do not drop legacy collections until cutover is verified.

