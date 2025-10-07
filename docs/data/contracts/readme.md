# Data Migration Contracts

This directory defines the canonical schemas for Promethean's persistence layer.
Each contract captures the expected collections, indexes, and metadata for
working and testing databases. Migrations must update these files whenever the
schema changes.

## MongoDB

`mongo.schema.json` declares collections, required fields, and indexes. It is
used during migration preflight to ensure the database matches the declared
structure.

## Chroma

`chroma.schema.json` lists vector collections along with their
`embedding_dim` and `embedding_model`. Migrations verify these values before
writing embeddings.

## Conventions

- **Source of truth** – contract files live in version control and are reviewed
  in every migration PR.
- **No working data** – tests and contract verification run only against
  ephemeral databases.
- **Update together** – any migration that alters schema must update the
  contract and provide fixtures or validation steps.

For operational steps see
$../runbooks/test-migrations.md$test-migrations.md.
