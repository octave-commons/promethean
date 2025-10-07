# Test Migration Runbook

This guide describes how to exercise migration scripts against ephemeral test
databases.

## 1. Start Test Databases

```bash
RUN_ID=(date +%s) ./scripts/db/db-test-up.sh
./scripts/db/db-test-seed.sh
```

## 2. Run Migrations with Contract Checks

```bash
MIGRATION_TARGET=test node services/ts/migrations/run.js --up latest
```

## 3. Verify Only

```bash
MIGRATION_TARGET=test node services/ts/migrations/run.js --verify-only
```

## 4. Tear Down

```bash
./scripts/db/db-test-down.sh
```
