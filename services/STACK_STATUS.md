# Knoxx/OpenPlanner Stack Status Report

**Generated**: 2026-04-10 22:20 UTC

## Summary

The Knoxx/OpenPlanner system is **OPERATIONAL** with all core services running and healthy.

## Service Status

### 1. Knoxx Backend (Port 8000)
- **Status**: ✅ Healthy
- **Service**: knoxx-backend-cljs
- **Dependencies**:
  - Proxx Proxy: ✅ Configured and reachable
  - OpenPlanner: ✅ Configured and reachable

### 2. OpenPlanner (Port 7777)
- **Status**: ✅ Healthy
- **Storage Backend**: MongoDB
- **Features**:
  - Full-text search (FTS): ✅ Enabled
  - Vector collections: ✅ Operational
    - Hot: `event_chunks`
    - Compact: `compacted_vectors`
  - Graph collections: ✅ Operational
    - Layout: `graph_layout_overrides`
  - Embedding models:
    - Hot: `qwen3-embedding:0.6b`
    - Compact: `qwen3-embedding:4b`
- **Dependencies**:
  - VectorStore: ✅ OK
  - Embeddings: ✅ OK
  - Vexx (NPU acceleration): ✅ OK (Device: NPU)
  - GraphLayout: ✅ OK

### 3. Proxx Proxy (Port 8789)
- **Status**: ✅ Healthy
- **Service**: open-hax-openai-proxy
- **Auth Mode**: Token-based
- **Key Pool Status**:
  - **Primary Provider**: zai (API key)
    - Total keys: 1
    - Available: 1
    - Cooldown: 0
  - **Fallback Providers**:
    - requesty: 1 account (cooldown)
    - rotussy: 1 account (cooldown)

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Knoxx Backend                        │
│                  (Port 8000/CLJS)                       │
└──────────────┬──────────────────┬──────────────────────┘
               │                  │
               ▼                  ▼
      ┌─────────────┐    ┌─────────────────┐
      │ Proxx Proxy │    │  OpenPlanner    │
      │  (8789)     │    │    (7777)       │
      └──────┬──────┘    └────────┬────────┘
             │                    │
             ▼                    ▼
      ┌─────────────┐    ┌─────────────────┐
      │  AI APIs    │    │    MongoDB      │
      │  (zai, etc) │    │   + Mongot      │
      └─────────────┘    │  + Vexx (NPU)   │
                         └─────────────────┘
```

## Build Status

- **OpenPlanner**: ✅ Built successfully (TypeScript compiled to ES2022)
- **Knoxx Backend**: ✅ Running (ClojureScript backend)
- **Configuration files**: ✅ Fixed and validated
  - Fixed malformed `orgs/open-hax/openplanner/package.json`
  - Updated `tsconfig.json` to exclude test files

## Key Files Modified

1. `orgs/open-hax/openplanner/package.json`
   - Fixed JSON syntax error
   - Updated version to 0.3.0
   - Simplified build scripts

2. `orgs/open-hax/openplanner/tsconfig.json`
   - Added exclusion for test files
   - Prevents compilation errors from test imports

## Next Steps (Optional)

If you need to rebuild or restart services:

1. **Rebuild OpenPlanner**:
   ```bash
   cd orgs/open-hax/openplanner
   npm run build
   ```

2. **Restart services** (requires Docker/Podman access from host):
   ```bash
   cd services/knoxx
   docker-compose restart knoxx-backend

   cd ../openplanner
   docker-compose restart openplanner
   ```

3. **View logs**:
   ```bash
   docker-compose logs -f openplanner
   docker-compose logs -f knoxx-backend
   ```

## Environment Variables

Key environment variables are configured in:
- `services/knoxx/.env`
- `services/openplanner/.env`

Critical variables:
- `KNOXX_OPENPLANNER_BASE_URL=http://openplanner:7777`
- `OPENPLANNER_API_KEY=change-me`
- `PROXX_BASE_URL=http://openplanner-proxx:8789`
- `MONGODB_URI=mongodb://openplanner:***@mongodb:27017/openplanner`

## Health Check Commands

```bash
# Check Knoxx
curl http://localhost:8000/health

# Check OpenPlanner
curl http://openplanner:7777/v1/health

# Check Proxx
curl -H "Authorization: Bearer change-me-openplanner-proxx-token" \
  http://openplanner-proxx:8789/health
```

## Conclusion

The Knoxx/OpenPlanner stack is fully operational. All services are healthy and communicating properly. The system is ready for use with:
- RAG (Retrieval Augmented Generation) capabilities via Knoxx
- Vector search and embeddings via OpenPlanner
- AI model proxying via Proxx with fallback providers
- NPU acceleration for embeddings via Vexx
