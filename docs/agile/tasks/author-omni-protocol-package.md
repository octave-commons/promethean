---
uuid: "457fd7a3-bc99-4de6-b9f3-06ef6cf00d5e"
title: "Author @promethean/omni-protocol package"
slug: "author-omni-protocol-package"
status: "ready"
priority: "P1"
labels: ["omni", "package", "typescript"]
created_at: "2025-10-11T19:22:57.819Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---




## 🎯 Outcome

Ship the initial `@promethean/omni-protocol` package containing TypeScript interfaces, JSON schema emitters, error envelopes, and streaming event definitions that mirror the SmartGPT bridge contracts.

## 📥 Inputs

- [docs/architecture/omni/omni-protocol-spec.md]
- Existing `bridge/src/routes/v1` handlers and shared actions.

## ✅ Definition of Done

- [ ] Package skeleton created under `packages/omni-protocol/` with GPL-3.0-only license metadata.
- [ ] Interfaces + types exported per spec.
- [ ] Runtime validators implemented with Zod source-of-truth and JSON Schema emitted via zod-to-json-schema for adapters.
- [ ] Unit tests covering envelope validation and error helpers.
- [ ] Published API docs stub linked from `docs/packages/`.

## 🚧 Constraints

- Maintain parity with legacy response shapes (e.g., `{ ok, base, entries }`).
- No transport logic—pure data contracts only.

## 🪜 Steps

1. Scaffold package via workspace generator; wire build/test scripts.
2. Translate spec tables into TS interfaces and runtime validators.
3. Port success/error envelope helpers from SmartGPT bridge.
4. Write AVA tests for sample payloads and error handling.

```
5. Update docs + changelog entry.
```

## 🔗 Dependencies

- [docs/agile/tasks/omni-unified-service-spec.md] (spec must exist).



