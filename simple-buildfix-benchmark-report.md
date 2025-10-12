# Simple BuildFix Benchmark Report

## Summary
- Total tests: 18
- Successful: 1
- Success rate: 5.6%

## Results
- 01-undefined-var with qwen3:8b: ✅ 
- 01-undefined-var with qwen3:14b: ❌ invalid plan JSON: [
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
- 01-undefined-var with qwen3-coder:7b: ❌ Expected ',' or '}' after property value in JSON at position 20
- 01-undefined-var with promethean-planner: ❌ 
- 01-undefined-var with qwen3:4b: ❌ File not found: /home/err/devel/promethean/simple-benchmark-temp/fixtures/01-undefined-var/tsconfig.json
- 01-undefined-var with llama3:8b: ❌ No errors found in fixture
- 02-missing-export with qwen3:8b: ❌ No errors found in fixture
- 02-missing-export with qwen3:14b: ❌ No errors found in fixture
- 02-missing-export with qwen3-coder:7b: ❌ No errors found in fixture
- 02-missing-export with promethean-planner: ❌ No errors found in fixture
- 02-missing-export with qwen3:4b: ❌ No errors found in fixture
- 02-missing-export with llama3:8b: ❌ No errors found in fixture
- 03-optional-param with qwen3:8b: ❌ No errors found in fixture
- 03-optional-param with qwen3:14b: ❌ No errors found in fixture
- 03-optional-param with qwen3-coder:7b: ❌ No errors found in fixture
- 03-optional-param with promethean-planner: ❌ No errors found in fixture
- 03-optional-param with qwen3:4b: ❌ No errors found in fixture
- 03-optional-param with llama3:8b: ❌ No errors found in fixture
