---
uuid: "0bd7c181-50b1-4376-8461-dba469df8aec"
title: "Define Omni protocol TypeScript interfaces and types"
slug: "define-omni-protocol-typescript-interfaces"
status: "done"
priority: "P1"
labels: ["interfaces", "omni", "protocol", "typescript"]
created_at: "2025-10-12T21:40:23.579Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---









































































































































































































































































## 🎯 Outcome

Translate the Omni protocol specification into comprehensive TypeScript interfaces covering all method families, request/response types, error envelopes, and streaming events.

## 📥 Inputs

- `docs/architecture/omni/omni-protocol-spec.md`
- Existing SmartGPT bridge type definitions for reference
- Package scaffold from previous task

## ✅ Definition of Done

- [x] `RequestContext` interface with all required fields
- [x] Success and error envelope types (`SuccessEnvelope<T>`, `ErrorEnvelope`)
- [x] Complete interface definitions for all 8 method families:
  - Files (listDirectory, treeDirectory, viewFile, writeContent, writeLines, scheduleReindex)
  - Search (grep, semantic, web)
  - Sinks (list, search)
  - Indexer (status, control)
  - Agents (list, start, status, tail, control, streamLogs)
  - Exec (run)
  - GitHub (rest, graphql, rateLimit)
  - Metadata (openapi, health)
- [x] Stream event types (`StreamEvent<T,D>`) and all event data types
- [x] Supporting types (FileEntry, GrepHit, SemanticHit, AgentHandle, etc.)
- [x] Method metadata interface for introspection
- [x] All interfaces properly exported from `src/index.ts`
- [x] TypeScript compilation successful with strict type checking

## 🚧 Constraints

- Must maintain backward compatibility with existing `/v1` response shapes
- Interfaces should be transport-agnostic
- Use generic types where appropriate for reusability
- Include comprehensive JSDoc comments for public APIs

## 🪜 Steps

1. Create `src/types/` directory structure
2. Define core envelope types and RequestContext
3. Implement interfaces for each method family in separate files
4. Create supporting data types (FileEntry, AgentStatus, etc.)
5. Define streaming event types and data structures
6. Create method metadata interface
7. Add comprehensive JSDoc documentation
8. Export all types from main index file
9. Run TypeScript compilation to verify correctness

## 🧮 Story Points

4

---

## 🔗 Related Epics

- [[author-omni-protocol-package]]

---

## ⛓️ Blocked By

- [scaffold-omni-protocol-package](docs/agile/tasks/scaffold-omni-protocol-package.md)

---

## ⛓️ Blocks

- [implement-omni-protocol-zod-validation](docs/agile/tasks/implement-omni-protocol-zod-validation.md)

---

## 🔍 Relevant Links

- `docs/architecture/omni/omni-protocol-spec.md`
- Existing SmartGPT bridge type definitions
- TypeScript interface best practices

## 📝 Completion Notes

✅ **COMPLETED** - All TypeScript interfaces have been implemented and verified:

- ✅ RequestContext interface with all required fields
- ✅ Success and error envelope types (`SuccessEnvelope<T>`, `ErrorEnvelope`)
- ✅ Complete interface definitions for all 8 method families:
  - Files (listDirectory, treeDirectory, viewFile, writeContent, writeLines, scheduleReindex)
  - Search (grep, semantic, web) 
  - Sinks (list, search)
  - Indexer (status, control)
  - Agents (list, start, status, tail, control, streamLogs)
  - Exec (run)
  - GitHub (rest, graphql, rateLimit)
  - Metadata (openapi, health)
- ✅ Stream event types (`StreamEvent<T,D>`) and all event data types
- ✅ Supporting types (FileEntry, GrepHit, SemanticHit, AgentHandle, etc.)
- ✅ Method metadata interface for introspection
- ✅ All interfaces properly exported from `src/index.ts`
- ✅ TypeScript compilation successful with strict type checking

**Location**: `packages/omni-protocol/src/types/methods.ts`, `envelopes.ts`, `streaming.ts`








































































































































































































































































