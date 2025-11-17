# Orphan Package Analysis (2025-11-17)

## Background & Context

- **Workspace structure** is governed by `pnpm-workspace.yaml` (lines 1-35), which scopes packages under `packages/*`, nested `packages/*/*`, `.opencode/*`, `scripts/*/*`, and `tools/`. This defines the universe of potential internal packages to examine.
- The monorepo leverages Nx (`nx.json` lines 1-68) with `libsDir` set to `packages`, indicating that most reusable modules live there even if Nx does not explicitly list each one.
- Root `package.json` (lines 1-193) references numerous `@promethean-os/*` workspace dependencies, confirming that package-level dependencies are expressed through normal npm dependency fields and can be analyzed without Nx metadata.
- A repository-wide search (`rg -n "orphan package"`) produced no direct references to orphan package tracking, suggesting no existing report/issue presently covers this need.

## Problem Statement

Identify workspace packages that have **no importers**—i.e., no other workspace package depends on them via `dependencies`, `devDependencies`, `optionalDependencies`, or `peerDependencies`. These "orphan" packages may either be unused cruft or intended standalone entry points that merit validation.

## Requirements & Definition of Done

1. **Comprehensive Workspace Coverage**: include every package.json captured by workspace patterns (packages, nested packages, `.opencode`, `scripts`, `tools`).
2. **Dependency Graph Extraction**: parse each package's dependency fields to build a directed graph of workspace package relationships.
3. **Orphan Detection Logic**: flag packages with zero inbound edges (no other workspace package lists them as a dependency of any type). Root applications with only external consumers must still appear in the final list unless explicitly excluded by user direction.
4. **Human-Readable Report**: provide a list/table summarizing each orphan with package name and relative path. Include any caveats (e.g., CLI entry points expected to stay standalone).
5. **Reproducibility**: deliver script(s) or documented commands enabling re-running the analysis locally.

## Plan (Phased)

### Phase 1 – Workspace Enumeration & Criteria Confirmation

- Enumerate all package.json files matching workspace globs via `rg --files -g 'package.json' ...`.
- Parse each file to record `{name, directory}` and confirm whether it represents a publishable package (presence of `name`).
- Validate assumptions for "importers" (include dev/peer/optional deps) and document any exclusions.

### Phase 2 – Dependency Graph Construction

- Implement a Node.js script (can be ad-hoc via `node -e` or a temporary script under `scripts/analysis`) that:
  - Loads the enumerated package manifest data.
  - For each package, collects dependency fields (deps, devDeps, optionalDeps, peerDeps).
  - Builds adjacency/inbound maps limited to workspace package names.
- Optionally cache intermediate results (JSON) for easier inspection.

### Phase 3 – Orphan Detection & Reporting

- Using the constructed graph, identify packages with zero importers.
- Produce a sorted report (e.g., alphabetical) showing package name, relative path, and count of declared outbound dependencies for context.
- Summarize insights and highlight packages likely intentional singletons vs. probable dead code.
- Provide rerun instructions referencing the script/command path.

## Existing Issues / PRs

- None identified related to orphan packages (validated via ripgrep search mentioned above). If future issues surface, update this spec accordingly.

## Risks / Considerations

- Some packages may be consumed externally (CLI, SDK) and legitimately have zero internal importers; note these so downstream clean-up discussions consider business context.
- Scripts or tooling under `.opencode` and `scripts/` might not behave like publishable packages; ensure detection logic handles missing `name` fields gracefully.
- Large workspace size implies the script should avoid loading entire dependency trees repeatedly—prefer single pass parsing.

## Next Steps

1. Implement Phase 1 enumeration script and validate counts vs. expectations.
2. Build Phase 2 dependency graph data structure.
3. Run Phase 3 orphan detection, review results for false positives, and document findings in the task response.

## Progress Log (2025-11-17)

- Executed `rg --files -g 'package.json' packages .opencode scripts tools | node -e "…"` from the repo root to enumerate manifests and build the dependency graph per plan Phases 1-2.
- Parsed **133** manifests (128 unique package names). Flagged duplicate name cluster for `@promethean-os/kanban` (6 stryker sandboxes) but excluded it from orphan reporting because the main package has inbound edges.
- Identified **81 packages** with zero inbound workspace dependencies (e.g., `@promethean-os/agent-os-protocol`, `@promethean-os/ai-learning`, `@promethean-os/file-watcher`, `@promethean-os/promethean-cli`, `tools/package.json`). Many look like standalone CLIs/services that may be intentionally unreferenced.
- Captured JSON output (total/unique/duplicate/orphan counts plus per-package metadata) for downstream review; see task response for summarized highlights and rerun instructions.
