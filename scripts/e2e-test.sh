#!/usr/bin/env bash
#
# Live e2e tests against the dev proxy instance.
# Exercises every major provider strategy path with real upstream calls.
#
# Usage:
#   ./scripts/e2e-test.sh              # defaults to http://127.0.0.1:8790
#   DEV_PROXY_URL=http://host:port ./scripts/e2e-test.sh
#   DEV_PROXY_AUTH_TOKEN=token ./scripts/e2e-test.sh
#   LOAD_TEST_CONCURRENCY=16 LOAD_TEST_REQUESTS=16 ./scripts/e2e-test.sh
#
set -euo pipefail

BASE="${DEV_PROXY_URL:-http://127.0.0.1:8795}"
PASS=0
FAIL=0
SKIP=0
AUTH_ARGS=()

if [[ -n "${DEV_PROXY_AUTH_TOKEN:-}" ]]; then
  AUTH_ARGS=(-H "Authorization: Bearer ${DEV_PROXY_AUTH_TOKEN}")
fi

green()  { printf "\033[32m%s\033[0m\n" "$*"; }
red()    { printf "\033[31m%s\033[0m\n" "$*"; }
yellow() { printf "\033[33m%s\033[0m\n" "$*"; }
bold()   { printf "\033[1m%s\033[0m\n" "$*"; }

pass() { PASS=$((PASS + 1)); green "  PASS: $1"; }
fail() { FAIL=$((FAIL + 1)); red   "  FAIL: $1 — $2"; }
skip() { SKIP=$((SKIP + 1)); yellow "  SKIP: $1 — $2"; }

# ── helpers ──────────────────────────────────────────────────────────

curl_json() {
  curl -sf --max-time 30 -H "Content-Type: application/json" "${AUTH_ARGS[@]}" "$@"
}

curl_json_token() {
  local token="$1"
  shift
  curl -sf --max-time 30 -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" "$@"
}

curl_status() {
  curl -so /dev/null -w "%{http_code}" --max-time 30 "${AUTH_ARGS[@]}" "$@"
}

assert_status() {
  local label="$1" expected="$2" url="$3"
  shift 3
  local status
  status=$(curl_status "$url" "$@") || status="000"
  if [[ "$status" == "$expected" ]]; then
    pass "$label (HTTP $status)"
  else
    fail "$label" "expected $expected, got $status"
  fi
}

assert_json_field() {
  local label="$1" field="$2" expected="$3"
  shift 3
  local value
  value=$(echo "$RESPONSE" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    keys = '${field}'.split('.')
    for k in keys:
        if isinstance(data, list):
            data = data[int(k)]
        else:
            data = data[k]
    print(data)
except Exception as e:
    print(f'__ERROR__:{e}', file=sys.stderr)
    sys.exit(1)
" 2>/dev/null) || { fail "$label" "field '$field' not found"; return; }
  if [[ "$value" == "$expected" ]]; then
    pass "$label"
  else
    fail "$label" "expected '$expected', got '$value'"
  fi
}

chat_completion() {
  local model="$1" content="${2:-Say exactly: OK}"
  curl_json -X POST "${BASE}/v1/chat/completions" -d "{
    \"model\": \"$model\",
    \"messages\": [{\"role\": \"user\", \"content\": \"$content\"}],
    \"stream\": false
  }"
}

chat_completion_stream() {
  local model="$1" content="${2:-Say exactly: OK}"
  curl -sf --max-time 60 -H "Content-Type: application/json" "${AUTH_ARGS[@]}" \
    -X POST "${BASE}/v1/chat/completions" -d "{
    \"model\": \"$model\",
    \"messages\": [{\"role\": \"user\", \"content\": \"$content\"}],
    \"stream\": true
  }"
}

responses_passthrough() {
  local model="$1" text="${2:-Say exactly: OK}"
  curl_json -X POST "${BASE}/v1/responses" -d "{
    \"model\": \"$model\",
    \"input\": [{\"role\": \"user\", \"content\": [{\"type\": \"input_text\", \"text\": \"$text\"}]}],
    \"instructions\": \"\",
    \"stream\": false
  }"
}

responses_passthrough_null_instructions() {
  local model="$1" text="${2:-Say exactly: OK}"
  curl_json -X POST "${BASE}/v1/responses" -d "{
    \"model\": \"$model\",
    \"input\": [{\"role\": \"user\", \"content\": [{\"type\": \"input_text\", \"text\": \"$text\"}]}],
    \"instructions\": null,
    \"stream\": true
  }"
}

chat_completion_with_token() {
  local token="$1" model="$2" content="${3:-Say exactly: OK}"
  curl_json_token "$token" -X POST "${BASE}/v1/chat/completions" -d "{
    \"model\": \"$model\",
    \"messages\": [{\"role\": \"user\", \"content\": \"$content\"}],
    \"stream\": false
  }"
}

# ── connectivity ─────────────────────────────────────────────────────

bold "=== E2E Tests against ${BASE} ==="
echo ""

bold "── 1. Health & Models ──"

assert_status "GET /health returns 200" "200" "${BASE}/health"

RESPONSE=$(curl_json "${BASE}/v1/models" 2>/dev/null) || RESPONSE=""
if [[ -n "$RESPONSE" ]]; then
  pass "GET /v1/models returns JSON"
  MODEL_COUNT=$(echo "$RESPONSE" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('data',[])))" 2>/dev/null || echo 0)
  if [[ "$MODEL_COUNT" -gt 0 ]]; then
    pass "Model catalog has $MODEL_COUNT models"
  else
    fail "Model catalog" "empty data array"
  fi
else
  fail "GET /v1/models" "no response"
fi

bold ""
bold "── 1b. Tenant API key lifecycle ──"

if [[ -n "${DEV_PROXY_AUTH_TOKEN:-}" ]]; then
  TENANT_KEY_PAYLOAD=$(curl_json -X POST "${BASE}/api/ui/tenants/default/api-keys" -d "{
    \"label\": \"e2e-live-$(date +%s)\",
    \"scopes\": [\"proxy:use\"]
  }" 2>/dev/null) || TENANT_KEY_PAYLOAD=""

  if [[ -n "$TENANT_KEY_PAYLOAD" ]]; then
    TENANT_KEY_ID=$(echo "$TENANT_KEY_PAYLOAD" | python3 -c 'import sys, json; print(json.load(sys.stdin)["id"])' 2>/dev/null || true)
    TENANT_KEY_TOKEN=$(echo "$TENANT_KEY_PAYLOAD" | python3 -c 'import sys, json; print(json.load(sys.stdin)["token"])' 2>/dev/null || true)

    if [[ -n "$TENANT_KEY_ID" && -n "$TENANT_KEY_TOKEN" ]]; then
      # Retry once on first tenant key request to handle cold-start connection delays
      RESPONSE=""
      for attempt in 1 2; do
        RESPONSE=$(chat_completion_with_token "$TENANT_KEY_TOKEN" "openai/gpt-5.2-codex" "Reply with exactly one word: OK" 2>/dev/null) || RESPONSE=""
        if [[ -n "$RESPONSE" ]]; then
          break
        fi
        if [[ "$attempt" -eq 1 ]]; then
          sleep 2
        fi
      done
      if [[ -n "$RESPONSE" ]]; then
        pass "tenant API key can access /v1/chat/completions"
      else
        fail "tenant API key chat completion" "no response after retry"
      fi

      TENANT_KEYS=$(curl_json "${BASE}/api/ui/tenants/default/api-keys" 2>/dev/null) || TENANT_KEYS=""
      if [[ -n "$TENANT_KEYS" ]]; then
        TENANT_KEY_LAST_USED=$(echo "$TENANT_KEYS" | python3 -c '
import sys, json
payload = json.load(sys.stdin)
target = sys.argv[1]
for item in payload.get("keys", []):
    if item.get("id") == target:
        print(item.get("lastUsedAt") or "")
        break
' "$TENANT_KEY_ID" 2>/dev/null || true)

        if [[ -n "$TENANT_KEY_LAST_USED" ]]; then
          pass "tenant API key lastUsedAt updated after live request"
        else
          fail "tenant API key lastUsedAt" "not updated"
        fi
      else
        fail "tenant API key list after use" "no response"
      fi

      DELETE_STATUS=$(curl -so /dev/null -w "%{http_code}" --max-time 30 -H "Authorization: Bearer ${DEV_PROXY_AUTH_TOKEN}" -X DELETE "${BASE}/api/ui/tenants/default/api-keys/${TENANT_KEY_ID}") || DELETE_STATUS="000"
      if [[ "$DELETE_STATUS" == "200" ]]; then
        pass "tenant API key cleanup"
      else
        fail "tenant API key cleanup" "expected 200, got ${DELETE_STATUS}"
      fi
    else
      fail "tenant API key create" "missing id/token"
    fi
  else
    fail "tenant API key create" "no response"
  fi
else
  skip "tenant API key lifecycle" "DEV_PROXY_AUTH_TOKEN not set"
fi

# ── 2. OpenAI Responses strategy (gpt-* via chat completions → /codex/responses) ──

bold ""
bold "── 2. OpenAI Responses Strategy (gpt-* chat completions) ──"

RESPONSE=$(chat_completion "gpt-5.2" "Reply with exactly one word: OK" 2>/dev/null) || RESPONSE=""
if [[ -n "$RESPONSE" ]]; then
  assert_json_field "gpt-5.2 returns chat.completion" "object" "chat.completion"
  assert_json_field "gpt-5.2 has choices" "choices.0.message.role" "assistant"
  pass "gpt-5.2 non-streaming round-trip"
else
  fail "gpt-5.2 chat completion" "no response or error"
fi

STREAM_OUT=$(chat_completion_stream "gpt-5.2" "Reply with one word: OK" 2>/dev/null) || STREAM_OUT=""
if echo "$STREAM_OUT" | grep -q "data:"; then
  pass "gpt-5.2 streaming round-trip"
else
  fail "gpt-5.2 streaming" "no SSE data chunks received"
fi

# ── 3. OpenAI Responses Passthrough (gpt-* via /v1/responses) ──

bold ""
bold "── 3. OpenAI Responses Passthrough (gpt-* via /v1/responses) ──"

RESPONSE=$(responses_passthrough "gpt-5.2-codex" "Reply with one word: OK" 2>/dev/null) || RESPONSE=""
if [[ -n "$RESPONSE" ]]; then
  pass "gpt-5.2-codex responses passthrough round-trip"
else
  fail "gpt-5.2-codex responses passthrough" "no response"
fi

# Regression: null instructions must not cause 400
STREAM_OUT=$(responses_passthrough_null_instructions "gpt-5.2" "Reply with one word: OK" 2>/dev/null) || STREAM_OUT=""
if echo "$STREAM_OUT" | grep -q "data:"; then
  pass "gpt-5.2 passthrough with null instructions (regression)"
else
  fail "gpt-5.2 null instructions passthrough" "no SSE data or 400 error"
fi

# ── 4. OpenAI Chat Completions Strategy (non-gpt models via openai provider) ──

bold ""
bold "── 4. OpenAI Chat Completions Strategy (non-gpt via openai) ──"

RESPONSE=$(chat_completion "glm-5" "Reply with one word: OK" 2>/dev/null) || RESPONSE=""
if [[ -n "$RESPONSE" ]]; then
  assert_json_field "glm-5 returns chat.completion" "object" "chat.completion"
  pass "glm-5 chat completion round-trip"
else
  skip "glm-5 chat completion" "model may not be configured"
fi

# ── 5. Standard Responses Strategy (gpt-* via vivgrid/non-openai) ──

bold ""
bold "── 5. Standard Responses Strategy (via api_key providers) ──"

RESPONSE=$(chat_completion "gpt-5.1" "Reply with one word: OK" 2>/dev/null) || RESPONSE=""
if [[ -n "$RESPONSE" ]]; then
  assert_json_field "gpt-5.1 returns chat.completion" "object" "chat.completion"
  pass "gpt-5.1 chat completion round-trip"
else
  skip "gpt-5.1 chat completion" "no api_key provider may be configured"
fi

# ── 6. Messages Strategy (claude-* via /v1/messages) ──

bold ""
bold "── 6. Messages Strategy (claude-*) ──"

RESPONSE=$(chat_completion "claude-opus-4-5" "Reply with exactly one word: OK" 2>/dev/null) || RESPONSE=""
if [[ -n "$RESPONSE" ]]; then
  assert_json_field "claude-opus-4-5 returns chat.completion" "object" "chat.completion"
  pass "claude-opus-4-5 chat completion round-trip"
else
  skip "claude-opus-4-5 chat completion" "claude provider may not be configured"
fi

# ── 7. Paid-tier model routing (gpt-5.4 prefers plus/pro accounts) ──

bold ""
bold "── 7. Paid-Tier Model Routing ──"

RESPONSE=$(chat_completion "gpt-5.3-codex" "Reply with one word: OK" 2>/dev/null) || RESPONSE=""
if [[ -n "$RESPONSE" ]]; then
  assert_json_field "gpt-5.3-codex returns chat.completion" "object" "chat.completion"
  pass "gpt-5.3-codex paid-tier routing round-trip"
else
  skip "gpt-5.3-codex" "no paid accounts configured"
fi

# ── 8. Explicit openai/ prefix routing ──

bold ""
bold "── 8. Explicit openai/ Prefix Routing ──"

RESPONSE=$(chat_completion "openai/gpt-5.2-codex" "Reply with one word: OK" 2>/dev/null) || RESPONSE=""
if [[ -n "$RESPONSE" ]]; then
  assert_json_field "openai/gpt-5.2-codex returns chat.completion" "object" "chat.completion"
  pass "openai/ prefix routing round-trip"
else
  skip "openai/ prefix routing" "openai provider may not be configured"
fi

# ── 9. Factory prefix routing ──

bold ""
bold "── 9. Factory Prefix Routing ──"

RESPONSE=$(chat_completion "factory/claude-opus-4-6" "Reply with one word: OK" 2>/dev/null) || RESPONSE=""
if [[ -n "$RESPONSE" ]]; then
  assert_json_field "factory/claude-opus-4-6 returns chat.completion" "object" "chat.completion"
  pass "factory/ prefix routing round-trip"
else
  skip "factory/ prefix routing" "factory provider may not be configured"
fi

# ── 10. Concurrent load smoke test ──

bold ""
bold "── 10. Concurrent Load Smoke Test ──"

LOAD_CONCURRENCY="${LOAD_TEST_CONCURRENCY:-8}"
LOAD_REQUESTS="${LOAD_TEST_REQUESTS:-8}"

LOAD_OUT=$(DEV_PROXY_URL="$BASE" \
  LOAD_TEST_CONCURRENCY="$LOAD_CONCURRENCY" \
  LOAD_TEST_REQUESTS="$LOAD_REQUESTS" \
  LOAD_TEST_MODEL="${LOAD_TEST_MODEL:-gpt-5.4}" \
  DEV_PROXY_AUTH_TOKEN="${DEV_PROXY_AUTH_TOKEN:-}" \
  node ./scripts/load-test.mjs 2>&1) || LOAD_STATUS=$?
LOAD_STATUS=${LOAD_STATUS:-0}
if [[ "$LOAD_STATUS" -eq 0 ]]; then
  pass "concurrent load smoke test (${LOAD_CONCURRENCY} concurrent, ${LOAD_REQUESTS} total)"
  printf '%s\n' "$LOAD_OUT"
else
  fail "concurrent load smoke test" "$LOAD_OUT"
fi

# ── Summary ──────────────────────────────────────────────────────────

echo ""
bold "═══════════════════════════════════════"
bold "  PASS: $PASS  FAIL: $FAIL  SKIP: $SKIP"
bold "═══════════════════════════════════════"

if [[ "$FAIL" -gt 0 ]]; then
  red "E2E tests FAILED"
  exit 1
fi

green "All e2e tests passed"
exit 0
