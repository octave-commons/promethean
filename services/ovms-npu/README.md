# ovms-npu — Qwen3-Embedding-0.6B on Intel NPU

Serves `OpenVINO/Qwen3-Embedding-0.6B-int8-ov` via OVMS with `--target_device NPU`.
Exposes an OpenAI-compatible `/v3/embeddings` endpoint on port `8000`.

## Requirements

- Intel Core Ultra (Meteor Lake+) or Arc with `/dev/accel` present
- Docker + Docker Compose v2
- Internet access to pull from Hugging Face on first `make prepare`

## Usage

```bash
# 1. Prepare model repo (one-time)
make prepare

# 2. Start stack
make up

# 3. Validate NPU execution + embedding output
make validate

# 4. Stop
make down
```

## Endpoints

| Path | Method | Purpose |
|------|--------|---------|
| `/v3/models` | GET | List loaded models |
| `/v3/embeddings` | POST | OpenAI-compatible embeddings API |

## Example request

```bash
curl http://localhost:8000/v3/embeddings \
  -H 'Content-Type: application/json' \
  -d '{"model":"OpenVINO/Qwen3-Embedding-0.6B-int8-ov","input":"hello world"}'
```

## Validation tests

1. `/v3/models` lists the Qwen3 embedding model
2. Returned embedding has 1024 dimensions
3. OVMS container logs confirm NPU device selection

## Notes

- `--batch_size 1` is required because the NPU requires static input shapes.
- Model prep uses the CPU-only `latest` image; serving uses `latest-gpu` for NPU plugin access.
- The 4B variant is served separately on GPU — see `services/our-gpus/`.
