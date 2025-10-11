---
uuid: "c1d2e3f4-a5b6-c7d8-e9f0-1a2b3c4d5e6f"
title: "Fix CI environment Node.js and pnpm version inconsistencies /cd    -system     -system     -system     -system     -system     -system     -system     -system     -system     -system     -system     -system     -system     -system     -system     -system     -system     -system     -system     -system     -system     -system     -system     -system     -system     -system     -system"
slug: "fix-ci-environment-issues"
status: "ready"
priority: "P2"
labels: ["ci", "environment", "nodejs", "pnpm", "build-system"]
created_at: "2025-10-11T01:03:32.222Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---



























## Issue

CI pipeline experiencing environment inconsistencies:

1. **Node.js version mismatch**: CI using v20.19.5 instead of desired 20.19.4
2. **pnpm version inconsistencies**: Different pnpm versions across CI jobs
3. **Missing dependencies**: tree-sitter package not available in CI environment

## Technical Details

### Current CI Environment Problems
- Node.js version detection inconsistency
- pnpm version not properly enforced across all jobs
- Missing build dependencies for tree-sitter
- Environment variable configuration issues

### Expected Environment
- **Node.js**: 20.19.4 (as specified in project requirements)
- **pnpm**: 9.0.0 (enforced by preinstall script)
- **Dependencies**: All required build tools available

## Acceptance Criteria

1. Ensure consistent Node.js 20.19.4 across all CI jobs
2. Enforce pnpm 9.0.0 version consistently
3. Fix missing tree-sitter dependency installation
4. Verify CI pipeline builds successfully
5. Add environment validation to catch future discrepancies

## Files to Modify

- `.github/workflows/` (CI configuration files)
- `package.json` (verify Node.js version specification)
- Any environment setup scripts

## Root Cause Analysis

The CI environment is not properly locked to the exact versions specified in the project requirements, leading to drift between local development and CI builds.

## Verification Steps

1. Run CI pipeline and verify Node.js version consistency
2. Check pnpm version across all jobs
3. Verify all dependencies install correctly
4. Confirm successful TypeScript compilation
5. Validate that CI matches local build environment


























