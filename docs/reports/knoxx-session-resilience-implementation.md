# Knoxx Session Resilience - Implementation Report

## Summary

Successfully implemented Redis-backed session persistence and recovery for Knoxx to solve the session resume issues reported by the user.

## Problem

The user reported that navigating away from the session or refreshing the page caused the UI to think it was in a sendable state, but the backend would refuse with a "must steer" error. Sessions were not resilient to:
- Page refresh/navigation
- Backend restarts
- Network interruptions

## Root Causes Identified

1. **Frontend state desync**: LocalStorage state didn't match backend reality
2. **No backend persistence**: Session state only existed in memory
3. **No session status API**: Frontend couldn't query actual session state
4. **Missing recovery logic**: No way to resume interrupted sessions

## Implementation

### 1. Infrastructure Changes

**File**: `services/knoxx/docker-compose.yml`

Added Redis dependency to knoxx-backend:
```yaml
knoxx-backend:
  depends_on:
    redis:
      condition: service_healthy
```

This ensures the backend waits for Redis to be ready before starting.

### 2. Backend Session Persistence

**File**: `orgs/open-hax/knoxx/backend/src/cljs/knoxx/backend/core.cljs`

#### Session Creation
On `send-agent-turn!` start, session is now persisted to Redis:
```clojure
(session-store/put-session! (redis/get-client)
  {:session_id session-id
   :conversation_id conversation-id
   :run_id run-id
   :status "running"
   :model model-id
   :mode mode
   :thinking_level thinking-level
   :created_at started-at
   :updated_at started-at
   :has_active_stream false
   :messages request-messages})
```

#### Streaming Status
When the first token arrives, session is marked as actively streaming:
```clojure
(session-store/mark-session-streaming! (redis/get-client) session-id true)
```

#### Completion
On run completion or failure, session is marked accordingly:
```clojure
(session-store/complete-session! (redis/get-client)
  session-id conversation-id
  {:status "completed"
   :answer answer
   :messages (conj request-messages {:role "assistant" :content answer})})
```

### 3. Session Status API

**File**: `orgs/open-hax/knoxx/backend/src/cljs/knoxx/backend/core.cljs`

Added new endpoint: `GET /api/knoxx/session/status`

Returns:
```json
{
  "session_id": "uuid",
  "conversation_id": "uuid",
  "status": "running" | "completed" | "failed" | "waiting_input" | "not_found",
  "has_active_stream": true | false,
  "can_send": true | false,
  "reason": "Session is actively streaming. Use steer or wait.",
  "model": "model-id",
  "updated_at": "iso-timestamp"
}
```

This allows the frontend to query the actual session state at any time.

### 4. Frontend Recovery Logic

**File**: `orgs/open-hax/knoxx/frontend/src/lib/api.ts`

Added `getSessionStatus()` API function:
```typescript
export async function getSessionStatus(sessionId: string, conversationId?: string | null): Promise<{
  session_id: string;
  conversation_id?: string | null;
  status: "running" | "completed" | "failed" | "waiting_input" | "not_found";
  has_active_stream: boolean;
  can_send: boolean;
  reason?: string | null;
  model?: string | null;
  updated_at?: string | null;
}>
```

**File**: `orgs/open-hax/knoxx/frontend/src/pages/ChatPage.tsx`

Replaced the simple run recovery logic with comprehensive session status checking:

```typescript
// On page load, check session status from Redis
const status = await getSessionStatus(sessionId, conversationId);

if (status.status === "running" && status.has_active_stream) {
  // Reconnect to active stream
  setIsSending(true);
  // WebSocket auto-reconnects
} else if (status.status === "running" && !status.has_active_stream) {
  // Agent waiting for input - enable controls
  setIsSending(true);
} else if (status.status === "completed" || status.status === "failed") {
  // Session finished while away
  setIsSending(false);
} else if (status.status === "not_found") {
  // Fallback to checking run status
  const run = await getRun(lastRunId);
  // ... handle accordingly
}
```

## Session Lifecycle

### Normal Flow
```
User sends message
  ↓
Backend creates session in Redis (status: "running")
  ↓
First token arrives → mark as streaming
  ↓
Stream completes → mark as completed
  ↓
Archive to OpenPlanner → remove from Redis (after 60s delay)
```

### Page Refresh During Active Stream
```
User refreshes page
  ↓
Frontend loads localStorage state
  ↓
Calls getSessionStatus(sessionId)
  ↓
Backend returns {status: "running", has_active_stream: true}
  ↓
Frontend reconnects WebSocket
  ↓
Stream resumes automatically
```

### Backend Restart During Active Session
```
Backend restarts
  ↓
start! calls recover-sessions! from Redis
  ↓
Reconnects SDK sessions
  ↓
Marks as "waiting_input"
  ↓
Broadcasts session_recovered event
  ↓
Frontend enables steer controls
```

## Redis Data Model

### Session Keys
```
knoxx:session:{session_id}           - Full session state (TTL: 1 hour)
knoxx:conversation_to_session:{conv_id} - Maps conversation to active session
knoxx:active_sessions                - Set of all active session IDs
```

### Session State Schema
```clojure
{
  :session_id "uuid"
  :conversation_id "uuid"
  :run_id "uuid"
  :status "running" | "completed" | "failed" | "waiting_input"
  :model "model-id"
  :mode "rag" | "direct"
  :thinking_level "off" | "low" | "medium" | "high"
  :created_at "iso-timestamp"
  :updated_at "iso-timestamp"
  :has_active_stream true | false
  :messages [{:role "user" | "assistant" :content "..."}]
}
```

## Testing

Created test script: `scripts/test-session-resilience.sh`

Tests:
1. Backend health check
2. Redis connection verification
3. Session status endpoint for unknown session
4. Chat start and session creation
5. Session status immediately after creation
6. Run completion verification
7. Session cleanup verification

### Manual Testing Checklist

- [ ] Page refresh during active stream → reconnects
- [ ] Navigate away and back → resumes correctly
- [ ] Backend restart during active session → recovers with "waiting_input"
- [ ] Session completes while away → shows final state
- [ ] Redis unavailable → falls back gracefully (logs warning)
- [ ] Multiple concurrent sessions → isolated correctly
- [ ] Session timeout after 1 hour → handled gracefully

## Monitoring

### Key Metrics
- `knoxx:active_sessions` size (Redis set)
- Session creation/completion rates
- Recovery success rate
- Redis connection health

### Debug Commands
```bash
# List active sessions
redis-cli smembers knoxx:active_sessions

# Get specific session
redis-cli get "knoxx:session:{session_id}"

# Check conversation mapping
redis-cli get "knoxx:conversation_to_session:{conversation_id}"

# Monitor session creation
redis-cli monitor | grep "knoxx:session"
```

## Security Considerations

1. **Session isolation**: Sessions are keyed by client-generated `session_id`
   - Consider server-side validation in future
   - Auth context stored in Redis for access control

2. **Redis security**: Only accessible from internal Docker network
   - Already configured in docker-compose

3. **TTL management**: 1-hour default, configurable per deployment
   - Sessions auto-expire if not cleaned up

4. **Graceful degradation**: Falls back to in-memory if Redis unavailable
   - Logs warning but doesn't fail requests

## Future Enhancements

1. **Session replay**: Store all events for full replay
2. **Multi-device sync**: Allow same session from multiple devices
3. **Session branching**: Fork conversation from any point
4. **Collaborative sessions**: Multiple users in same session
5. **Session templates**: Pre-configured session setups

## Files Changed

1. `services/knoxx/docker-compose.yml` - Added Redis dependency
2. `orgs/open-hax/knoxx/backend/src/cljs/knoxx/backend/core.cljs` - Integrated session persistence
3. `orgs/open-hax/knoxx/frontend/src/lib/api.ts` - Added getSessionStatus API
4. `orgs/open-hax/knoxx/frontend/src/pages/ChatPage.tsx` - Enhanced recovery logic

## Files Created

1. `docs/plans/knoxx-session-resilience-redis.md` - Implementation plan
2. `scripts/test-session-resilience.sh` - Test script
3. `docs/reports/knoxx-session-resilience-implementation.md` - This report

## Next Steps

1. **Deploy and test**: Deploy to staging environment
2. **Monitor**: Watch Redis metrics and session recovery rates
3. **User testing**: Verify UX improvements with actual users
4. **Performance tuning**: Adjust TTL and cleanup intervals based on usage
5. **Documentation**: Update user-facing docs about session resilience

## References

- Redis client: `orgs/open-hax/knoxx/backend/src/cljs/knoxx/backend/redis_client.cljs`
- Session store: `orgs/open-hax/knoxx/backend/src/cljs/knoxx/backend/session_store.cljs`
- Backend core: `orgs/open-hax/knoxx/backend/src/cljs/knoxx/backend/core.cljs`
- Frontend: `orgs/open-hax/knoxx/frontend/src/pages/ChatPage.tsx`
