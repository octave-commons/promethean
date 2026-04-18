# Quick Reference: Session Resilience Troubleshooting

## Common Issues & Solutions

### Issue: "Session not found" after refresh

**Symptoms**: Frontend can't recover session after page refresh

**Check**:
```bash
# Is Redis running?
docker compose ps redis

# Is backend connected to Redis?
docker compose logs knoxx-backend | grep -i redis
```

**Solution**:
```bash
# Restart backend to reconnect
docker compose restart knoxx-backend

# Verify connection
docker compose logs knoxx-backend | grep "Redis client connected"
```

---

### Issue: Session state stuck in "running"

**Symptoms**: Session shows as running but no active stream

**Check**:
```bash
# List active sessions
docker exec -it knoxx-redis redis-cli smembers knoxx:active_sessions

# Get specific session details
docker exec -it knoxx-redis redis-cli get "knoxx:session:{session_id}"
```

**Solution**:
```bash
# Mark session as waiting_input
docker exec -it knoxx-redis redis-cli \
  set "knoxx:session:{session_id}" \
  '{"status":"waiting_input","has_active_stream":false,...}'

# Or remove stuck session
docker exec -it knoxx-redis redis-cli \
  srem knoxx:active_sessions {session_id}
```

---

### Issue: Too many old sessions in Redis

**Symptoms**: Redis memory usage high, many sessions in active set

**Check**:
```bash
# Count active sessions
docker exec -it knoxx-redis redis-cli scard knoxx:active_sessions

# Check Redis memory
docker exec -it knoxx-redis redis-cli info memory | grep used_memory_human
```

**Solution**:
```bash
# Sessions auto-expire after 1 hour (TTL)
# To manually cleanup old sessions:

# List all sessions
docker exec -it knoxx-redis redis-cli smembers knoxx:active_sessions

# Remove completed/failed sessions
docker exec -it knoxx-redis redis-cli <<EOF
for session_id in $(redis-cli smembers knoxx:active_sessions); do
  status=$(redis-cli get "knoxx:session:$session_id" | jq -r '.status')
  if [ "$status" = "completed" ] || [ "$status" = "failed" ]; then
    redis-cli srem knoxx:active_sessions "$session_id"
    redis-cli del "knoxx:session:$session_id"
  fi
done
EOF
```

---

### Issue: Backend restarted, sessions not recovered

**Symptoms**: Running sessions lost after backend restart

**Check**:
```bash
# Check backend startup logs
docker compose logs knoxx-backend | grep -i "recover.*session"

# Are sessions still in Redis?
docker exec -it knoxx-redis redis-cli smembers knoxx:active_sessions
```

**Solution**:
```bash
# Backend should auto-recover on startup
# Check for errors in recovery logic:
docker compose logs knoxx-backend | grep -A5 "recover-sessions"

# Manual recovery: mark sessions as waiting_input
docker exec -it knoxx-redis redis-cli <<EOF
for session_id in $(redis-cli smembers knoxx:active_sessions); do
  redis-cli set "knoxx:session:$session_id" \
    "$(redis-cli get "knoxx:session:$session_id" | \
       jq '. + {status:"waiting_input",has_active_stream:false}')"
done
EOF
```

---

### Issue: Redis connection refused

**Symptoms**: Backend logs "Redis connection refused"

**Check**:
```bash
# Is Redis container running?
docker compose ps redis

# Can backend reach Redis?
docker compose exec knoxx-backend ping redis

# Check Redis URL config
docker compose exec knoxx-backend env | grep REDIS_URL
```

**Solution**:
```bash
# Start Redis
docker compose up -d redis

# Restart backend
docker compose restart knoxx-backend

# Verify connection
docker compose logs knoxx-backend | grep "Redis client connected"
```

---

## Monitoring Commands

### Check Session Health
```bash
# Active sessions count
docker exec -it knoxx-redis redis-cli scard knoxx:active_sessions

# Sessions by status
docker exec -it knoxx-redis redis-cli <<EOF
for sid in $(redis-cli smembers knoxx:active_sessions); do
  echo "$sid: $(redis-cli get "knoxx:session:$sid" | jq -r '.status')"
done
EOF

# Sessions with active streams
docker exec -it knoxx-redis redis-cli <<EOF
for sid in $(redis-cli smembers knoxx:active_sessions); do
  streaming=$(redis-cli get "knoxx:session:$sid" | jq -r '.has_active_stream')
  if [ "$streaming" = "true" ]; then
    echo "$sid: streaming"
  fi
done
EOF
```

### Monitor in Real-Time
```bash
# Watch all Redis operations
docker exec -it knoxx-redis redis-cli monitor | grep knoxx

# Watch specific session
watch -n 1 'docker exec knoxx-redis redis-cli get "knoxx:session:{session_id}" | jq'

# Monitor WebSocket connections
docker compose logs -f knoxx-backend | grep -i websocket
```

### Performance Metrics
```bash
# Redis memory usage
docker exec -it knoxx-redis redis-cli info memory | grep used_memory_human

# Keys count
docker exec -it knoxx-redis redis-cli dbsize

# Slow log
docker exec -it knoxx-redis redis-cli slowlog get 10
```

---

## Useful Queries

### Find Session by Conversation ID
```bash
docker exec -it knoxx-redis redis-cli get "knoxx:conversation_to_session:{conversation_id}"
```

### Get All Sessions for a Model
```bash
docker exec -it knoxx-redis redis-cli <<EOF
for sid in $(redis-cli smembers knoxx:active_sessions); do
  model=$(redis-cli get "knoxx:session:$sid" | jq -r '.model')
  if [ "$model" = "gpt-4" ]; then
    echo "$sid"
  fi
done
EOF
```

### Find Stuck Sessions (>30 min old, still running)
```bash
docker exec -it knoxx-redis redis-cli <<EOF
now=$(date +%s)
for sid in $(redis-cli smembers knoxx:active_sessions); do
  created=$(redis-cli get "knoxx:session:$sid" | jq -r '.created_at')
  created_ts=$(date -d "$created" +%s 2>/dev/null || echo "0")
  age=$((now - created_ts))
  if [ $age -gt 1800 ]; then
    status=$(redis-cli get "knoxx:session:$sid" | jq -r '.status')
    echo "$sid: ${age}s old, status=$status"
  fi
done
EOF
```

---

## Configuration

### Change Session TTL (default: 3600 seconds = 1 hour)

Edit: `orgs/open-hax/knoxx/backend/src/cljs/knoxx/backend/session_store.cljs`

```clojure
(def SESSION_TTL_SECONDS 7200)  ; 2 hours
```

### Disable Session Persistence (fallback to in-memory)

Edit: `services/knoxx/docker-compose.yml`

```yaml
knoxx-backend:
  environment:
    REDIS_URL: ""  # Empty string disables Redis
```

---

## Logs & Debugging

### Backend Logs
```bash
# All session-related logs
docker compose logs knoxx-backend | grep -i session

# Session lifecycle events
docker compose logs knoxx-backend | grep -E "(put-session|complete-session|recover)"

# Redis errors
docker compose logs knoxx-backend | grep -i "redis.*error"
```

### Frontend Logs (Browser Console)
```javascript
// Enable verbose logging
localStorage.setItem('knoxx_debug', 'true');

// Check saved state
console.log(JSON.parse(localStorage.getItem('knoxx_chat_session_state')));

// Clear stuck state
localStorage.removeItem('knoxx_chat_session_state');
location.reload();
```

---

## Emergency Recovery

### Nuclear Option: Clear All Sessions
```bash
# WARNING: This will interrupt all active sessions!
docker exec -it knoxx-redis redis-cli <<EOF
FLUSHDB
EOF

# Restart backend to clear in-memory state
docker compose restart knoxx-backend
```

### Force Session State
```bash
# Force a session to "waiting_input"
docker exec -it knoxx-redis redis-cli set "knoxx:session:{session_id}" '{
  "session_id": "{session_id}",
  "conversation_id": "{conversation_id}",
  "status": "waiting_input",
  "has_active_stream": false,
  "can_send": true,
  "model": "gpt-4",
  "created_at": "2025-01-01T00:00:00.000Z",
  "updated_at": "2025-01-01T00:01:00.000Z"
}'
```

---

## Health Check Script

```bash
#!/bin/bash
echo "=== Knoxx Session Health Check ==="

# Check Redis
if docker exec knoxx-redis redis-cli ping | grep -q PONG; then
  echo "✓ Redis is responsive"
else
  echo "✗ Redis is not responding"
  exit 1
fi

# Check backend
if curl -s -f http://localhost:8000/health > /dev/null; then
  echo "✓ Backend is healthy"
else
  echo "✗ Backend is not responding"
  exit 1
fi

# Count sessions
ACTIVE=$(docker exec knoxx-redis redis-cli scard knoxx:active_sessions)
echo "Active sessions: $ACTIVE"

# Check for stuck sessions
STUCK=$(docker exec knoxx-redis redis-cli <<EOF | wc -l
for sid in \$(redis-cli smembers knoxx:active_sessions); do
  status=\$(redis-cli get "knoxx:session:\$sid" | jq -r '.status')
  if [ "\$status" = "completed" ] || [ "\$status" = "failed" ]; then
    echo "\$sid"
  fi
done
EOF
)

if [ "$STUCK" -gt 0 ]; then
  echo "⚠ Found $STUCK completed/failed sessions in active set"
else
  echo "✓ No stuck sessions"
fi

echo "=== Health check complete ==="
```

Save as `/usr/local/bin/knoxx-health` and run with `knoxx-health`
