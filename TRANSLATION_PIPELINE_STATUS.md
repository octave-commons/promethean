# Translation Pipeline Implementation Status

Date: 2026-04-10
Status: **Translation Backend Routes COMPLETE - Ready for Testing**

## What's Been Implemented

### ✅ OpenPlanner Translation Routes (COMPLETE)

**File:** `orgs/open-hax/openplanner/src/routes/v1/translations.ts`

All endpoints from the spec are now implemented:

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/v1/translations/segments` | GET | List segments with filtering | ✅ Complete |
| `/v1/translations/segments/:id` | GET | Get single segment with labels | ✅ Complete |
| `/v1/translations/segments/:id/labels` | POST | Submit label (review) | ✅ Complete |
| `/v1/translations/segments/batch` | POST | Batch import from MT pipeline | ✅ Complete |
| `/v1/translations/export/sft` | GET | Export SFT training data (JSONL) | ✅ Complete |
| `/v1/translations/export/manifest` | GET | Get statistics/manifest | ✅ Complete |
| `/v1/documents/:id/translate` | POST | Trigger translation job | ✅ Complete |
| `/v1/translations/jobs` | GET | List translation jobs | ✅ Complete |

### ✅ Knoxx Backend Translation Routes (ALREADY EXISTS)

**File:** `orgs/open-hax/knoxx/backend/src/cljs/knoxx/backend/translation_routes.cljs`

All proxy routes already implemented with auth context:
- ✅ Proxies to OpenPlanner with auth headers
- ✅ Permission checks (`org.translations.read`, `org.translations.review`, etc.)
- ✅ User context injection (labeler_id, labeler_email, org_id)

### ✅ Translation Spec Corpus (COMPLETE)

All specs exist and are well-defined:
- ✅ `knowledge-ops-translation-review-epic.md`
- ✅ `knowledge-ops-translation-routes.md`
- ✅ `knowledge-ops-translation-review-ui.md`
- ✅ `knowledge-ops-translation-mt-pipeline.md`
- ✅ `knowledge-ops-translation-export.md`

## What's Still Needed for Demo

### ❌ 1. MongoDB Collections Creation

The translation routes expect these MongoDB collections:
```javascript
db.createCollection("translation_segments")
db.createCollection("translation_labels")
db.createCollection("translation_jobs")

// Indexes
db.translation_segments.createIndex({ document_id: 1, segment_index: 1 })
db.translation_segments.createIndex({ status: 1 })
db.translation_segments.createIndex({ target_lang: 1 })
db.translation_segments.createIndex({ org_id: 1 })
db.translation_labels.createIndex({ segment_id: 1, created_at: -1 })
```

**Action:** Run these commands or let the app auto-create on startup.

### ❌ 2. CMS Document Population

**Problem:** CMS doesn't show devel markdown documents.

**Root Cause Analysis:**
- KMS-Ingestion exists in `packages/knoxx/ingestion`
- Graph-Weaver does independent scanning
- **Both** create graph events → potential conflicts
- Unclear which is running and writing to MongoDB

**Investigation Needed:**
1. Check if KMS-Ingestion is running: `docker ps | grep ingestion`
2. Check MongoDB `events` collection for documents
3. Determine if OpenPlanner `/v1/documents` endpoint is being called

**Fix Options:**
- Option A: Start KMS-Ingestion service
- Option B: Run manual ingestion via API
- Option C: Use Graph-Weaver scan results

### ❌ 3. Frontend Translation Review UI

**Required Components:**
- `packages/knoxx/frontend/src/pages/TranslationPage.tsx` - Review workbench
- `packages/knoxx/frontend/src/components/TranslationPanel.tsx` - Segment display
- `packages/knoxx/frontend/src/components/LabelPanel.tsx` - Label form

**Status:** Not implemented yet. Specs exist.

### ❌ 4. MT Pipeline Worker

**Required:** `packages/knoxx/ingestion/src/knoxx/ingestion/translation.clj`

**Purpose:**
1. Query OpenPlanner for documents needing translation
2. Chunk into ~500 token segments
3. Call GLM-5 via Proxx for translation
4. Write segments via `/v1/translations/segments/batch`

**Status:** Not implemented. Can defer - manual seeding works for demo.

### ❌ 5. Document "Translate" Button

**Required:** Add to CMS UI:
- Button in document detail view
- Calls `POST /v1/documents/:id/translate`
- Shows translation job status

**Status:** Not implemented. Needs frontend work.

## Recommended Demo Flow (9-Day Timeline)

### Day 1-2: Backend Testing ✅ (DONE)
- [x] Implement translation routes
- [ ] Create MongoDB collections
- [ ] Test endpoints with curl/Postman
- [ ] Verify Knoxx proxy works

### Day 3-4: Populate CMS with Real Documents
- [ ] Investigate ingestion system
- [ ] Get devel markdown docs into MongoDB
- [ ] Verify CMS shows documents
- [ ] Add "Translate" button to CMS

### Day 5-6: Translation Review UI
- [ ] Implement TranslationPage.tsx
- [ ] Implement LabelPanel.tsx
- [ ] Wire up to backend
- [ ] Test review workflow

### Day 7-8: MT Pipeline (Optional)
- [ ] Implement translation worker
- [ ] Or manually seed test translations
- [ ] Test end-to-end flow

### Day 9: Demo Preparation
- [ ] Test complete workflow
- [ ] Prepare demo data
- [ ] Document demo script

## Quick Start for Testing

### 1. Test Translation Routes (Right Now)

```bash
# Set environment
export OPENPLANNER_URL="http://localhost:7777"
export API_KEY="change-me-openplanner"

# Create test segment
curl -X POST $OPENPLANNER_URL/v1/translations/segments/batch \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "project": "devel-docs",
    "org_id": "open-hax",
    "segments": [
      {
        "source_text": "This is a test document for translation.",
        "translated_text": "Este es un documento de prueba para traducción.",
        "source_lang": "en",
        "target_lang": "es",
        "document_id": "test-doc-1",
        "segment_index": 0,
        "mt_model": "glm-5",
        "confidence": 0.85
      }
    ]
  }'

# List segments
curl -X GET "$OPENPLANNER_URL/v1/translations/segments?project=devel-docs" \
  -H "Authorization: Bearer $API_KEY"

# Submit label
curl -X POST $OPENPLANNER_URL/v1/translations/segments/<SEGMENT_ID>/labels \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "adequacy": "good",
    "fluency": "excellent",
    "terminology": "correct",
    "risk": "safe",
    "overall": "approve",
    "labeler_id": "test-user",
    "labeler_email": "test@example.com"
  }'

# Export SFT
curl -X GET "$OPENPLANNER_URL/v1/translations/export/sft?project=devel-docs&target_lang=es" \
  -H "Authorization: Bearer $API_KEY"
```

### 2. Check CMS Documents

```bash
# Check what's in MongoDB
curl -X GET "$OPENPLANNER_URL/v1/documents?project=devel-docs&visibility=internal" \
  -H "Authorization: Bearer $API_KEY"
```

### 3. Test Knoxx Proxy

```bash
# Via Knoxx backend (with auth)
curl -X GET "http://localhost:80/api/translations/segments?project=devel-docs" \
  -H "Authorization: Bearer $KNOXX_API_KEY" \
  -H "Cookie: <auth-cookie>"
```

## Architecture Clarification

### Data Flow (Target State)

```
┌─────────────────────┐
│  devel markdown     │
│  documents          │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  KMS-Ingestion      │ (or Graph-Weaver)
│  (scan + ingest)    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  OpenPlanner        │
│  MongoDB            │
│  - events           │
│  - translation_*    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Knoxx Backend      │
│  (auth + proxy)     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Knoxx Frontend     │
│  - CMS              │
│  - Translation UI   │
└─────────────────────┘
```

### Translation Flow

```
CMS Document (EN)
    │
    ├─ [Translate Button]
    │
    ▼
MT Pipeline (GLM-5)
    │
    ├─ Chunk into segments
    ├─ Translate each
    │
    ▼
OpenPlanner Segments (pending)
    │
    ├─ GET /api/translations/segments
    │
    ▼
Review UI (SME)
    │
    ├─ Select chunks
    ├─ Add comments
    ├─ Label: adequacy, fluency, etc.
    ├─ Submit: approve/needs_edit/reject
    │
    ▼
Approved Translations
    │
    ├─ GET /v1/translations/export/sft
    │
    ▼
SFT Training Data
    │
    └─ Future: Fine-tune model

Public Blog Post
    │
    └─ RAG Context (labels + corrections)
```

## Key Issues to Resolve

### Issue 1: Duplicate Ingestion Systems

**Observation:** Both KMS-Ingestion and Graph-Weaver create graph events.

**Impact:**
- Potential conflicts in MongoDB
- Unclear which is source of truth
- CMS may be reading from wrong collection

**Questions:**
1. Which ingestion system is currently running?
2. Which one should we use?
3. Are they writing to the same MongoDB collection?
4. Why is CMS not showing documents?

**Recommendation:** Audit running services, pick ONE ingestion path.

### Issue 2: CMS Data Source

**Observation:** CMS routes read from `events` collection with `kind` filter.

**Check:**
```javascript
// In MongoDB
db.events.find({ kind: { $in: ["docs", "code", "config", "data"] } }).count()
```

If count = 0, documents aren't being ingested.

### Issue 3: Translation Permissions

**Required in policy-db:**
```javascript
['org.translations.read', 'org_translations', 'read', 'Read translation segments'],
['org.translations.review', 'org_translations', 'review', 'Review and label translations'],
['org.translations.export', 'org_translations', 'export', 'Export translation training data'],
['org.translations.manage', 'org_translations', 'manage', 'Manage translation pipeline config'],
```

**Check:** Are these in the policy-db seed?

## Next Steps

1. **IMMEDIATE:** Test translation routes with curl
2. **URGENT:** Get documents into CMS (investigate ingestion)
3. **HIGH:** Build translation review UI
4. **MEDIUM:** Add "Translate" button to CMS
5. **LOW:** Implement MT pipeline (can defer with manual seeding)

## Files to Create Next

1. **Frontend UI:**
   - `orgs/open-hax/knoxx/frontend/src/pages/TranslationPage.tsx`
   - `orgs/open-hax/knoxx/frontend/src/components/TranslationPanel.tsx`
   - `orgs/open-hax/knoxx/frontend/src/components/LabelPanel.tsx`

2. **MT Pipeline:**
   - `orgs/open-hax/knoxx/ingestion/src/knoxx/ingestion/translation.clj`

3. **CMS Integration:**
   - Add translate button to document detail view

## Success Criteria for Demo

- [ ] CMS shows devel markdown documents
- [ ] Documents have "Translate" button
- [ ] Clicking "Translate" creates translation segments
- [ ] Review UI shows pending segments
- [ ] SME can label segments (adequacy, fluency, etc.)
- [ ] Approve/Reject works
- [ ] Approved translations export as SFT JSONL
- [ ] At least 10 segments reviewed in one language (es or de)

## Questions for User

1. Is KMS-Ingestion currently running? (Check with `docker ps`)
2. Do you want me to build the frontend UI next, or investigate the CMS population issue first?
3. For the demo, is manual translation seeding acceptable, or must we have the MT pipeline working?
4. Which language pair is higher priority for demo: en→es or en→de?
5. Do you have SME reviewers lined up, or should I focus on the UI demo first?
