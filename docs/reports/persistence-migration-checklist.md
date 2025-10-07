---
project: Promethean
tags:  
- migration  
- persistence  
- dualstore
---

# 📋 Persistence Migration Checklist

This document tracks the migration of Promethean services from legacy **MongoClient/CollectionManager/DualSink** persistence to the shared **DualStore/ContextStore** module under `shared/ts/persistence/`.
- [x] Cephalon uses DualStore
- [ ] SmartGPT Bridge uses DualStore
- [ ] Discord-embedder uses DualStore
- [ ] Kanban Processor uses DualStore
- [ ] Markdown Graph uses DualStore

---

## ✅ Cephalon
- [x] Replaced `CollectionManager` → `DualStoreManager`
- [x] Replaced `ContextManager` → `ContextStore`
- [ ] Verify no lingering legacy files

---

## ⚠️ SmartGPT Bridge
- [ ] Refactor tests $`helpers/server.js`, `global.teardown.test.js`$ to use `DualStore.create$"bridge_logs"$`
- [ ] Move persistence helpers → shared `clients.ts`
- [ ] Delete `mongo.js` and `DualSink.js`
- [ ] Update `AGENTS.md` to confirm persistence = `DualStore`

---

## ⚠️ Discord-embedder
- [x] Introduced `DualStoreManager` + `ContextStore`
- [ ] Remove `getMongoClient()` from `src/index.ts`
- [ ] Replace with `DualStore.create$"discord_messages"$`
- [ ] Remove Mongo fallback entirely
- [ ] Update tests to confirm only `DualStore` is used

---

## ⚠️ Kanban Processor
- [x] Uses `DualStoreManager`
- [ ] Remove `MongoClient` + `getMongoClient()` imports
- [ ] Refactor persistence init to always use `ctx.createCollection("kanban")`
- [ ] Replace direct Mongo queries with `DualStore` APIs
- [ ] Add test for Chroma indexing via `DualStore`

---

## ⚠️ Markdown Graph
- [x] Core $`src/graph.ts`$ migrated to `DualStore`
- [ ] Refactor tests $`tests/graph.test.ts`$ to use mock `DualStore`
- [ ] Delete leftover `getMongoClient()` references

---

## ❌ Codex Context
- [ ] Replace doc snippet $`requests/2025.08.21...md`$ with `DualStore.create$"codex_context"$`

---

## ❌ Migration Scripts
- [ ] Replace `new MongoClient()` in `cdc.ts` with `DualStore.create("migrations")`
- [ ] Replace `new MongoClient()` in `backfill.js` with `DualStore.create("migrations")`
- [ ] Run migration tests for data integrity

---

# 🏁 Next Steps
- [ ] Finish SmartGPT Bridge test migration first (unblocks CI)
- [ ] Eliminate hybrid persistence in Discord-embedder & Kanban Processor
- [ ] Update Markdown Graph tests
- [ ] Rewrite migration scripts to use `DualStore`
- [ ] Update Codex Context docs to reference `DualStore`

---

> ✅ Once all boxes are checked, Promethean persistence will be fully unified under `DualStore`/`ContextStore`.