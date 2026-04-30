# Validation Path Fix Plan

## Summary
- Investigate why `validateMcpOperation` allows injected paths such as `file.txt && cat /etc/passwd`.
- Harden the core path validation to reject wrapper command operators while keeping legitimate file names working.
- Re-run the specific validation integration test after adjustments to confirm the regression is resolved.

## Code references
- `src/validation/comprehensive.ts:16-120` – `DANGEROUS_CHARS`, `containsDangerousCharacters`, and surrounding validation helpers are responsible for flagging unsafe tokens.
- `src/tests/validation-integration.test.ts:28-44` – failing test suite enumerating dangerous paths, including the `&&` injection that currently passes.

## Existing issues/PRs
- No related GitHub issues or pull requests identified for this regression.

## Definition of done
1. `validateMcpOperation` rejects `file.txt && cat /etc/passwd` and similar command-injection patterns.
2. `validateMcpPath` and `validateMcpPathArray` tests pass locally, demonstrating the validation change works for arrays and single paths.

## Requirements
- Introduce coverage for `&`/`&&` in the baseline dangerous characters list without blocking normal filenames.
- Ensure test assertions in `/src/tests/validation-integration.test.ts` remain valid and continue to exercise sanitization.
- Rerun `pnpm test --filter validation-integration` (or equivalent fast-run) to verify the specific suite.
