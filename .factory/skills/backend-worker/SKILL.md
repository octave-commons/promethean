---
name: backend-worker
description: Implements server-side TypeScript features including packages, MCP tools, API endpoints, database, pipeline logic, and tests
---

# Backend Worker

NOTE: Startup and cleanup are handled by `worker-base`. This skill defines the WORK PROCEDURE.

## When to Use This Skill

Use for features involving:
- TypeScript package modifications (radar-core, signal-atproto, mcp-foundation)
- MCP tool implementation in threat-radar-mcp
- API endpoint creation/modification
- Database schema and storage logic
- Signal pipeline logic (collection, normalization, threading, reduction)
- AT Protocol publishing
- Unit and integration tests for backend code

## Work Procedure

1. **Read the feature description thoroughly.** Identify all preconditions, expected behaviors, and verification steps. Check `.factory/library/architecture.md` for package relationships.

2. **Write failing tests first (TDD).** Create vitest test files in a `__tests__/` or `tests/` directory adjacent to the source. Write tests that cover the expected behaviors listed in the feature. Run `npx vitest run <test-file>` and confirm they fail. **Exception**: For configuration-only, type-restoration, or wiring-only tasks with no new runtime logic, skip TDD and add validation tests after implementation instead.

3. **Implement the feature.** Write the minimum code to make tests pass. Follow existing patterns in the codebase. Use Zod for runtime validation. Never use `any` types.

4. **Make tests pass.** Run `npx vitest run <test-file>` and iterate until all tests pass. Do not modify tests to make them pass — fix the implementation.

5. **Run typecheck.** For packages: `cd <package-dir> && npx tsc --noEmit`. For threat-radar-mcp: `cd orgs/riatzukiza/threat-radar-mcp && npx tsc -p tsconfig.json --noEmit`.

6. **Integration verification.** If the feature involves API endpoints or MCP tools:
   - Start the service using the command from `.factory/services.yaml`
   - Test with curl: `curl -sf http://localhost:9001/health` for health, `curl -X POST -H "x-admin-key: $ADMIN_AUTH_KEY" -H "Content-Type: application/json" -d '...' http://localhost:9001/api/...` for mutations (read key from .env)
   - Stop the service when done

7. **Verify builds.** Run `cd <package-dir> && npx tsc -p tsconfig.json` to ensure the package builds cleanly.

8. **Commit.** Stage only files you created/modified. Write a descriptive commit message.

## Example Handoff

```json
{
  "salientSummary": "Restored SignalEvent, Thread, ConnectionOpportunity, ActionCard types to radar-core/src/schema.ts from stale dist; added 12 vitest test cases covering schema validation and type exports; ran tsc --noEmit with 0 errors; rebuilt dist and verified signal-atproto imports resolve.",
  "whatWasImplemented": "Recovered 5 Zod schemas (SignalEvent, SignalEventProvenance, Thread, ThreadMembership, ConnectionOpportunity, ActionCard) and their TypeScript types from packages/radar-core/dist/schema.js. Added them to src/schema.ts and re-exported from src/index.ts. Created packages/radar-core/tests/schema.test.ts with 12 test cases.",
  "whatWasLeftUndone": "",
  "verification": {
    "commandsRun": [
      { "command": "cd packages/radar-core && npx vitest run tests/schema.test.ts", "exitCode": 0, "observation": "12 tests passed" },
      { "command": "cd packages/radar-core && npx tsc --noEmit", "exitCode": 0, "observation": "no errors" },
      { "command": "cd packages/radar-core && npx tsc -p tsconfig.json", "exitCode": 0, "observation": "dist rebuilt" },
      { "command": "cd packages/signal-atproto && npx tsc --noEmit", "exitCode": 0, "observation": "imports resolve correctly" }
    ],
    "interactiveChecks": []
  },
  "tests": {
    "added": [
      {
        "file": "packages/radar-core/tests/schema.test.ts",
        "cases": [
          { "name": "SignalEvent schema validates valid event", "verifies": "SignalEvent Zod schema accepts well-formed input" },
          { "name": "SignalEvent schema rejects missing fields", "verifies": "SignalEvent Zod schema rejects incomplete input" },
          { "name": "Thread schema validates valid thread", "verifies": "Thread type has required fields" }
        ]
      }
    ]
  },
  "discoveredIssues": []
}
```

## When to Return to Orchestrator

- Feature depends on a type or API that doesn't exist yet in any package
- Database schema conflicts with existing tables in shared Postgres
- Package circular dependency detected
- Bluesky or Reddit API returns unexpected format that breaks collector contract
- Cannot resolve pnpm workspace linking issues after reasonable effort
