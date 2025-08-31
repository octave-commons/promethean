
# Promethean Model Server (single-process, per-device executors)

One FastAPI server with a device-aware router and per-device executors (NVIDIA / Intel iGPU / Intel NPU / CPU). 
Includes LRU model cache sized by device memory budgets, health endpoints, and Compose files with host overlays.

## Quick start

### 1) Build the image
```bash
docker build -f images/model-server.docker -t ghcr.io/you/model-server:dev .
```

### 2) Run (prod-like single host)
```bash
docker compose -f infra/compose/base.yaml -f infra/compose/hosts/err-stealth.yaml up -d
```

### 3) Dev (bind mounts, hot reload)
```bash
docker compose -f infra/compose/base.yaml -f infra/compose/dev.yaml -f infra/compose/hosts/err-stealth.yaml up -d
```

### 4) Test endpoints
```bash
curl -fsS http://localhost:8080/healthz | jq
curl -fsS -X POST http://localhost:8080/stt -H 'content-type: application/json' -d '{"wav":"<base64 or path>", "latency_ms": 1200}'
```

## Files

- `app/app.py` — FastAPI app (HTTP layer, routing hooks)
- `app/runtime.py` — runtime initialization (Torch/OpenVINO knobs)
- `app/executors.py` — per-device executors + LRU cache
- `app/models/registry.json` — model registry mapping names → runtimes/quantization (examples)
- `infra/compose/*.yaml` — Compose base + dev + host overlay (err-stealth example)
- `images/model-server.docker` — Dockerfile for the server
- `requirements.txt` — minimal Python deps

## Notes

- **Single process** by default to keep one shared LRU per device. If you increase web workers, you create multiple caches.
- Torch + OpenVINO in one process is supported; we set conservative thread and allocator settings at startup.
- Endpoints currently run **stub workloads**; wire your real loaders/runners in `models/` and `executors.py` where marked.
