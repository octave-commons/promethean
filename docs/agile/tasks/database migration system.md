# Description
**Status:** blocked

Design and implement a versioned migration system for persistent data stores so services can evolve schemas safely.

## Requirements/Definition of done

- Migrations can be listed and executed in order against target databases.
- Support applying and rolling back migrations.
- Persist current schema version to prevent reapplication.
- Include an example migration for an existing service.

## Tasks

- [ ] Survey existing data stores and identify migration needs.
- [ ] Choose a migration framework or create a lightweight module.
- [ ] Implement CLI commands for `migrate up` and `migrate down`.
- [ ] Document workflow and provide example migration file.

## Relevant resources

You might find [Alembic](https://alembic.sqlalchemy.org/) or [migrate](https://github.com/golang-migrate/migrate) useful while working on this task.

## Comments

Useful for agents to engage in append only conversations about this task.

#ready

## Blockers
- No active owner or unclear scope
