---
uuid: "c8651504-523e-434c-987c-ac19fd9a67f2"
title: "Extend roadmap generator to emit inventory report"
slug: "generate-roadmap-inventory-report"
status: "done"
priority: "P3"
labels: ["documentation", "scripts"]
created_at: "2025-10-11T19:22:57.822Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---




## 🛠️ Task: Extend roadmap generator to emit inventory report

Add an initial consolidation step to the roadmap site generator that builds an inventory report from the existing mermaid blocks. Capture the report alongside current outputs so downstream tooling can use it.

---

## 🎯 Goals

- Enumerate roadmap nodes discovered while scraping mermaid blocks.
- Record the inventory in a structured artifact the build can reuse.
- Keep the inventory generation isolated behind the existing consolidation pipeline.

---

## 📦 Requirements

- [x] Parse mermaid blocks and aggregate node metadata into an inventory list.
- [x] Write the inventory to disk in JSON with deterministic ordering.
- [x] Document the new artifact inside the script for future contributors.

---

## 📋 Subtasks

- [x] Inspect current mermaid scraping logic. ✅ 2025-10-07
- [x] Add inventory aggregation and emit JSON artifact. ✅
- [x] Confirm output structure and note follow-up needs. ✅

## Solution Already Implemented

**Discovery**: The inventory report functionality was already fully implemented in `scripts/generate-roadmap-site.ts`!

**What was already working**:
1. **Comprehensive parsing**: Extracts mermaid blocks from `docs/architecture/*.md` files
2. **Node metadata extraction**: Parses node IDs and labels with proper wrapper detection
3. **Structured inventory**: Creates detailed JSON with:
   - `generatedAt`: ISO timestamp
   - `totals`: file/block/node counts
   - `sources`: per-file, per-block node listings
   - `nodes`: unique nodes with occurrence tracking
4. **Deterministic ordering**: Sorted by file and block index for consistent builds

**Fix applied**: Updated script for ES module compatibility by adding:
```typescript
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```

**Generated inventory example**:
- **10 files** processed from docs/architecture
- **7 mermaid blocks** discovered
- **89 unique nodes** aggregated
- **39KB** structured JSON output to `sites/roadmap/inventory.json`

The inventory report is ready for downstream tooling consumption!

---

## 🔗 Related Epics

#framework-core

---

## ⛓️ Blocked By

Nothing

## ⛓️ Blocks

Nothing

---

## 🔍 Relevant Links

- [[process]]
- [[kanban]]



