# BuildFix Model Benchmark Report

Generated: 2025-10-11T23:58:14.504Z

## Summary

| Model | Success Rate | Avg Duration | Errors Fixed |
|-------|--------------|--------------|--------------|
| qwen3:8b | 33.3% | 9243ms | 2 |
| qwen3:14b | 33.3% | 20492ms | 3 |
| promethean-planner | 33.3% | 12879ms | 2 |
| qwen3:4b | 33.3% | 8798ms | 2 |
| llama3:8b | 33.3% | 9356ms | 2 |
| qwen2.5-coder:7b | 0.0% | 8856ms | 2 |

## Detailed Results

| Fixture | Model | Success | Before→After | Plan | Duration | Attempts |
|---------|-------|---------|--------------|------|----------|----------|
| missing-export | qwen3:8b | ✅ | 1→0 | ✅ | 8607ms | 1 |
| missing-export | qwen3:14b | ✅ | 1→0 | ✅ | 23960ms | 1 |
| missing-export | qwen2.5-coder:7b | ❌ | 1→0 | ❌ | 8218ms | 1 |
| missing-export | promethean-planner | ✅ | 1→0 | ✅ | 15587ms | 1 |
| missing-export | qwen3:4b | ✅ | 1→0 | ✅ | 8588ms | 1 |
| missing-export | llama3:8b | ✅ | 1→0 | ✅ | 10817ms | 1 |
| optional-parameter | qwen3:8b | ❌ | 1→1 | ✅ | 17573ms | 3 |
| optional-parameter | qwen3:14b | ❌ | 1→0 | ❌ | 18798ms | 1 |
| optional-parameter | qwen2.5-coder:7b | ❌ | 1→1 | ✅ | 20757ms | 3 |
| optional-parameter | promethean-planner | ❌ | 1→1 | ✅ | 20961ms | 3 |
| optional-parameter | qwen3:4b | ❌ | 1→1 | ✅ | 16506ms | 3 |
| optional-parameter | llama3:8b | ❌ | 1→1 | ✅ | 18631ms | 3 |
| type-annotation-missing | qwen3:8b | ❌ | 1→1 | ✅ | 18295ms | 3 |
| type-annotation-missing | qwen3:14b | ❌ | 1→1 | ✅ | 52703ms | 3 |
| type-annotation-missing | qwen2.5-coder:7b | ❌ | 1→1 | ✅ | 14710ms | 2 |
| type-annotation-missing | promethean-planner | ❌ | 1→1 | ✅ | 25652ms | 3 |
| type-annotation-missing | qwen3:4b | ❌ | 1→1 | ✅ | 17911ms | 3 |
| type-annotation-missing | llama3:8b | ❌ | 1→1 | ✅ | 15796ms | 3 |
| missing-return-type | qwen3:8b | ❌ | 0→0 | ❌ | 1510ms | 0 |
| missing-return-type | qwen3:14b | ❌ | 0→0 | ❌ | 1450ms | 0 |
| missing-return-type | qwen2.5-coder:7b | ❌ | 0→0 | ❌ | 1433ms | 0 |
| missing-return-type | promethean-planner | ❌ | 0→0 | ❌ | 1547ms | 0 |
| missing-return-type | qwen3:4b | ❌ | 0→0 | ❌ | 1470ms | 0 |
| missing-return-type | llama3:8b | ❌ | 0→0 | ❌ | 1483ms | 0 |
| class-not-exported | qwen3:8b | ✅ | 1→0 | ✅ | 8069ms | 1 |
| class-not-exported | qwen3:14b | ✅ | 1→0 | ✅ | 24698ms | 1 |
| class-not-exported | qwen2.5-coder:7b | ❌ | 1→0 | ❌ | 6636ms | 1 |
| class-not-exported | promethean-planner | ✅ | 1→0 | ✅ | 12215ms | 1 |
| class-not-exported | qwen3:4b | ✅ | 1→0 | ✅ | 6945ms | 1 |
| class-not-exported | llama3:8b | ✅ | 1→0 | ✅ | 8052ms | 1 |
| interface-missing | qwen3:8b | ❌ | 0→0 | ❌ | 1404ms | 0 |
| interface-missing | qwen3:14b | ❌ | 0→0 | ❌ | 1345ms | 0 |
| interface-missing | qwen2.5-coder:7b | ❌ | 0→0 | ❌ | 1379ms | 0 |
| interface-missing | promethean-planner | ❌ | 0→0 | ❌ | 1311ms | 0 |
| interface-missing | qwen3:4b | ❌ | 0→0 | ❌ | 1370ms | 0 |
| interface-missing | llama3:8b | ❌ | 0→0 | ❌ | 1359ms | 0 |

## Failure Analysis

### qwen2.5-coder:7b

- **missing-export**: Unterminated string in JSON at position 214
- **optional-parameter**: Unknown error
- **type-annotation-missing**: plan has neither snippet_b64 nor dsl
- **missing-return-type**: No errors found in fixture
- **class-not-exported**: Unterminated string in JSON at position 202
- **interface-missing**: No errors found in fixture

### qwen3:8b

- **optional-parameter**: Unknown error
- **type-annotation-missing**: Unknown error
- **missing-return-type**: No errors found in fixture
- **interface-missing**: No errors found in fixture

### qwen3:14b

- **optional-parameter**: ollama generate 500: {"error":"model runner has unexpectedly stopped, this may be due to resource limitations or an internal error, check ollama server logs for details"}
- **type-annotation-missing**: Unknown error
- **missing-return-type**: No errors found in fixture
- **interface-missing**: No errors found in fixture

### promethean-planner

- **optional-parameter**: Unknown error
- **type-annotation-missing**: Unknown error
- **missing-return-type**: No errors found in fixture
- **interface-missing**: No errors found in fixture

### qwen3:4b

- **optional-parameter**: Unknown error
- **type-annotation-missing**: Unknown error
- **missing-return-type**: No errors found in fixture
- **interface-missing**: No errors found in fixture

### llama3:8b

- **optional-parameter**: Unknown error
- **type-annotation-missing**: Unknown error
- **missing-return-type**: No errors found in fixture
- **interface-missing**: No errors found in fixture
