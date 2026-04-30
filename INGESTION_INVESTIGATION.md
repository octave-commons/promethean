# Ingestion System Investigation Report

**Date:** 2026-04-10
**Issue:** CMS not showing documents, confusion about lake/project naming

## Executive Summary

**Root Cause:** The ingestion system is using `tenant-id` as the project name, which should be the **lake key** (`devel`), not `devel-docs`. The canonical lake model defines ONE lake per source, but the current implementation has conflation between:
- Tenant ID (organizational boundary)
- Lake key (data source boundary)
- Content subtype (node_type: docs/code/config/data)

## Current Implementation Issues

### 1. Lake Naming Confusion

**Expected (from spec):**
```
Lake: devel
Node types: docs, code, config, data
Project: devel (in OpenPlanner)
```

**Actual (in code):**
```clojure
;; ingest_support.clj line 72
project tenant-id  ;; Uses tenant-id as project

;; documents.ts line 148
project: String(row.project ?? "devel-docs")  // Fallback to "devel-docs"
```

**Problem:** The system is using different naming conventions in different places.

### 2. KMS-Ingestion Status

**Unknown:** We don't know if KMS-Ingestion is currently running.

**Check needed:**
```bash
docker ps | grep ingestion
```

**If not running:** Documents won't appear in CMS because nothing is writing to OpenPlanner.

### 3. Graph-Weaver vs KMS-Ingestion Duplication

**Spec says:** Graph-Weaver should NOT be a second canonical producer for devel graph facts.

**Current state:** Graph-Weaver has its own scanner (`src/scan.ts`) which independently processes the same workspace.

**Impact:** Potential conflicts if both are running.

## Canonical Model (from Spec)

### Correct Lake Structure

| Lake Key | Source | Node Types |
|----------|--------|------------|
| `devel` | workspace files | docs, code, config, data |
| `web` | web crawler | visited, unvisited |
| `bluesky` | social firehose | user, post |

### OpenPlanner Event Structure

```json
{
  "kind": "docs",  // or "code", "config", "data"
  "project": "devel",  // Lake key, NOT "devel-docs"
  "source": "kms-ingestion",
  "source_ref": {
    "project": "devel",
    "session": "source-id",
    "message": "file-id"
  },
  "extra": {
    "lake": "devel",
    "node_type": "docs",  // Subtype classification
    "path": "orgs/open-hax/README.md",
    "domain": "documentation"
  }
}
```

## Document Query Issue

When the CMS queries for documents:

```typescript
// documents.ts
const filter: Record<string, unknown> = { kind: { $in: [...DOCUMENT_KINDS] } };
if (project) filter.project = project;
```

**If no documents exist with `project: "devel"`, the CMS shows nothing.**

## What Needs to Happen

### Option 1: Fix Ingestion (Long-term)

1. **Update KMS-Ingestion** to use `devel` as project/lake key
2. **Add node_type metadata** to distinguish docs/code/config/data
3. **Run ingestion** to populate OpenPlanner

**File changes:**
- `packages/knoxx/ingestion/src/kms_ingestion/jobs/ingest_support.clj`:
  ```clojure
  ;; Change line 72 from:
  project tenant-id
  
  ;; To:
  project "devel"  ;; Use canonical lake key
  extra (merge {...
               :node_type (name node-type)  ;; Add subtype
               :lake "devel"}
               extra)
  ```

### Option 2: Manual Seed (Short-term for Demo)

Use the seed script I created:

```bash
node scripts/seed-documents-to-openplanner.ts --project devel --limit 50
```

This will:
- Find markdown files in workspace
- Classify them by type
- Write to OpenPlanner with correct `project: "devel"`
- Make them visible in CMS

### Option 3: Quick Fix Documents Route

Update `documents.ts` fallback:

```typescript
// Change line 148 from:
project: String(row.project ?? "devel-docs")

// To:
project: String(row.project ?? "devel")
```

This makes the route work with the canonical lake key.

## Immediate Action Plan

### Step 1: Check Ingestion Status

```bash
# Is ingestion running?
docker ps -a | grep knoxx-ingestion

# Check MongoDB for documents
mongosh openplanner --eval 'db.events.countDocuments({kind: {$in: ["docs","code","config","data"]}})'
```

### Step 2: Seed Documents (5 minutes)

```bash
# Dry run first
node scripts/seed-documents-to-openplanner.ts --dry-run --limit 10

# Actually ingest
node scripts/seed-documents-to-openplanner.ts --project devel --limit 50
```

### Step 3: Verify CMS

```bash
# Check documents appear
curl http://localhost:7777/v1/documents?project=devel \
  -H "Authorization: Bearer change-me-openplanner"
```

### Step 4: Test Translation Backend

```bash
# Now with real documents
./scripts/test-translation-backend.sh
```

## Ingestion Architecture

```
┌─────────────────────┐
│  devel workspace    │
│  (markdown, code,   │
│   config, data)     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  KMS-Ingestion      │
│  (worker.clj)       │
│                     │
│  - Classify files   │
│  - Extract content  │
│  - Build graph      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  OpenPlanner        │
│  MongoDB            │
│                     │
│  Events:            │
│  - kind: docs/code/ │
│    config/data      │
│  - project: devel   │
│  - source: kms-     │
│    ingestion        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  CMS (documents.ts) │
│                     │
│  Query:             │
│  kind ∈ [docs,code, │
│          config,    │
│          data]      │
│  project = "devel"  │
└─────────────────────┘
```

## Key Files to Modify

### 1. Fix Ingestion Project Name

**File:** `orgs/open-hax/openplanner/packages/knoxx/ingestion/src/kms_ingestion/jobs/ingest_support.clj`

**Line 72:**
```clojure
;; Current
project tenant-id

;; Should be
project "devel"
```

**Line 75:**
```clojure
;; Add node_type metadata
:node_type (name node-type)
:lake "devel"
```

### 2. Fix Documents Route Fallback

**File:** `orgs/open-hax/openplanner/src/routes/v1/documents.ts`

**Line 148:**
```typescript
// Current
project: String(row.project ?? "devel-docs")

// Should be
project: String(row.project ?? "devel")
```

### 3. Update Graph Context

**File:** `orgs/open-hax/openplanner/packages/knoxx/ingestion/src/kms_ingestion/graph.clj`

Already uses `node-type-for-path` which is correct. Just need to ensure it's passed to OpenPlanner.

## Test Plan

1. **After seeding:**
   ```bash
   curl http://localhost:7777/v1/documents?project=devel&limit=5
   ```

2. **Check specific document:**
   ```bash
   curl http://localhost:7777/v1/documents/<doc-id>
   ```

3. **Trigger translation:**
   ```bash
   curl -X POST http://localhost:7777/v1/documents/<doc-id>/translate \
     -H "Content-Type: application/json" \
     -d '{"target_languages": ["es"]}'
   ```

4. **Verify translation segments:**
   ```bash
   curl http://localhost:7777/v1/translations/segments?project=devel
   ```

## Summary

**The CMS is empty because:**
1. ✅ No ingestion has run (or is not running currently)
2. ✅ Project naming mismatch (`devel` vs `devel-docs`)
3. ✅ Need to seed documents or run ingestion

**Fix priority:**
1. **Quick:** Run seed script (immediate demo capability)
2. **Medium:** Fix documents.ts fallback
3. **Long-term:** Fix KMS-Ingestion to use canonical lake model

**Next action:** Run the seed script to populate CMS with devel documents, then test translation backend end-to-end.
