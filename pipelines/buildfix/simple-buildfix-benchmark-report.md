# Simple BuildFix Benchmark Report

## Summary
- Total tests: 6
- Successful: 2
- Success rate: 33.3%

## Results
- undefined-variable with qwen3:8b: ✅ 
- missing-export with qwen3:8b: ✅ 
- undefined-variable with qwen3:14b: ❌ invalid plan JSON: [
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
- missing-export with qwen3:14b: ❌ invalid plan JSON: [
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
- undefined-variable with qwen3-coder:7b: ❌ invalid plan JSON: [
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
- missing-export with qwen3-coder:7b: ❌ Unterminated string in JSON at position 222
