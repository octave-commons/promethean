#!/usr/bin/env bash
set -eu

BASE="${DEV_PROXY_URL:-http://127.0.0.1:8795}"
AUTH_TOKEN="${DEV_PROXY_AUTH_TOKEN:-}"

if [[ -z "$AUTH_TOKEN" ]]; then
  echo "DEV_PROXY_AUTH_TOKEN is required" >&2
  exit 1
fi

PASS=0
FAIL=0
RESTORE_SETTINGS_JSON=''

green()  { printf "\033[32m%s\033[0m\n" "$*"; }
red()    { printf "\033[31m%s\033[0m\n" "$*"; }
bold()   { printf "\033[1m%s\033[0m\n" "$*"; }

pass() { PASS=$((PASS + 1)); green "  PASS: $1"; }
fail() { FAIL=$((FAIL + 1)); red   "  FAIL: $1 — $2"; }

admin_json() {
  curl -sf --max-time 30 \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${AUTH_TOKEN}" \
    "$@"
}

tenant_json() {
  local token="$1"
  shift
  curl -sf --max-time 30 \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${token}" \
    "$@"
}

json_field() {
  local field="$1"
  python3 -c '
import json, sys
payload = json.load(sys.stdin)
value = payload
for key in sys.argv[1].split("."):
    if isinstance(value, list):
        value = value[int(key)]
    else:
        value = value[key]
if isinstance(value, (dict, list)):
    print(json.dumps(value))
else:
    print(value)
' "$field"
}

restore_settings() {
  if [[ -n "$RESTORE_SETTINGS_JSON" ]]; then
    admin_json -X POST "${BASE}/api/ui/settings" -d "$RESTORE_SETTINGS_JSON" >/dev/null || true
  fi
}

trap restore_settings EXIT

bold "=== Multitenancy smoke against ${BASE} ==="

if curl -sf --max-time 10 "${BASE}/health" >/dev/null; then
  pass "GET /health"
else
  fail "GET /health" "unreachable"
  exit 1
fi

CURRENT_SETTINGS=$(admin_json "${BASE}/api/ui/settings") || CURRENT_SETTINGS=''
if [[ -z "$CURRENT_SETTINGS" ]]; then
  fail "GET /api/ui/settings" "no response"
  exit 1
fi
pass "GET /api/ui/settings"
RESTORE_SETTINGS_JSON=$(printf '%s' "$CURRENT_SETTINGS" | python3 -c '
import json, sys
payload = json.load(sys.stdin)
print(json.dumps({
  "fastMode": payload.get("fastMode", False),
  "requestsPerMinute": payload.get("requestsPerMinute"),
  "allowedProviderIds": payload.get("allowedProviderIds"),
  "disabledProviderIds": payload.get("disabledProviderIds"),
}))
')

UPDATED_SETTINGS=$(admin_json -X POST "${BASE}/api/ui/settings" -d '{"allowedProviderIds":["openai"]}') || UPDATED_SETTINGS=''
if [[ -n "$UPDATED_SETTINGS" && "$(printf '%s' "$UPDATED_SETTINGS" | json_field 'allowedProviderIds.0' 2>/dev/null || true)" == "openai" ]]; then
  pass "tenant provider allowlist persisted"
else
  fail "tenant provider allowlist persisted" "unexpected response"
fi

BLOCKED_RESPONSE=$(curl -sS -w '\nHTTP_STATUS:%{http_code}' --max-time 30 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -X POST "${BASE}/v1/chat/completions" \
  -d '{"model":"factory/gpt-5.3-codex","messages":[{"role":"user","content":"blocked"}],"stream":false}' || true)
BLOCKED_STATUS="${BLOCKED_RESPONSE##*$'\n'HTTP_STATUS:}"
BLOCKED_BODY="${BLOCKED_RESPONSE%$'\n'HTTP_STATUS:*}"
printf '%s' "$BLOCKED_BODY" >/tmp/proxx-multitenancy-blocked.out
BLOCKED_CODE=$(python3 - <<'PY'
import json
from pathlib import Path
try:
    payload = json.loads(Path('/tmp/proxx-multitenancy-blocked.out').read_text())
    print(payload.get('error', {}).get('code', ''))
except Exception:
    print('')
PY
)
if [[ "$BLOCKED_STATUS" == "403" && "$BLOCKED_CODE" == "provider_not_allowed" ]]; then
  pass "factory provider blocked by tenant allowlist"
else
  fail "factory provider blocked by tenant allowlist" "status=${BLOCKED_STATUS} code=${BLOCKED_CODE}"
fi

CREATED_KEY=$(admin_json -X POST "${BASE}/api/ui/tenants/default/api-keys" -d '{"label":"live-smoke-key","scopes":["proxy:use"]}') || CREATED_KEY=''
if [[ -z "$CREATED_KEY" ]]; then
  fail "tenant key create" "no response"
  exit 1
fi
KEY_ID=$(printf '%s' "$CREATED_KEY" | json_field 'id' 2>/dev/null || true)
KEY_TOKEN=$(printf '%s' "$CREATED_KEY" | json_field 'token' 2>/dev/null || true)
if [[ -z "$KEY_ID" || -z "$KEY_TOKEN" ]]; then
  fail "tenant key create" "missing id/token"
  exit 1
fi
pass "tenant key create"

TENANT_RESPONSE=$(curl -sS -w '\nHTTP_STATUS:%{http_code}' --max-time 30 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${KEY_TOKEN}" \
  -X POST "${BASE}/v1/chat/completions" \
  -d '{"model":"factory/gpt-5.3-codex","messages":[{"role":"user","content":"touch last_used_at"}],"stream":false}' || true)
TENANT_STATUS="${TENANT_RESPONSE##*$'\n'HTTP_STATUS:}"
TENANT_BODY="${TENANT_RESPONSE%$'\n'HTTP_STATUS:*}"
printf '%s' "$TENANT_BODY" >/tmp/proxx-multitenancy-tenant-key.out
if [[ "$TENANT_STATUS" != "401" ]]; then
  pass "tenant key accepted on /v1/chat/completions (status ${TENANT_STATUS})"
else
  fail "tenant key accepted on /v1/chat/completions" "status=${TENANT_STATUS}"
fi

KEYS_AFTER=$(admin_json "${BASE}/api/ui/tenants/default/api-keys") || KEYS_AFTER=''
LAST_USED=$(printf '%s' "$KEYS_AFTER" | python3 -c '
import json, sys
payload = json.load(sys.stdin)
target = sys.argv[1]
for item in payload.get("keys", []):
    if item.get("id") == target:
        print(item.get("lastUsedAt") or "")
        break
' "$KEY_ID" 2>/dev/null || true)
if [[ -n "$LAST_USED" ]]; then
  pass "tenant key lastUsedAt updated"
else
  fail "tenant key lastUsedAt updated" "empty value"
fi

DELETE_RESPONSE=$(curl -sS -w '\nHTTP_STATUS:%{http_code}' --max-time 30 -H "Authorization: Bearer ${AUTH_TOKEN}" -X DELETE "${BASE}/api/ui/tenants/default/api-keys/${KEY_ID}" || true)
DELETE_STATUS="${DELETE_RESPONSE##*$'\n'HTTP_STATUS:}"
if [[ "$DELETE_STATUS" == "200" ]]; then
  pass "tenant key cleanup"
else
  fail "tenant key cleanup" "status=${DELETE_STATUS}"
fi

admin_json -X POST "${BASE}/api/ui/settings" -d "$RESTORE_SETTINGS_JSON" >/dev/null
pass "tenant settings restored"
RESTORE_SETTINGS_JSON=''

echo
bold "PASS: $PASS  FAIL: $FAIL"
if [[ "$FAIL" -gt 0 ]]; then
  exit 1
fi
