#!/bin/bash
# Test script for Knoxx session resilience
# This script tests the Redis-backed session persistence and recovery

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEVEL_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
KNOXX_BACKEND_URL="${KNOXX_BACKEND_URL:-http://localhost:8000}"

echo "=== Knoxx Session Resilience Test ==="
echo "Backend URL: $KNOXX_BACKEND_URL"
echo ""

# Test 1: Health check
echo "Test 1: Backend health check"
if curl -s -f "$KNOXX_BACKEND_URL/health" > /dev/null; then
  echo "✓ Backend is healthy"
else
  echo "✗ Backend is not responding"
  exit 1
fi
echo ""

# Test 2: Redis connection
echo "Test 2: Check if Redis is configured"
REDIS_STATUS=$(curl -s "$KNOXX_BACKEND_URL/api/knoxx/health" | jq -r '.redis_connected // false')
if [ "$REDIS_STATUS" = "true" ]; then
  echo "✓ Redis is connected"
else
  echo "⚠ Redis is not connected (session persistence disabled)"
fi
echo ""

# Test 3: Session status endpoint
echo "Test 3: Session status endpoint"
TEST_SESSION_ID="test-session-$(date +%s)"
STATUS_RESPONSE=$(curl -s "$KNOXX_BACKEND_URL/api/knoxx/session/status?session_id=$TEST_SESSION_ID")
STATUS=$(echo "$STATUS_RESPONSE" | jq -r '.status')
if [ "$STATUS" = "not_found" ]; then
  echo "✓ Session status endpoint returns not_found for unknown session"
else
  echo "✗ Unexpected status: $STATUS"
  echo "Response: $STATUS_RESPONSE"
fi
echo ""

# Test 4: Start a chat and check session persistence
echo "Test 4: Start chat and verify session persistence"
CHAT_RESPONSE=$(curl -s -X POST "$KNOXX_BACKEND_URL/api/knoxx/chat/start" \
  -H "Content-Type: application/json" \
  -H "x-knoxx-user-email: test@example.com" \
  -H "x-knoxx-org-slug: test-org" \
  -d '{
    "message": "Hello, this is a test message for session persistence",
    "model": "gpt-4"
  }')

SESSION_ID=$(echo "$CHAT_RESPONSE" | jq -r '.session_id // empty')
CONVERSATION_ID=$(echo "$CHAT_RESPONSE" | jq -r '.conversation_id // empty')
RUN_ID=$(echo "$CHAT_RESPONSE" | jq -r '.run_id // empty')

if [ -n "$SESSION_ID" ] && [ -n "$CONVERSATION_ID" ] && [ -n "$RUN_ID" ]; then
  echo "✓ Chat started successfully"
  echo "  Session ID: ${SESSION_ID:0:8}..."
  echo "  Conversation ID: ${CONVERSATION_ID:0:8}..."
  echo "  Run ID: ${RUN_ID:0:8}..."
else
  echo "✗ Failed to start chat"
  echo "Response: $CHAT_RESPONSE"
  exit 1
fi
echo ""

# Test 5: Check session status after creation
if [ -n "$SESSION_ID" ]; then
  echo "Test 5: Check session status immediately after creation"
  sleep 1  # Give Redis a moment to persist
  SESSION_STATUS=$(curl -s "$KNOXX_BACKEND_URL/api/knoxx/session/status?session_id=$SESSION_ID&conversation_id=$CONVERSATION_ID")
  SESSION_STATUS_VALUE=$(echo "$SESSION_STATUS" | jq -r '.status')
  
  if [ "$SESSION_STATUS_VALUE" = "running" ]; then
    echo "✓ Session status is 'running' as expected"
    echo "  Status: $SESSION_STATUS_VALUE"
    echo "  Has active stream: $(echo "$SESSION_STATUS" | jq -r '.has_active_stream')"
    echo "  Can send: $(echo "$SESSION_STATUS" | jq -r '.can_send')"
  else
    echo "⚠ Session status is '$SESSION_STATUS_VALUE' (may have already completed)"
  fi
fi
echo ""

# Test 6: Wait for completion and check final status
if [ -n "$RUN_ID" ]; then
  echo "Test 6: Wait for run completion and check status"
  MAX_WAIT=60
  WAITED=0
  while [ $WAITED -lt $MAX_WAIT ]; do
    RUN_STATUS=$(curl -s "$KNOXX_BACKEND_URL/api/runs/$RUN_ID" | jq -r '.status // "unknown"')
    if [ "$RUN_STATUS" = "completed" ] || [ "$RUN_STATUS" = "failed" ]; then
      echo "✓ Run finished with status: $RUN_STATUS"
      break
    fi
    sleep 2
    WAITED=$((WAITED + 2))
    echo "  Waiting... ($WAITED seconds, status: $RUN_STATUS)"
  done
  
  if [ $WAITED -ge $MAX_WAIT ]; then
    echo "⚠ Run did not complete within $MAX_WAIT seconds"
  fi
fi
echo ""

# Test 7: Check session cleanup
if [ -n "$SESSION_ID" ]; then
  echo "Test 7: Verify session is marked as completed"
  sleep 2  # Give session store a moment to update
  FINAL_STATUS=$(curl -s "$KNOXX_BACKEND_URL/api/knoxx/session/status?session_id=$SESSION_ID&conversation_id=$CONVERSATION_ID")
  FINAL_STATUS_VALUE=$(echo "$FINAL_STATUS" | jq -r '.status')
  
  if [ "$FINAL_STATUS_VALUE" = "completed" ] || [ "$FINAL_STATUS_VALUE" = "failed" ]; then
    echo "✓ Session marked as $FINAL_STATUS_VALUE"
    echo "  Can send: $(echo "$FINAL_STATUS" | jq -r '.can_send')"
  else
    echo "⚠ Session status is '$FINAL_STATUS_VALUE' (may still be in Redis with TTL)"
  fi
fi
echo ""

echo "=== Test Summary ==="
echo "Session resilience tests completed."
echo ""
echo "Next steps:"
echo "1. Test page refresh during active stream"
echo "2. Test backend restart during active session"
echo "3. Monitor Redis keys: redis-cli keys 'knoxx:*'"
echo "4. Check OpenPlanner for archived sessions"
