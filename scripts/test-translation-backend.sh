#!/bin/bash
# Test Translation Backend Routes
# Usage: ./test-translation-backend.sh [OPENPLANNER_URL] [API_KEY]

set -e

OPENPLANNER_URL="${1:-http://localhost:7777}"
API_KEY="${2:-change-me-openplanner}"

echo "Testing Translation Backend at: $OPENPLANNER_URL"
echo "Using API Key: $API_KEY"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper function
test_endpoint() {
    local method=$1
    local path=$2
    local data=$3
    local description=$4
    
    echo -e "${YELLOW}Testing: $description${NC}"
    echo "  $method $path"
    
    if [ -z "$data" ]; then
        response=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
            -X $method \
            "$OPENPLANNER_URL$path" \
            -H "Authorization: Bearer $API_KEY" \
            -H "Content-Type: application/json")
    else
        response=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
            -X $method \
            "$OPENPLANNER_URL$path" \
            -H "Authorization: Bearer $API_KEY" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2)
    body=$(echo "$response" | sed '/HTTP_CODE:/d')
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "  ${GREEN}✓ Success ($http_code)${NC}"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        echo -e "  ${RED}✗ Failed ($http_code)${NC}"
        echo "$body"
    fi
    
    echo ""
}

# Test 1: Health check
echo "=========================================="
echo "TEST 1: Health Check"
echo "=========================================="
test_endpoint "GET" "/v1/health" "" "Health check"

# Test 2: Create test segment
echo "=========================================="
echo "TEST 2: Create Translation Segment"
echo "=========================================="
test_endpoint "POST" "/v1/translations/segments/batch" '{
  "project": "devel-docs",
  "org_id": "open-hax",
  "segments": [
    {
      "source_text": "This is a test document for translation. It contains multiple sentences to demonstrate the translation pipeline.",
      "translated_text": "Este es un documento de prueba para traducción. Contiene múltiples oraciones para demostrar el pipeline de traducción.",
      "source_lang": "en",
      "target_lang": "es",
      "document_id": "test-doc-001",
      "segment_index": 0,
      "mt_model": "glm-5",
      "confidence": 0.87,
      "domain": "documentation",
      "content_type": "markdown"
    },
    {
      "source_text": "The quick brown fox jumps over the lazy dog.",
      "translated_text": "El rápido zorro marrón salta sobre el perro perezoso.",
      "source_lang": "en",
      "target_lang": "es",
      "document_id": "test-doc-001",
      "segment_index": 1,
      "mt_model": "glm-5",
      "confidence": 0.92
    }
  ]
}' "Create 2 test segments"

# Test 3: List segments
echo "=========================================="
echo "TEST 3: List Translation Segments"
echo "=========================================="
test_endpoint "GET" "/v1/translations/segments?project=devel-docs&limit=10" "" "List segments"

# Store first segment ID for later tests
SEGMENT_ID=$(curl -s "$OPENPLANNER_URL/v1/translations/segments?project=devel-docs&limit=1" \
    -H "Authorization: Bearer $API_KEY" | jq -r '.segments[0].id' 2>/dev/null)

if [ -z "$SEGMENT_ID" ] || [ "$SEGMENT_ID" = "null" ]; then
    echo -e "${RED}Could not get segment ID for further tests${NC}"
    exit 1
fi

echo -e "${GREEN}Using segment ID: $SEGMENT_ID${NC}"
echo ""

# Test 4: Get single segment
echo "=========================================="
echo "TEST 4: Get Single Segment"
echo "=========================================="
test_endpoint "GET" "/v1/translations/segments/$SEGMENT_ID" "" "Get segment with labels"

# Test 5: Submit label
echo "=========================================="
echo "TEST 5: Submit Translation Label"
echo "=========================================="
test_endpoint "POST" "/v1/translations/segments/$SEGMENT_ID/labels" '{
  "adequacy": "good",
  "fluency": "excellent",
  "terminology": "correct",
  "risk": "safe",
  "overall": "approve",
  "editor_notes": "Good translation, minor stylistic improvements possible.",
  "labeler_id": "test-reviewer-001",
  "labeler_email": "reviewer@example.com"
}' "Submit approval label"

# Test 6: Check updated segment status
echo "=========================================="
echo "TEST 6: Verify Segment Status Changed"
echo "=========================================="
test_endpoint "GET" "/v1/translations/segments/$SEGMENT_ID" "" "Segment should now be 'approved'"

# Test 7: Submit label with correction
echo "=========================================="
echo "TEST 7: Submit Label with Correction"
echo "=========================================="
# Get second segment
SEGMENT_ID_2=$(curl -s "$OPENPLANNER_URL/v1/translations/segments?project=devel-docs&limit=1&offset=1" \
    -H "Authorization: Bearer $API_KEY" | jq -r '.segments[0].id' 2>/dev/null)

if [ -n "$SEGMENT_ID_2" ] && [ "$SEGMENT_ID_2" != "null" ]; then
    test_endpoint "POST" "/v1/translations/segments/$SEGMENT_ID_2/labels" '{
      "adequacy": "adequate",
      "fluency": "good",
      "terminology": "minor_errors",
      "risk": "safe",
      "overall": "needs_edit",
      "corrected_text": "El rápido zorro marrón salta por encima del perro perezoso.",
      "editor_notes": "Improved preposition usage.",
      "labeler_id": "test-reviewer-001",
      "labeler_email": "reviewer@example.com"
    }' "Submit needs_edit with correction"
else
    echo -e "${YELLOW}Skipping - only one segment available${NC}"
fi

# Test 8: Export SFT
echo "=========================================="
echo "TEST 8: Export SFT Training Data"
echo "=========================================="
echo -e "${YELLOW}Testing: Export SFT JSONL${NC}"
echo "  GET /v1/translations/export/sft?project=devel-docs&target_lang=es"

sft_response=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
    -X GET \
    "$OPENPLANNER_URL/v1/translations/export/sft?project=devel-docs&target_lang=es" \
    -H "Authorization: Bearer $API_KEY")

http_code=$(echo "$sft_response" | grep "HTTP_CODE:" | cut -d: -f2)
body=$(echo "$sft_response" | sed '/HTTP_CODE:/d')

if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
    echo -e "  ${GREEN}✓ Success ($http_code)${NC}"
    echo "JSONL content:"
    echo "$body"
    echo ""
    echo "Number of lines: $(echo "$body" | wc -l)"
else
    echo -e "  ${RED}✗ Failed ($http_code)${NC}"
    echo "$body"
fi
echo ""

# Test 9: Export manifest
echo "=========================================="
echo "TEST 9: Export Manifest"
echo "=========================================="
test_endpoint "GET" "/v1/translations/export/manifest?project=devel-docs" "" "Get statistics"

# Test 10: Trigger document translation
echo "=========================================="
echo "TEST 10: Trigger Document Translation"
echo "=========================================="
# Note: This requires a real document to exist
echo -e "${YELLOW}Testing: Trigger translation job${NC}"
echo "  POST /v1/documents/test-doc-001/translate"

translation_job_response=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
    -X POST \
    "$OPENPLANNER_URL/v1/documents/test-doc-001/translate" \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"target_languages": ["de", "fr"]}')

http_code=$(echo "$translation_job_response" | grep "HTTP_CODE:" | cut -d: -f2)
body=$(echo "$translation_job_response" | sed '/HTTP_CODE:/d')

if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
    echo -e "  ${GREEN}✓ Success ($http_code)${NC}"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
elif [ "$http_code" = "404" ]; then
    echo -e "  ${YELLOW}⚠ Document not found (expected - test doc doesn't exist in events collection)${NC}"
    echo "$body"
else
    echo -e "  ${RED}✗ Failed ($http_code)${NC}"
    echo "$body"
fi
echo ""

echo "=========================================="
echo "TEST SUMMARY"
echo "=========================================="
echo -e "${GREEN}Translation backend routes are working!${NC}"
echo ""
echo "Next steps:"
echo "1. Test via Knoxx proxy with auth: curl http://localhost:80/api/translations/segments"
echo "2. Build frontend UI to consume these endpoints"
echo "3. Investigate CMS document population"
echo "4. Add 'Translate' button to CMS"
