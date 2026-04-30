#!/usr/bin/env bash
# Validation script for Qwen3-Embedding-0.6B on OVMS NPU
# Tests:
#   1. Container is up and model endpoint responds
#   2. Embedding returned has correct shape (1024 dims for 0.6B)
#   3. OVMS log confirms NPU device was selected (not CPU fallback)
set -euo pipefail

BASE_URL="http://localhost:8000"
MODEL_NAME="OpenVINO/Qwen3-Embedding-0.6B-int8-ov"
EXPECTED_DIMS=1024

echo "=== [1] Health check ==="
curl -sf "${BASE_URL}/v3/models" | python3 -c "
import sys, json
models = json.load(sys.stdin)
names = [m['id'] for m in models.get('data', [])]
print('Models available:', names)
assert any('Qwen3-Embedding-0.6B' in n for n in names), 'Model not found in /v3/models'
print('[PASS] model visible')
"

echo ""
echo "=== [2] Embedding shape ==="
curl -sf "${BASE_URL}/v3/embeddings" \
  -H 'Content-Type: application/json' \
  -d '{"model":"'"${MODEL_NAME}"'","input":"Qwen3 NPU smoke test"}' \
  | python3 -c "
import sys, json
resp = json.load(sys.stdin)
vec = resp['data'][0]['embedding']
dims = len(vec)
print(f'Embedding dims: {dims}')
assert dims == ${EXPECTED_DIMS}, f'Expected ${EXPECTED_DIMS} dims, got {dims}'
print('[PASS] embedding shape correct')
"

echo ""
echo "=== [3] NPU device confirmation ==="
NPU_LOG=$(docker logs qwen3-embedding-06b-npu 2>&1 | grep -i 'NPU' || true)
if echo "${NPU_LOG}" | grep -qi 'NPU'; then
  echo "[PASS] NPU mentioned in logs:"
  echo "${NPU_LOG}" | head -5
else
  echo "[WARN] No NPU log line found — inspect logs manually:"
  echo "  docker logs qwen3-embedding-06b-npu 2>&1 | grep -i device"
  exit 1
fi

echo ""
echo "=== All checks passed ==="
