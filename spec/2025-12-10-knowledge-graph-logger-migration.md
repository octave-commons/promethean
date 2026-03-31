# Knowledge Graph logger migration to @promethean-os/logger (2025-12-10)

## Code touchpoints

- services/knowledge-graph/src/utils/logger.ts:1-133 (custom singleton logger to be replaced)
- services/knowledge-graph/src/builder.ts:7,51-117,218,271,576 (logging via Logger.getInstance())
- services/knowledge-graph/src/processors/content.ts:9,59-144,316,385 (logging calls)
- services/knowledge-graph/src/database/database.ts:3,134-334 (logging calls)
- services/knowledge-graph/src/database/repository.ts:3,31-85 (logging calls)
- services/knowledge-graph/test-security.js:2,6-10 (logger import and usage)
- packages/logger/src/index.ts:4-25 (package exports)
- packages/logger/src/types.ts:4-60 (Logger interface and LogLevel)
- packages/logger/src/factory.ts:4-80 (getLogger/createNamedLogger helpers)

## Existing issues / PRs

- None found; migration tracked locally only.

## Requirements

- Replace knowledge-graph custom logger with @promethean-os/logger package.
- Update all logger usages to package API (message + context) while preserving log context/component data.
- Remove or retire services/knowledge-graph/src/utils/logger.ts so code consumes shared package.
- Align any ad-hoc scripts/tests (test-security.js) with new logger import and methods.

## Definition of done

- All knowledge-graph sources import loggers from @promethean-os/logger; no references to ./utils/logger remain.
- Logging calls compile against package Logger interface; builds/typechecks succeed for knowledge-graph package.
- Redundant local logger implementation removed; consumers still log component/module context.
- Quick verification step captured (lint/test/tsc or rationale if skipped).

## Plan (phased)

- Phase 1: Swap logger dependency
  - Identify desired factory helper (getLogger/createNamedLogger) and instantiate module-scoped loggers for database, repository, builder, processors, and scripts.
  - Map existing component parameter into module context or per-call context.
- Phase 2: Update call sites
  - Rewrite logging calls to package signature `logger.<level>(message, context)`; include previous metadata/error details in context.
  - Replace singleton getter usages with shared named loggers.
- Phase 3: Clean up and verify
  - Remove services/knowledge-graph/src/utils/logger.ts and update imports/tsconfig if needed.
  - Run or note verification (lint/tsc/tests) for knowledge-graph scope.
  - Confirm tree has no residual references to old logger.
