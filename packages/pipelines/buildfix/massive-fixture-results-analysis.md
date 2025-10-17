# Massive Fixture Benchmark Analysis

## Executive Summary

- **Total Tests**: 615
- **Successful Tests**: 0 (0.0%)
- **Failed Tests**: 615
- **Errors Resolved**: 0 (0.0%)
- **Plans Generated**: 587 (95.4%)

## Performance Metrics

### Duration Statistics
- **Average Duration**: 9.4s
- **Median Duration**: 9.6s
- **95th Percentile**: 12.0s

### Model Performance

| Model | Tests | Success Rate | Avg Duration |
|-------|-------|--------------|--------------|
| qwen3:8b | 615 | 0.0% | 9.4s |

## Key Insights

### Success Factors


### Common Failure Patterns

#### Top Error Messages
- **28 occurrences**: No errors found in fixture
- **1 occurrences**: Cannot find package 'ts-morph' imported from /home/err/devel/promethean/benchmark-temp/fixtures/fixt...
- **1 occurrences**: Cannot find package 'ts-morph' imported from /home/err/devel/promethean/benchmark-temp/fixtures/fixt...
- **1 occurrences**: Cannot find package 'ts-morph' imported from /home/err/devel/promethean/benchmark-temp/fixtures/fixt...
- **1 occurrences**: Cannot find package 'ts-morph' imported from /home/err/devel/promethean/benchmark-temp/fixtures/fixt...
- **1 occurrences**: Cannot find package 'ts-morph' imported from /home/err/devel/promethean/benchmark-temp/fixtures/fixt...
- **1 occurrences**: Cannot find package 'ts-morph' imported from /home/err/devel/promethean/benchmark-temp/fixtures/fixt...
- **1 occurrences**: Cannot find package 'ts-morph' imported from /home/err/devel/promethean/benchmark-temp/fixtures/fixt...
- **1 occurrences**: Cannot find package 'ts-morph' imported from /home/err/devel/promethean/benchmark-temp/fixtures/fixt...
- **1 occurrences**: Cannot find package 'ts-morph' imported from /home/err/devel/promethean/benchmark-temp/fixtures/fixt...

### Recommendations

1. **Import Resolution**: Many failures relate to package import issues, suggesting need for better dependency resolution
2. **Error Handling**: Improve handling of complex TypeScript errors with multiple cascading issues
3. **Timeout Management**: Consider increasing timeouts for complex fixtures with high error counts
4. **Model Selection**: Current model shows reasonable performance, consider testing with larger models

## Detailed Results Summary

### Success by Error Count Range
| Error Count Range | Success Rate |
|-------------------|--------------|
| ≤0 | 0/28 (0.0%) |
| ≤1 | 0/86 (0.0%) |
| ≤2 | 0/141 (0.0%) |
| ≤5 | 0/233 (0.0%) |
| ≤10 | 0/321 (0.0%) |
| ≤20 | 0/402 (0.0%) |
| ≤50 | 0/488 (0.0%) |

### Attempt Distribution
| Attempts | Count | Success Rate |
|----------|-------|--------------|
| 0 | 28 | 0.0% |
| 1 | 0 | 0% |
| 2 | 0 | 0% |
| 3 | 587 | 0.0% |

### Attempt Distribution
| Attempts | Count | Success Rate |
|----------|-------|--------------|
| 0 | 28 | 0.0% |
| 1 | 0 | 0% |
| 2 | 0 | 0% |
| 3 | 587 | 0.0% |

---
*Generated from 615 unique massive fixtures (615 total model runs)*
