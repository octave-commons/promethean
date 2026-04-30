# Eta-mu GitHub integration — 2026-03-21

## Summary
Implement a pi-based GitHub automation surface named **eta-mu** for `devel` and the writable GitHub-backed submodules in this workspace.

The user wants:
- merge protection that requires CodeRabbit review comments to be resolved before merge acceptance
- a pi-based GitHub integration with its own bot-style identity (`eta-mu`)
- a canonical source home at `orgs/open-hax/eta-mu/packages/eta-mu-github`
- triggers on PR changes, issue creation, and explicit mentions, with debounce
- the ability for eta-mu to interact with CodeRabbit, other review agents, and humans
- the existing `orgs/open-hax/codex/.github/` workflows/ruleset patterns used as inspiration

## Facts
- `devel` already has GitHub-oriented automation helpers such as `bin/setup-branch-protection` and `src/issues/projector.ts`.
- `orgs/open-hax/codex/.github/` already contains PR automation, review-response, and ruleset snapshot patterns.
- Pi SDK supports embedded agent sessions via `createAgentSession()` and can run with explicit tool/resource control.
- Many workspace submodules are third-party or read-only, so rollout must distinguish admin-capable repos from read-only upstreams.

## Open questions
- Which merge gate should be authoritative for "CodeRabbit comments resolved":
  1. native GitHub required review-thread resolution,
  2. an eta-mu workflow check, or
  3. both?
  - Working default: implement both a native branch/ruleset policy path and an eta-mu review-gate check so repos can use the stricter combination.
- Should eta-mu auto-comment on every PR change, or only when it has something substantive to say?
  - Working default: trigger on all requested events but allow the eta-mu runner to no-op; mentions should always receive a direct response.
- Should rollout be attempted against every admin-capable repo immediately, or first produce tooling + templates and wire `devel` itself?
  - Working default: build the shared eta-mu repo and rollout tooling now, wire `devel`, and make managed submodule rollout scriptable from the workspace.

## Risks
- GitHub rulesets/branch protection are remote state, so local file snapshots alone do not enforce behavior.
- A GitHub App-style bot identity requires app credentials/installation work outside normal git commits.
- Blindly pushing workflow changes to every submodule would be risky across actively drifting repos.
- Required status checks can deadlock merges if configured before the corresponding workflow exists on the target repo.

## Priority
- High: this is repo-governance and review automation infrastructure.

## Phases
1. Investigate current patterns in `devel`, `orgs/open-hax/codex/.github/`, and pi SDK/examples; inventory admin-capable submodules.
2. Consolidate the canonical eta-mu automation into the eta-mu monorepo at `orgs/open-hax/eta-mu/packages/eta-mu-github`.
3. Implement eta-mu GitHub automation foundation:
   - pi SDK-driven event runner
   - review-gate checker for unresolved review threads/comments
   - trigger classification + debounce helpers
   - GitHub App / bot credential contract docs
4. Wire `devel` to eta-mu with local workflows/templates and update branch-protection tooling/docs.
5. Add rollout tooling for writable submodules so eta-mu workflows/policies can be installed consistently.
6. Verify tests/builds, workflow YAML validity, and rollout inventory outputs.

## Affected artifacts
- `specs/drafts/eta-mu-github-integration-2026-03-21.md`
- `.gitmodules`
- `orgs/open-hax/eta-mu/**`
- `.github/workflows/eta-mu.yml`
- `.github/workflows/eta-mu-review-gate.yml`
- `src/github/eta-mu-rollout.ts`
- `bin/setup-branch-protection`
- `docs/reference/eta-mu-github-rollout.md`
- `docs/reports/inventory/eta-mu-admin-submodule-targets-2026-03-21.json`
- `docs/reports/inventory/eta-mu-admin-submodule-targets-2026-03-21.md`
- `package.json`
- `receipts.log`

## Definition of done
- `open-hax/eta-mu` is the canonical eta-mu repo, with automation living at `orgs/open-hax/eta-mu/packages/eta-mu-github`.
- Eta-mu repo contains a pi-based GitHub runner and review gate foundation.
- `devel` has eta-mu workflow wiring and documented credential/ruleset expectations.
- Workspace tooling can identify/admin-roll out eta-mu integration to writable submodules.
- Verification covers the eta-mu repo build/tests and root workflow/tooling sanity checks.

## Execution log
- 2026-03-21T00:00:00Z Draft created to track eta-mu GitHub integration planning and implementation.
- 2026-03-21T19:00:00Z Investigated pi SDK/examples plus `orgs/open-hax/codex/.github/` workflows/rulesets to anchor the eta-mu design on the existing Codex promotion and review-response model.
- 2026-03-21T19:10:00Z Scaffolded the standalone `open-hax/eta-mu-github` automation surface before later consolidating it into the eta-mu monorepo at `orgs/open-hax/eta-mu/packages/eta-mu-github`.
- 2026-03-21T19:20:00Z Wired `devel` itself with `eta-mu` and `eta-mu-review-gate` GitHub workflows and added root docs for secrets, branch-protection expectations, and rollout commands.
- 2026-03-21T19:25:00Z Added `src/github/eta-mu-rollout.ts` to inventory/install eta-mu workflow wrappers across admin-capable submodules and generated the first inventory report showing eligible rollout targets.
- 2026-03-21T19:30:00Z Reworked `bin/setup-branch-protection` so it can include the root repo, skip non-admin repos, and preserve/merge existing required checks while keeping review-thread resolution enabled.
- 2026-03-21T19:35:00Z Verified eta-mu repo tests/build in the standalone repo checkout, validated the new root workflow YAML files, checked shell syntax for the branch-protection helper, and confirmed the rollout inventory script parses and reports eligible repos.
- 2026-03-21T20:05:00Z Opened rollout PRs for the root repo plus nearly all admin-capable submodules on branch `eta-mu-rollout-20260321`; reused existing rollout PRs where they were already open and manually recovered the `octave-commons/promethean-agent-system` PR after the first automated create attempt failed.
- 2026-03-21T20:10:00Z Applied remote branch protection to the root repo and admin-capable submodules with `required_conversation_resolution` plus required check `coderabbit-review-gate`, making unresolved CodeRabbit review threads block merge acceptance on default branches.