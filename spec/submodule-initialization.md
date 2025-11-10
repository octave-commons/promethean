# Submodule Initialization Plan

## Context
- The `main` branch was paused mid-merge and still used the legacy `.gitmodules` layout.
- New package repos (`apply-patch`, `logger`, `utils`, etc.) were staged as submodules, but the working tree did not contain their sources because the merge conflicts on `.gitmodules` and the gitlinks were unresolved.
- `git submodule status` failed (`no submodule mapping found`) and every `packages/*` submodule path showed up as `U000...`, preventing any further conflict resolution.

## Decisions & Actions
1. Accept the incoming (`--theirs`) version of `.gitmodules`, which:
   - Removes historical local/test submodules (`git-subrepo-source`, `test-data/test-git`, `packages/kanban/test-*`).
   - Adds branch metadata for each real package repo and introduces the new submodules (`apply-patch`, `logger`, `utils`).
2. Remove the deprecated submodule directories (`git-subrepo-source`, `test-data/test-git`) to match the new manifest.
3. For each conflicted package submodule, pin the gitlink to the incoming commit (from the feature branch) and re-stage it:

   | Path | Commit |
   | --- | --- |
   | `packages/apply-patch` | `797cc5d6b3711484fc4ed71db79ab00e0db916d3` |
   | `packages/auth-service` | `f15263df011f881a9f49fbde62ffa213b184564b` |
   | `packages/autocommit` | `51b7b07761e6f0314f5f734a2fd4e855a525afa7` |
   | `packages/kanban` | `60f5d921970c1e334f0844ffaacce33e2e894ca4` |
   | `packages/logger` | `cf97209e380071c0169772e13968035bedf0860d` |
   | `packages/mcp` | `7ea4c08894c4f89988a48e7e57b83866115a52ef` |
   | `packages/naming` | `87c2f0148be801e03fe9b5d3db5d70586688346a` |
   | `packages/persistence` | `b1fafbea92ff65c84eb57bb9fda604bd524117a1` |
   | `packages/utils` | `b08c6d67d90be6c4016402024c6df416f90ad410` |
4. Run `git submodule update --init` for every path above so the working tree now contains their checked-out contents.
5. Verify the repair with `git submodule status`, which now prints the expected commits for each package without errors.

## Definition of Done
- `.gitmodules` is conflict-free and reflects the new package repo layout with `branch` hints.
- Obsolete in-tree submodules are removed from the index.
- Each package submodule is initialized locally and points at the commit required by the merge branch, allowing downstream merge conflicts to be resolved with full code context.
- `git submodule status` completes successfully (no missing mappings, no `U000...` entries).
