# Knoxx Session Resilience with Redis

## Problem Statement

The current Knoxx session management has several issues:

1. **Frontend state desynchronization**: After page refresh or navigation, the UI thinks it's in a sendable state, but the backend refuses with "must steer" errors
2. **No backend persistence**: Active sessions live only in memory atoms (`agent-sessions*`, `runs*`) and are lost on backend restart
3. **No session recovery**: When the backend restarts, running sessions cannot resume - they just hang or fail
4. **Lost conversation continuity**: Users lose their conversation state and can't resume from where they left off

## Root Causes

### Frontend Issues

The frontend stores session state in `localStorage` (`knoxx_chat_session_state`):
- `isSending` flag
- `conversationId`
- `activeRunId`
- `messages` array

However:
- It doesn't query the backend for the *actual* session status on page load
- The `isRecovering` logic only checks if the run completed, not if it's still running
- No API exists to ask "what is the state of my session?"

### Backend Issues

The backend has:
- In-memory `agent-sessions*` atom for active SDK sessions
- In-memory `runs*` atom for run details
- Redis infrastructure available but **NOT CONNECTED** to Knoxx backend
- No session state persistence or recovery

The Redis client code exists in `session_store.cljs` but:
- `REDIS_URL` is not passed to `knoxx-backend` service in docker-compose.yml
- The session store is initialized in `start!` but never used in `send-agent-turn!`
- No session state is written to Redis during active runs

## Solution Architecture

### Phase 1: Connect Backend to Redis

1. **Update docker-compose.yml**:
   - Add `REDIS_URL: redis://redis:6379` to `knoxx-backend` environment
   - Add `depends_on: redis: condition: service_healthy` to `knoxx-backend`

2. **Verify Redis connection on startup**:
   - Already implemented in `start!` function
   - Ensure proper error handling if Redis is unavailable

### Phase 2: Persist Session State to Redis

**Session State Schema** (already defined in `session_store.cljs`):
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
  :last_token_count 0
  :has_active_stream true | false
  :messages [{:role "user" | "assistant" :content "..."}]
  :pending_tool_calls [{:tool_name "..." :tool_call_id "..." :status "running"}]
}
```

**Integration Points**:

1. **On `send-agent-turn!` start**:
   ```clojure
   (session-store/put-session! redis-client
     {:session_id session-id
      :conversation_id conversation-id
      :run_id run-id
      :status "running"
      :has_active_stream true
      :model model-id
      :mode mode
      :thinking_level thinking-level
      :created_at started-at
      :updated_at started-at})
   ```

2. **On stream events** (token, tool call, etc.):
   ```clojure
   (session-store/update-session! redis-client session-id
     {:updated_at (now-iso)
      :last_token_count (count @chunks)})
   ```

3. **On completion/failure**:
   ```clojure
   (session-store/complete-session! redis-client session-id conversation-id
     {:status "completed" ; or "failed"
      :answer answer
      :error error
      :messages (get-run-messages run-id)})
   ```

### Phase 3: Add Session Status API

**New endpoint**: `GET /api/knoxx/session/:id/status`

Returns:
```json
{
  "session_id": "uuid",
  "conversation_id": "uuid",
  "run_id": "uuid",
  "status": "running" | "completed" | "failed" | "waiting_input",
  "has_active_stream": true | false,
  "can_send": true | false,
  "reason": "Session is actively streaming. Use steer or wait.",
  "model": "model-id",
  "last_updated": "iso-timestamp",
  "message_count": 5
}
```

### Phase 4: Frontend Recovery Logic

**On page load/refresh**:

1. Check localStorage for active session
2. Query `/api/knoxx/session/:id/status`
3. Based on status:
   - `running` + `has_active_stream=true`: Reconnect to WebSocket, show streaming UI
   - `running` + `has_active_stream=false`: Show "waiting for input", enable controls
   - `completed`/`failed`: Show final state, enable new message
   - Not found: Clear localStorage, start fresh

**Implementation**:
```typescript
// In ChatPage.tsx
useEffect(() => {
  const recoverSession = async () => {
    const savedState = localStorage.getItem(CHAT_SESSION_STATE_KEY);
    if (!savedState) return;

    const { sessionId, conversationId, activeRunId, isSending } = JSON.parse(savedState);
    
    if (!isSending || !sessionId) return;

    try {
      const status = await getSessionStatus(sessionId);
      
      if (status.status === "running" && status.has_active_stream) {
        // Reconnect to active stream
        setIsSending(true);
        // WebSocket will automatically reconnect and resume
      } else if (status.status === "running" && !status.has_active_stream) {
        // Agent is waiting for input - enable steer controls
        setIsSending(true);
        setConversationId(status.conversation_id);
        activeRunIdRef.current = status.run_id;
      } else {
        // Session completed/failed while away
        setIsSending(false);
        // Optionally fetch final state from OpenPlanner
      }
    } catch (error) {
      // Session not found in Redis - clear and start fresh
      localStorage.removeItem(CHAT_SESSION_STATE_KEY);
      setIsSending(false);
    }
  };

  recoverSession();
}, []);
```

### Phase 5: Backend Restart Recovery

**On backend startup** (already partially implemented):

```clojure
;; In start! function
(-> (session-store/recover-sessions! redis-client)
    (.then (fn [recovered-sessions]
      (doseq [session recovered-sessions]
        (when (= "running" (:status session))
          ;; Reconnect to SDK session
          (-> (ensure-agent-session! runtime config 
                (:conversation_id session)
                (:model session))
              (.then (fn [sdk-session]
                ;; Mark as waiting for input since stream was interrupted
                (session-store/update-session! redis-client 
                  (:session_id session)
                  {:status "waiting_input"
                   :has_active_stream false}))))
          ;; Broadcast to WebSocket clients that session is waiting
          (broadcast-ws-session! (:session_id session) "events"
            {:type "session_recovered"
             :status "waiting_input"
             :message "Backend restarted. Please continue or steer."}))))))
```

### Phase 6: OpenPlanner Archive Integration

**On session completion**:

```clojure
;; In complete-session!
(-> (archive-session-to-openplanner! config session)
    (.then (fn []
      ;; Keep in Redis briefly for quick resume
      (js/setTimeout
        #(session-store/remove-session! redis-client session-id conversation-id)
        60000)))  ; 1 minute retention
    (.catch (fn [error]
      (.warn js/console "Failed to archive session to OpenPlanner" error)
      ;; Still remove from Redis after TTL expires
      nil)))
```

**Archive function**:
```clojure
(defn archive-session-to-openplanner! [config session]
  (let [events (session->graph-events session)]
    (openplanner-request! config "POST" "/v1/events"
      {:events events})))
```

## Implementation Plan

### Step 1: Infrastructure (5 minutes)
- [ ] Update `services/knoxx/docker-compose.yml` to add `REDIS_URL` to `knoxx-backend`
- [ ] Add `depends_on: redis` with health check
- [ ] Restart `knoxx-backend` service

### Step 2: Session Persistence (30 minutes)
- [ ] Integrate `session-store/put-session!` in `send-agent-turn!` on start
- [ ] Add `session-store/update-session!` calls on streaming events
- [ ] Add `session-store/complete-session!` on run completion/failure
- [ ] Add `session-store/mark-session-streaming!` when stream starts/stops

### Step 3: Status API (20 minutes)
- [ ] Add `GET /api/knoxx/session/:id/status` endpoint
- [ ] Implement `session-can-send?` logic
- [ ] Add tests for status endpoint

### Step 4: Frontend Recovery (40 minutes)
- [ ] Add `getSessionStatus()` API call
- [ ] Implement recovery logic on page load
- [ ] Handle WebSocket reconnection for active streams
- [ ] Update UI state based on session status

### Step 5: Backend Recovery (30 minutes)
- [ ] Enhance `recover-sessions!` to reconnect SDK sessions
- [ ] Broadcast recovery events to WebSocket clients
- [ ] Handle interrupted streams gracefully

### Step 6: Testing (30 minutes)
- [ ] Test page refresh during active stream
- [ ] Test backend restart during active session
- [ ] Test navigation away and back
- [ ] Test session timeout and cleanup
- [ ] Test Redis unavailability graceful degradation

## Session Lifecycle Diagram

```
┌─────────┐    POST /chat/start    ┌──────────────┐
│ Frontend│───────────────────────>│   Backend    │
└─────────┘                        └──────────────┘
     │                                    │
     │                            Create session
     │                            Store in Redis
     │                            Create SDK session
     │                                    │
     │<───── WebSocket stream ───────────┤
     │                                    │
     │                            Update Redis on events
     │                                    │
     ├──── Page refresh ─────────────────┤
     │                                    │
     │    GET /session/:id/status         │
     │────────────────────────────────────>│
     │                                    │
     │<─── {status: "running"} ───────────┤
     │                                    │
     │    Reconnect WebSocket             │
     │────────────────────────────────────>│
     │                                    │
     │<───── Resume stream ───────────────┤
     │                                    │
     │                                    │
     ├──── Backend restart ───────────────┤
     │                                    │
     │                            Recover from Redis
     │                            Reconnect SDK
     │                            Update status
     │                                    │
     │<─── Event: session_recovered ──────┤
     │                                    │
     │                                    │
     ├──── Completion ───────────────────┤
     │                                    │
     │                            Archive to OpenPlanner
     │                            Remove from Redis
     │                                    │
```

## Security Considerations

1. **Session isolation**: Each session is keyed by `session_id`, which is client-generated
   - Consider adding server-side session validation
   - Add `auth-context` to Redis session state for access control

2. **Redis security**: Ensure Redis is only accessible from internal network
   - Already configured in docker-compose with internal network

3. **TTL management**: Active sessions expire after 1 hour
   - Consider making TTL configurable per deployment
   - Warn users before session expires

4. **Graceful degradation**: If Redis is unavailable, fall back to in-memory state
   - Log warning but don't fail requests
   - Sessions won't persist across restarts but will continue to work

## Monitoring & Observability

1. **Metrics to track**:
   - Active sessions count (from Redis `knoxx:active_sessions` set)
   - Session creation rate
   - Session completion rate
   - Session recovery rate (backend restart)
   - Average session duration
   - Redis connection health

2. **Logs to add**:
   - Session lifecycle events (create, update, complete, recover)
   - Redis operation failures
   - Recovery attempts

3. **Alerting**:
   - Redis connection failures
   - High number of abandoned sessions
   - Recovery failures

## Future Enhancements

1. **Session replay**: Store all events for full session replay
2. **Multi-device sync**: Allow same session from multiple devices
3. **Session branching**: Fork a conversation from any point
4. **Collaborative sessions**: Multiple users in same session
5. **Session templates**: Pre-configured session setups

## References

- Redis client implementation: `orgs/open-hax/knoxx/backend/src/cljs/knoxx/backend/redis_client.cljs`
- Session store implementation: `orgs/open-hax/knoxx/backend/src/cljs/knoxx/backend/session_store.cljs`
- Backend core: `orgs/open-hax/knoxx/backend/src/cljs/knoxx/backend/core.cljs`
- Frontend ChatPage: `orgs/open-hax/knoxx/frontend/src/pages/ChatPage.tsx`
- Docker compose: `services/knoxx/docker-compose.yml`
