# Translation Pipeline Quick Start

## What's Done

✅ **OpenPlanner Translation Routes** - All backend endpoints implemented
✅ **Knoxx Proxy Routes** - Auth-aware proxying already exists
✅ **Translation Specs** - Complete documentation

## Test It Now

```bash
# Run the test script
./scripts/test-translation-backend.sh http://localhost:7777 change-me-openplanner
```

## Key Endpoints

### List Segments
```bash
curl http://localhost:7777/v1/translations/segments?project=devel-docs \
  -H "Authorization: Bearer change-me-openplanner"
```

### Create Segments (from MT pipeline)
```bash
curl -X POST http://localhost:7777/v1/translations/segments/batch \
  -H "Authorization: Bearer change-me-openplanner" \
  -H "Content-Type: application/json" \
  -d '{
    "project": "devel-docs",
    "segments": [{
      "source_text": "Hello world",
      "translated_text": "Hola mundo",
      "source_lang": "en",
      "target_lang": "es",
      "document_id": "test-1",
      "segment_index": 0
    }]
  }'
```

### Submit Review Label
```bash
curl -X POST http://localhost:7777/v1/translations/segments/<ID>/labels \
  -H "Authorization: Bearer change-me-openplanner" \
  -H "Content-Type: application/json" \
  -d '{
    "adequacy": "good",
    "fluency": "excellent",
    "terminology": "correct",
    "risk": "safe",
    "overall": "approve",
    "labeler_id": "user-123",
    "labeler_email": "user@example.com"
  }'
```

### Export Training Data
```bash
curl http://localhost:7777/v1/translations/export/sft?project=devel-docs&target_lang=es \
  -H "Authorization: Bearer change-me-openplanner"
```

## What's Needed for Demo

1. **CMS Documents** - Devel markdown docs need to be in MongoDB
2. **Review UI** - Frontend translation review page
3. **"Translate" Button** - Add to CMS document view
4. **MT Pipeline** (optional) - Can manually seed for demo

## Architecture

```
Devel Docs → KMS-Ingestion → OpenPlanner MongoDB
                                      ↓
                           Knoxx Backend (auth proxy)
                                      ↓
                           Translation Routes ✓
                                      ↓
                           Review UI (TODO)
```

## Files Changed

- ✅ `orgs/open-hax/openplanner/src/routes/v1/translations.ts` - Implemented all routes
- ✅ `orgs/open-hax/openplanner/src/routes/v1/index.ts` - Routes registered

## Next Priority

**Option A:** Investigate CMS document population issue
**Option B:** Build translation review UI
**Option C:** Add "Translate" button to CMS

Recommend: **Option A** (CMS docs) → **Option C** (Button) → **Option B** (UI)

This gives you a complete demo flow: See doc → Click translate → Review → Export.
