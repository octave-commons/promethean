# TypeScript BuildFix Benchmark Report

## 📊 Executive Summary

- **Total Tests**: 36
- **Success Rate**: 22.2%
- **Errors Resolved**: 8/24 (33.3%)
- **Average Duration**: 13.09 seconds
- **Generated**: 2025-10-15T07:11:54.960Z

## 🎯 Performance Metrics

### Success Rate by Category

| Category | Result | Duration | Attempts | Plan |
|----------|--------|----------|----------|------|
| missing-export | ✅ PASS | 9.83s | 1 | ✅ |
| optional-parameter | ❌ FAIL | 14.88s | 3 | ✅ |
| type-annotation-missing | ❌ FAIL | 17.08s | 3 | ✅ |
| missing-return-type | ❌ FAIL | 1.70s | 0 | ❌ |
| class-not-exported | ✅ PASS | 5.48s | 1 | ✅ |
| interface-missing | ❌ FAIL | 1.57s | 0 | ❌ |
| missing-export | ❌ FAIL | 40.34s | 3 | ❌ |
| optional-parameter | ❌ FAIL | 52.92s | 3 | ❌ |
| type-annotation-missing | ❌ FAIL | 52.84s | 3 | ❌ |
| missing-return-type | ❌ FAIL | 1.63s | 0 | ❌ |
| class-not-exported | ❌ FAIL | 53.33s | 3 | ❌ |
| interface-missing | ❌ FAIL | 1.82s | 0 | ❌ |
| missing-export | ❌ FAIL | 55.33s | 3 | ❌ |
| optional-parameter | ❌ FAIL | 9.17s | 3 | ✅ |
| type-annotation-missing | ❌ FAIL | 13.41s | 3 | ✅ |
| missing-return-type | ❌ FAIL | 1.66s | 0 | ❌ |
| class-not-exported | ❌ FAIL | 6.50s | 3 | ❌ |
| interface-missing | ❌ FAIL | 1.59s | 0 | ❌ |
| missing-export | ✅ PASS | 15.29s | 1 | ✅ |
| optional-parameter | ❌ FAIL | 8.86s | 3 | ✅ |
| type-annotation-missing | ❌ FAIL | 12.39s | 3 | ✅ |
| missing-return-type | ❌ FAIL | 1.63s | 0 | ❌ |
| class-not-exported | ✅ PASS | 6.31s | 1 | ✅ |
| interface-missing | ❌ FAIL | 1.60s | 0 | ❌ |
| missing-export | ✅ PASS | 9.04s | 1 | ✅ |
| optional-parameter | ❌ FAIL | 8.09s | 3 | ✅ |
| type-annotation-missing | ❌ FAIL | 11.62s | 3 | ✅ |
| missing-return-type | ❌ FAIL | 1.57s | 0 | ❌ |
| class-not-exported | ✅ PASS | 5.43s | 1 | ✅ |
| interface-missing | ❌ FAIL | 1.61s | 0 | ❌ |
| missing-export | ✅ PASS | 18.54s | 1 | ✅ |
| optional-parameter | ❌ FAIL | 7.45s | 3 | ✅ |
| type-annotation-missing | ❌ FAIL | 11.78s | 3 | ✅ |
| missing-return-type | ❌ FAIL | 1.66s | 0 | ❌ |
| class-not-exported | ✅ PASS | 5.61s | 1 | ✅ |
| interface-missing | ❌ FAIL | 1.69s | 0 | ❌ |

### Model Performance Analysis

#### qwen3:8b
- **Success Rate**: 33.3%
- **Error Resolution Rate**: 33.3%
- **Average Duration**: 8.42 seconds
- **Total Errors Encountered**: 4
- **Errors Successfully Fixed**: 2

#### qwen3:14b
- **Success Rate**: 0.0%
- **Error Resolution Rate**: 0.0%
- **Average Duration**: 33.81 seconds
- **Total Errors Encountered**: 4
- **Errors Successfully Fixed**: 4

#### qwen2.5-coder:7b
- **Success Rate**: 0.0%
- **Error Resolution Rate**: 0.0%
- **Average Duration**: 14.61 seconds
- **Total Errors Encountered**: 4
- **Errors Successfully Fixed**: 4

#### promethean-planner
- **Success Rate**: 33.3%
- **Error Resolution Rate**: 33.3%
- **Average Duration**: 7.68 seconds
- **Total Errors Encountered**: 4
- **Errors Successfully Fixed**: 3

#### qwen3:4b
- **Success Rate**: 33.3%
- **Error Resolution Rate**: 33.3%
- **Average Duration**: 6.23 seconds
- **Total Errors Encountered**: 4
- **Errors Successfully Fixed**: 3

#### llama3:8b
- **Success Rate**: 33.3%
- **Error Resolution Rate**: 33.3%
- **Average Duration**: 7.79 seconds
- **Total Errors Encountered**: 4
- **Errors Successfully Fixed**: 3

## 🔍 Detailed Test Results

### missing-export
- **Status**: ✅ SUCCESS
- **Errors**: 1 → 0
- **Resolved**: Yes
- **Plan Generated**: Yes
- **Duration**: 9.83s
- **Attempts**: 1
- **Plan**: Fix missing export for helper function

### optional-parameter
- **Status**: ❌ FAILED
- **Errors**: 1 → 1
- **Resolved**: No
- **Plan Generated**: Yes
- **Duration**: 14.88s
- **Attempts**: 3
- **Plan**: Fix missing required parameter

### type-annotation-missing
- **Status**: ❌ FAILED
- **Errors**: 1 → 1
- **Resolved**: No
- **Plan Generated**: Yes
- **Duration**: 17.08s
- **Attempts**: 3
- **Plan**: Add missing type annotation for 'someUnknownFunction'

### missing-return-type
- **Status**: ❌ FAILED
- **Errors**: 0 → 0
- **Resolved**: No
- **Plan Generated**: No
- **Duration**: 1.70s
- **Attempts**: 0
- **Error**: No errors found in fixture

### class-not-exported
- **Status**: ✅ SUCCESS
- **Errors**: 1 → 0
- **Resolved**: Yes
- **Plan Generated**: Yes
- **Duration**: 5.48s
- **Attempts**: 1
- **Plan**: Export Helper class

### interface-missing
- **Status**: ❌ FAILED
- **Errors**: 0 → 0
- **Resolved**: No
- **Plan Generated**: No
- **Duration**: 1.57s
- **Attempts**: 0
- **Error**: No errors found in fixture

### missing-export
- **Status**: ❌ FAILED
- **Errors**: 1 → 0
- **Resolved**: No
- **Plan Generated**: No
- **Duration**: 40.34s
- **Attempts**: 3
- **Error**: ollama generate 500: {"error":"model runner has unexpectedly stopped, this may be due to resource limitations or an internal error, check ollama server logs for details"}

### optional-parameter
- **Status**: ❌ FAILED
- **Errors**: 1 → 0
- **Resolved**: No
- **Plan Generated**: No
- **Duration**: 52.92s
- **Attempts**: 3
- **Error**: ollama generate 500: {"error":"model runner has unexpectedly stopped, this may be due to resource limitations or an internal error, check ollama server logs for details"}

### type-annotation-missing
- **Status**: ❌ FAILED
- **Errors**: 1 → 0
- **Resolved**: No
- **Plan Generated**: No
- **Duration**: 52.84s
- **Attempts**: 3
- **Error**: ollama generate 500: {"error":"model runner has unexpectedly stopped, this may be due to resource limitations or an internal error, check ollama server logs for details"}

### missing-return-type
- **Status**: ❌ FAILED
- **Errors**: 0 → 0
- **Resolved**: No
- **Plan Generated**: No
- **Duration**: 1.63s
- **Attempts**: 0
- **Error**: No errors found in fixture

### class-not-exported
- **Status**: ❌ FAILED
- **Errors**: 1 → 0
- **Resolved**: No
- **Plan Generated**: No
- **Duration**: 53.33s
- **Attempts**: 3
- **Error**: ollama generate 500: {"error":"model runner has unexpectedly stopped, this may be due to resource limitations or an internal error, check ollama server logs for details"}

### interface-missing
- **Status**: ❌ FAILED
- **Errors**: 0 → 0
- **Resolved**: No
- **Plan Generated**: No
- **Duration**: 1.82s
- **Attempts**: 0
- **Error**: No errors found in fixture

### missing-export
- **Status**: ❌ FAILED
- **Errors**: 1 → 0
- **Resolved**: No
- **Plan Generated**: No
- **Duration**: 55.33s
- **Attempts**: 3
- **Error**: Unterminated string in JSON at position 248 (line 6 column 226)

### optional-parameter
- **Status**: ❌ FAILED
- **Errors**: 1 → 0
- **Resolved**: No
- **Plan Generated**: Yes
- **Duration**: 9.17s
- **Attempts**: 3
- **Plan**: addImport
- **Error**: file

### type-annotation-missing
- **Status**: ❌ FAILED
- **Errors**: 1 → 0
- **Resolved**: No
- **Plan Generated**: Yes
- **Duration**: 13.41s
- **Attempts**: 3
- **Plan**: someFix
- **Error**: Unterminated string in JSON at position 437 (line 10 column 171)

### missing-return-type
- **Status**: ❌ FAILED
- **Errors**: 0 → 0
- **Resolved**: No
- **Plan Generated**: No
- **Duration**: 1.66s
- **Attempts**: 0
- **Error**: No errors found in fixture

### class-not-exported
- **Status**: ❌ FAILED
- **Errors**: 1 → 0
- **Resolved**: No
- **Plan Generated**: No
- **Duration**: 6.50s
- **Attempts**: 3
- **Error**: Unterminated string in JSON at position 245 (line 7 column 211)

### interface-missing
- **Status**: ❌ FAILED
- **Errors**: 0 → 0
- **Resolved**: No
- **Plan Generated**: No
- **Duration**: 1.59s
- **Attempts**: 0
- **Error**: No errors found in fixture

### missing-export
- **Status**: ✅ SUCCESS
- **Errors**: 1 → 0
- **Resolved**: Yes
- **Plan Generated**: Yes
- **Duration**: 15.29s
- **Attempts**: 1
- **Plan**: Export helper function from src module

### optional-parameter
- **Status**: ❌ FAILED
- **Errors**: 1 → 0
- **Resolved**: No
- **Plan Generated**: Yes
- **Duration**: 8.86s
- **Attempts**: 3
- **Plan**: Fix missing required parameter
- **Error**: file

### type-annotation-missing
- **Status**: ❌ FAILED
- **Errors**: 1 → 1
- **Resolved**: No
- **Plan Generated**: Yes
- **Duration**: 12.39s
- **Attempts**: 3
- **Plan**: Fix missing type annotation
- **Error**: snippet must export async function apply(project)

### missing-return-type
- **Status**: ❌ FAILED
- **Errors**: 0 → 0
- **Resolved**: No
- **Plan Generated**: No
- **Duration**: 1.63s
- **Attempts**: 0
- **Error**: No errors found in fixture

### class-not-exported
- **Status**: ✅ SUCCESS
- **Errors**: 1 → 0
- **Resolved**: Yes
- **Plan Generated**: Yes
- **Duration**: 6.31s
- **Attempts**: 1
- **Plan**: Export Helper class from src module

### interface-missing
- **Status**: ❌ FAILED
- **Errors**: 0 → 0
- **Resolved**: No
- **Plan Generated**: No
- **Duration**: 1.60s
- **Attempts**: 0
- **Error**: No errors found in fixture

### missing-export
- **Status**: ✅ SUCCESS
- **Errors**: 1 → 0
- **Resolved**: Yes
- **Plan Generated**: Yes
- **Duration**: 9.04s
- **Attempts**: 1
- **Plan**: Fix missing export for helper function

### optional-parameter
- **Status**: ❌ FAILED
- **Errors**: 1 → 0
- **Resolved**: No
- **Plan Generated**: Yes
- **Duration**: 8.09s
- **Attempts**: 3
- **Plan**: Fix optional parameter error
- **Error**: file

### type-annotation-missing
- **Status**: ❌ FAILED
- **Errors**: 1 → 1
- **Resolved**: No
- **Plan Generated**: Yes
- **Duration**: 11.62s
- **Attempts**: 3
- **Plan**: Fix missing type annotation for 'someUnknownFunction'
- **Error**: snippet must export async function apply(project)

### missing-return-type
- **Status**: ❌ FAILED
- **Errors**: 0 → 0
- **Resolved**: No
- **Plan Generated**: No
- **Duration**: 1.57s
- **Attempts**: 0
- **Error**: No errors found in fixture

### class-not-exported
- **Status**: ✅ SUCCESS
- **Errors**: 1 → 0
- **Resolved**: Yes
- **Plan Generated**: Yes
- **Duration**: 5.43s
- **Attempts**: 1
- **Plan**: Fix class not exported in module

### interface-missing
- **Status**: ❌ FAILED
- **Errors**: 0 → 0
- **Resolved**: No
- **Plan Generated**: No
- **Duration**: 1.61s
- **Attempts**: 0
- **Error**: No errors found in fixture

### missing-export
- **Status**: ✅ SUCCESS
- **Errors**: 1 → 0
- **Resolved**: Yes
- **Plan Generated**: Yes
- **Duration**: 18.54s
- **Attempts**: 1
- **Plan**: Fix Missing Export

### optional-parameter
- **Status**: ❌ FAILED
- **Errors**: 1 → 0
- **Resolved**: No
- **Plan Generated**: Yes
- **Duration**: 7.45s
- **Attempts**: 3
- **Plan**: Optional Parameter Fix
- **Error**: file

### type-annotation-missing
- **Status**: ❌ FAILED
- **Errors**: 1 → 1
- **Resolved**: No
- **Plan Generated**: Yes
- **Duration**: 11.78s
- **Attempts**: 3
- **Plan**: Fix type annotation missing
- **Error**: snippet must export async function apply(project)

### missing-return-type
- **Status**: ❌ FAILED
- **Errors**: 0 → 0
- **Resolved**: No
- **Plan Generated**: No
- **Duration**: 1.66s
- **Attempts**: 0
- **Error**: No errors found in fixture

### class-not-exported
- **Status**: ✅ SUCCESS
- **Errors**: 1 → 0
- **Resolved**: Yes
- **Plan Generated**: Yes
- **Duration**: 5.61s
- **Attempts**: 1
- **Plan**: Export Unexported Symbol

### interface-missing
- **Status**: ❌ FAILED
- **Errors**: 0 → 0
- **Resolved**: No
- **Plan Generated**: No
- **Duration**: 1.69s
- **Attempts**: 0
- **Error**: No errors found in fixture

## 📈 Key Insights

### ✅ Successful Fixes
- **missing-export**: Resolved in 1 attempt (9.83s)
- **class-not-exported**: Resolved in 1 attempt (5.48s)
- **missing-export**: Resolved in 1 attempt (15.29s)
- **class-not-exported**: Resolved in 1 attempt (6.31s)
- **missing-export**: Resolved in 1 attempt (9.04s)
- **class-not-exported**: Resolved in 1 attempt (5.43s)
- **missing-export**: Resolved in 1 attempt (18.54s)
- **class-not-exported**: Resolved in 1 attempt (5.61s)

### ❌ Failed Fixes
- **optional-parameter**: Failed after 3 attempts (14.88s)
- **type-annotation-missing**: Failed after 3 attempts (17.08s)
- **missing-export**: Failed after 3 attempts (40.34s)
- **optional-parameter**: Failed after 3 attempts (52.92s)
- **type-annotation-missing**: Failed after 3 attempts (52.84s)
- **class-not-exported**: Failed after 3 attempts (53.33s)
- **missing-export**: Failed after 3 attempts (55.33s)
- **optional-parameter**: Failed after 3 attempts (9.17s)
- **type-annotation-missing**: Failed after 3 attempts (13.41s)
- **class-not-exported**: Failed after 3 attempts (6.50s)
- **optional-parameter**: Failed after 3 attempts (8.86s)
- **type-annotation-missing**: Failed after 3 attempts (12.39s)
- **optional-parameter**: Failed after 3 attempts (8.09s)
- **type-annotation-missing**: Failed after 3 attempts (11.62s)
- **optional-parameter**: Failed after 3 attempts (7.45s)
- **type-annotation-missing**: Failed after 3 attempts (11.78s)

### ⚠️ No Errors Found
- **missing-return-type**: No errors detected in fixture
- **interface-missing**: No errors detected in fixture
- **missing-return-type**: No errors detected in fixture
- **interface-missing**: No errors detected in fixture
- **missing-return-type**: No errors detected in fixture
- **interface-missing**: No errors detected in fixture
- **missing-return-type**: No errors detected in fixture
- **interface-missing**: No errors detected in fixture
- **missing-return-type**: No errors detected in fixture
- **interface-missing**: No errors detected in fixture
- **missing-return-type**: No errors detected in fixture
- **interface-missing**: No errors detected in fixture

## 🚀 Recommendations

### Immediate Actions
1. **Fixtures with No Errors**: Review and update missing-return-type, interface-missing, missing-return-type, interface-missing, missing-return-type, interface-missing, missing-return-type, interface-missing, missing-return-type, interface-missing, missing-return-type, interface-missing fixtures
2. **Failed Error Types**: Investigate why optional-parameter, type-annotation-missing, missing-export, optional-parameter, type-annotation-missing, class-not-exported, missing-export, optional-parameter, type-annotation-missing, class-not-exported, optional-parameter, type-annotation-missing, optional-parameter, type-annotation-missing, optional-parameter, type-annotation-missing failed resolution
3. **Performance Optimization**: Average duration of 13.09s is could be improved

### Next Steps
1. **Scale Testing**: Run benchmarks with 1000+ errors for statistical significance
2. **Multi-Model Comparison**: Test different model performance
3. **Error Pattern Analysis**: Identify common failure patterns across error types

## 📋 Technical Details

- **Report Generated**: 2025-10-15T07:11:54.961Z
- **Total Benchmark Time**: 471.22 seconds
- **Cache System**: Enabled with intelligent caching
- **Environment**: Promethean BuildFix TypeScript

---
*Generated by Promethean BuildFix Benchmark System*