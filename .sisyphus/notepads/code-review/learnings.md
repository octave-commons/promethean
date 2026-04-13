## Code Review Learnings (2026-02-03)
- Review task: analyze current working tree changes, focusing on bugs, structure, and perf in diffs.
- Found concrete issue: cephalon.cljs env vars use (str "$DUCK_DISCORD_TOKEN"), which yields literal string not actual token. Should use env-var macro or proper System/env resolution.
- Notable config drift: shadow-cljs.edn drastically simplified; ensure essential builds/modules exist or re-add explicit modules to avoid breakages.
- Dependency drift: package.json pinning loosened to wildcard for @promethean-os/lmdb-cache; this may cause non-reproducible builds. Prefer pinned version ranges to ensure stability.
- Workspace metadata updated: .sisyphus/boulder.json shows active plan switched to cljs-architecture-fix; verify plan lifecycle and that changes align with plan expectations.
- Submodule references updated (several orgs/** submodules) which can affect reproducibility. Validate submodule integrity before merging.
- Recommendations:
  - For cephalon env vars: replace (str "$DUCK_DISCORD_TOKEN") with env-var macro, e.g., :DUCK_DISCORD_TOKEN (clobber.macro/env-var :DUCK_DISCORD_TOKEN "").
  - Restore or document explicit build targets in shadow-cljs.edn to cover all used ecosystems/modules; avoid silent omissions.
  - Pin dependency versions in package.json (avoid "*" in production dependencies) and update pnpm-lock.yaml accordingly.
  - Run full verification: git status, git diff, and test/build to ensure no hidden breakages.

### Detailed diffs and issues (current run)
- ecosystems/cephalon.cljs
  - Issue: duck-cephalon-ts env token reads literal string via (str "$DUCK_DISCORD_TOKEN"). Fix by using clobber.macro env-var or proper environment binding. Risk: runtime token not found, cephalon services fail to authenticate with Discord.
  - Suggested patch: replace ":DUCK_DISCORD_TOKEN (str \"$DUCK_DISCORD_TOKEN\")" with ":DUCK_DISCORD_TOKEN (clobber.macro/env-var :DUCK_DISCORD_TOKEN \"\")".
- opencode.json
  - Issue: git log permission moved from allow to not set; patch shows only git log allowed in staged; review if security policy requires restricting; current diff shows only git log allowed; ensure no accidental permissive changes.
- package.json / pnpm-lock.yaml
  - Issue: @promethean-os/lmdb-cache pinned to wildcard '*' in dependencies. This harms reproducibility. Recommendation: pin an exact version range and refresh lockfile consistently.
- shadow-cljs.edn
  - Issue: Large diffs show a massive rework of source-paths and builds; risk of missing sources. Validate that the intended surface matches the real repo structure; if this is a plan to consolidate, document the migration plan and ensure CI/builds reflect it.
- other submodule pointers
  - Issue: Many Subproject commits show "+dirty" suffixes; ensure local state consistency by updating to clean commits on CI.

### Immediate verifications performed
- Git status/diffs gathered for current changes (see above). Performed a targeted inspection of changed files to surface the above issues.
- Read the changed regions in cephalon.cljs and cephalon-ts to validate env var usage; confirmed the literal string bug is present in the first duck-cephalon-ts app.
- Prepared actionable patches to fix critical config/tokens and to tighten dependency pinning.
