# Manual Translation Backend Test Guide

## Prerequisites

1. OpenPlanner running on port 7777
2. API key set (default: `change-me-openplanner`)
3. MongoDB accessible

## Test 1: Health Check

```bash
curl http://localhost:7777/v1/health
```

Expected: `{"status":"ok",...}`

## Test 2: Create Translation Segments

```bash
curl -X POST http://localhost:7777/v1/translations/segments/batch \
  -H "Authorization: Bearer change-me-openplanner" \
  -H "Content-Type: application/json" \
  -d '{
    "project": "devel-docs",
    "org_id": "open-hax",
    "segments": [
      {
        "source_text": "Welcome to our documentation. This guide will help you get started with our platform.",
        "translated_text": "Bienvenido a nuestra documentación. Esta guía le ayudará a comenzar con nuestra plataforma.",
        "source_lang": "en",
        "target_lang": "es",
        "document_id": "welcome-guide",
        "segment_index": 0,
        "mt_model": "glm-5",
        "confidence": 0.89,
        "domain": "documentation"
      },
      {
        "source_text": "Installation takes less than 5 minutes and requires no external dependencies.",
        "translated_text": "La instalación toma menos de 5 minutos y no requiere dependencias externas.",
        "source_lang": "en",
        "target_lang": "es",
        "document_id": "welcome-guide",
        "segment_index": 1,
        "mt_model": "glm-5",
        "confidence": 0.92,
        "domain": "documentation"
      }
    ]
  }'
```

Expected:
```json
{
  "ok": true,
  "imported": 2,
  "errors": 0,
  "results": [...]
}
```

Note the segment IDs from the response!

## Test 3: List Segments

```bash
curl "http://localhost:7777/v1/translations/segments?project=devel-docs&limit=10" \
  -H "Authorization: Bearer change-me-openplanner"
```

Expected:
```json
{
  "segments": [
    {
      "id": "...",
      "source_text": "...",
      "translated_text": "...",
      "status": "pending",
      ...
    }
  ],
  "total": 2,
  "has_more": false
}
```

## Test 4: Get Single Segment

Replace `<SEGMENT_ID>` with an ID from Test 3:

```bash
curl "http://localhost:7777/v1/translations/segments/<SEGMENT_ID>" \
  -H "Authorization: Bearer change-me-openplanner"
```

Expected: Segment details with empty `labels` array.

## Test 5: Submit Review Label

Replace `<SEGMENT_ID>`:

```bash
curl -X POST "http://localhost:7777/v1/translations/segments/<SEGMENT_ID>/labels" \
  -H "Authorization: Bearer change-me-openplanner" \
  -H "Content-Type: application/json" \
  -d '{
    "adequacy": "good",
    "fluency": "excellent",
    "terminology": "correct",
    "risk": "safe",
    "overall": "approve",
    "editor_notes": "Good translation, ready for publication.",
    "labeler_id": "demo-reviewer",
    "labeler_email": "reviewer@demo.com"
  }'
```

Expected:
```json
{
  "ok": true,
  "label": {...},
  "new_status": "approved"
}
```

## Test 6: Verify Status Changed

```bash
curl "http://localhost:7777/v1/translations/segments/<SEGMENT_ID>" \
  -H "Authorization: Bearer change-me-openplanner"
```

Expected: `status` field should now be `"approved"` and `labels` array should have one entry.

## Test 7: Export SFT Training Data

```bash
curl "http://localhost:7777/v1/translations/export/sft?project=devel-docs&target_lang=es" \
  -H "Authorization: Bearer change-me-openplanner"
```

Expected: JSONL format:
```
{"prompt":"Translate the following text from English to es...","target":"Bienvenido a nuestra documentación..."}
{"prompt":"Translate the following text from English to es...","target":"La instalación toma menos de 5 minutos..."}
```

## Test 8: Get Manifest

```bash
curl "http://localhost:7777/v1/translations/export/manifest?project=devel-docs" \
  -H "Authorization: Bearer change-me-openplanner"
```

Expected:
```json
{
  "project": "devel-docs",
  "generated_at": "...",
  "languages": {
    "es": {
      "total": 2,
      "approved": 1,
      "pending": 1,
      ...
    }
  },
  "labelers": [
    {
      "email": "reviewer@demo.com",
      "segments_labeled": 1
    }
  ],
  "export_sizes": {...}
}
```

## Test 9: Submit Correction

For the second segment (still pending):

```bash
curl -X POST "http://localhost:7777/v1/translations/segments/<SECOND_SEGMENT_ID>/labels" \
  -H "Authorization: Bearer change-me-openplanner" \
  -H "Content-Type: application/json" \
  -d '{
    "adequacy": "adequate",
    "fluency": "good",
    "terminology": "minor_errors",
    "risk": "safe",
    "overall": "needs_edit",
    "corrected_text": "La instalación dura menos de 5 minutos y no necesita dependencias externas.",
    "editor_notes": "Improved 'toma' to 'dura' and 'requiere' to 'necesita' for better flow.",
    "labeler_id": "demo-reviewer",
    "labeler_email": "reviewer@demo.com"
  }'
```

Expected: `new_status` should be `"approved"` because `corrected_text` was provided.

## Test 10: Verify Corrected Text in Export

```bash
curl "http://localhost:7777/v1/translations/export/sft?project=devel-docs&target_lang=es" \
  -H "Authorization: Bearer change-me-openplanner"
```

Expected: The second line should use the `corrected_text` instead of the original `translated_text`.

## Via Knoxx Proxy

Once Knoxx is running with auth:

```bash
# List segments (requires auth)
curl "http://localhost:80/api/translations/segments?project=devel-docs" \
  -H "Authorization: Bearer <KNOXX_API_KEY>"

# Or with session cookie
curl "http://localhost:80/api/translations/segments?project=devel-docs" \
  -H "Cookie: session=<session-token>"
```

## Troubleshooting

### 404 Not Found
- OpenPlanner might not be running
- Check port 7777 is correct
- Verify routes are registered in `/v1` prefix

### 401 Unauthorized
- Check API key is correct
- Verify `Authorization: Bearer <token>` header format

### 500 Internal Server Error
- Check MongoDB is running
- Check MongoDB connection string
- Look for errors in OpenPlanner logs

### Empty Results
- Segments not created yet - run Test 2 first
- Check `project` query parameter matches
- Verify MongoDB collections exist

## MongoDB Direct Check

```bash
# Connect to MongoDB
mongosh

# Check collections
use openplanner
show collections

# Count segments
db.translation_segments.countDocuments()

# View segments
db.translation_segments.find().pretty()

# Count labels
db.translation_labels.countDocuments()

# View labels
db.translation_labels.find().pretty()
```

## Success Criteria

- [ ] Created segments successfully
- [ ] Listed segments
- [ ] Got single segment details
- [ ] Submitted approval label
- [ ] Verified status changed to "approved"
- [ ] Exported SFT JSONL with approved segments
- [ ] Got manifest with statistics
- [ ] Submitted correction with needs_edit
- [ ] Verified corrected text appears in export
- [ ] All endpoints return 200 status

If all tests pass, the translation backend is working correctly!
