# BuildFix Model Benchmark Report

Generated: 2025-10-11T22:31:12.172Z

## Summary

| Model | Success Rate | Avg Duration | Errors Fixed |
|-------|--------------|--------------|--------------|
| gpt-oss:20b-cloud | 66.7% | 4414ms | 3 |
| qwen3:8b | 0.0% | 4260ms | 0 |
| qwen3:14b | 0.0% | 3599ms | 1 |
| qwen3-coder:7b | 0.0% | 2508ms | 1 |
| promethean-planner | 0.0% | 5300ms | 0 |
| qwen3:4b | 0.0% | 3941ms | 0 |

## Detailed Results

| Fixture | Model | Success | Before→After | Plan | Duration | Attempts |
|---------|-------|---------|--------------|------|----------|----------|
| missing-export | gpt-oss:20b-cloud | ✅ | 1→0 | ✅ | 5248ms | 1 |
| missing-export | qwen3:8b | ❌ | 0→0 | ❌ | 1536ms | 0 |
| missing-export | qwen3:14b | ❌ | 0→0 | ❌ | 1560ms | 0 |
| missing-export | qwen3-coder:7b | ❌ | 0→0 | ❌ | 1519ms | 0 |
| missing-export | promethean-planner | ❌ | 0→0 | ❌ | 1467ms | 0 |
| missing-export | qwen3:4b | ❌ | 0→0 | ❌ | 1542ms | 0 |
| optional-parameter | gpt-oss:20b-cloud | ✅ | 1→0 | ✅ | 6181ms | 1 |
| optional-parameter | qwen3:8b | ❌ | 0→0 | ❌ | 1511ms | 0 |
| optional-parameter | qwen3:14b | ❌ | 0→0 | ❌ | 1546ms | 0 |
| optional-parameter | qwen3-coder:7b | ❌ | 0→0 | ❌ | 1466ms | 0 |
| optional-parameter | promethean-planner | ❌ | 0→0 | ❌ | 1512ms | 0 |
| optional-parameter | qwen3:4b | ❌ | 0→0 | ❌ | 1510ms | 0 |
| type-annotation-missing | gpt-oss:20b-cloud | ✅ | 1→1 | ✅ | 5452ms | 1 |
| type-annotation-missing | qwen3:8b | ❌ | 1→1 | ✅ | 17096ms | 3 |
| type-annotation-missing | qwen3:14b | ❌ | 1→0 | ❌ | 13320ms | 1 |
| type-annotation-missing | qwen3-coder:7b | ❌ | 1→0 | ❌ | 7030ms | 1 |
| type-annotation-missing | promethean-planner | ❌ | 1→1 | ✅ | 23806ms | 3 |
| type-annotation-missing | qwen3:4b | ❌ | 1→1 | ✅ | 15480ms | 3 |
| missing-return-type | gpt-oss:20b-cloud | ❌ | 0→0 | ❌ | 1700ms | 0 |
| missing-return-type | qwen3:8b | ❌ | 0→0 | ❌ | 1774ms | 0 |
| missing-return-type | qwen3:14b | ❌ | 0→0 | ❌ | 1657ms | 0 |
| missing-return-type | qwen3-coder:7b | ❌ | 0→0 | ❌ | 1578ms | 0 |
| missing-return-type | promethean-planner | ❌ | 0→0 | ❌ | 1666ms | 0 |
| missing-return-type | qwen3:4b | ❌ | 0→0 | ❌ | 1643ms | 0 |
| class-not-exported | gpt-oss:20b-cloud | ✅ | 1→0 | ✅ | 6129ms | 1 |
| class-not-exported | qwen3:8b | ❌ | 0→0 | ❌ | 1847ms | 0 |
| class-not-exported | qwen3:14b | ❌ | 0→0 | ❌ | 1825ms | 0 |
| class-not-exported | qwen3-coder:7b | ❌ | 0→0 | ❌ | 1787ms | 0 |
| class-not-exported | promethean-planner | ❌ | 0→0 | ❌ | 1666ms | 0 |
| class-not-exported | qwen3:4b | ❌ | 0→0 | ❌ | 1718ms | 0 |
| interface-missing | gpt-oss:20b-cloud | ❌ | 0→0 | ❌ | 1776ms | 0 |
| interface-missing | qwen3:8b | ❌ | 0→0 | ❌ | 1795ms | 0 |
| interface-missing | qwen3:14b | ❌ | 0→0 | ❌ | 1686ms | 0 |
| interface-missing | qwen3-coder:7b | ❌ | 0→0 | ❌ | 1665ms | 0 |
| interface-missing | promethean-planner | ❌ | 0→0 | ❌ | 1680ms | 0 |
| interface-missing | qwen3:4b | ❌ | 0→0 | ❌ | 1750ms | 0 |

## Failure Analysis

### qwen3:8b

- **missing-export**: No errors found in fixture
- **optional-parameter**: No errors found in fixture
- **type-annotation-missing**: Unknown error
- **missing-return-type**: No errors found in fixture
- **class-not-exported**: No errors found in fixture
- **interface-missing**: No errors found in fixture

### qwen3:14b

- **missing-export**: No errors found in fixture
- **optional-parameter**: No errors found in fixture
- **type-annotation-missing**: invalid plan JSON: [
  {
    "code": "invalid_type",
    "expected": "string",
    "received": "undefined",
    "path": [
      "title"
    ],
    "message": "Required"
  },
  {
    "code": "invalid_type",
    "expected": "string",
    "received": "undefined",
    "path": [
      "rationale"
    ],
    "message": "Required"
  }
]
- **missing-return-type**: No errors found in fixture
- **class-not-exported**: No errors found in fixture
- **interface-missing**: No errors found in fixture

### qwen3-coder:7b

- **missing-export**: No errors found in fixture
- **optional-parameter**: No errors found in fixture
- **type-annotation-missing**: invalid plan JSON: [
  {
    "code": "invalid_type",
    "expected": "string",
    "received": "undefined",
    "path": [
      "title"
    ],
    "message": "Required"
  },
  {
    "code": "invalid_type",
    "expected": "string",
    "received": "undefined",
    "path": [
      "rationale"
    ],
    "message": "Required"
  }
]
- **missing-return-type**: No errors found in fixture
- **class-not-exported**: No errors found in fixture
- **interface-missing**: No errors found in fixture

### promethean-planner

- **missing-export**: No errors found in fixture
- **optional-parameter**: No errors found in fixture
- **type-annotation-missing**: Unknown error
- **missing-return-type**: No errors found in fixture
- **class-not-exported**: No errors found in fixture
- **interface-missing**: No errors found in fixture

### qwen3:4b

- **missing-export**: No errors found in fixture
- **optional-parameter**: No errors found in fixture
- **type-annotation-missing**: Unknown error
- **missing-return-type**: No errors found in fixture
- **class-not-exported**: No errors found in fixture
- **interface-missing**: No errors found in fixture

### gpt-oss:20b-cloud

- **missing-return-type**: No errors found in fixture
- **interface-missing**: No errors found in fixture
