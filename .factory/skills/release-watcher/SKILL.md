---
name: release-watcher
description: "Monitor upstream releases for OpenAI codex and SST opencode repositories, detect changes, and create GitHub issues for release impact analysis"
---

# Skill: Release Watcher

## Goal
Monitor upstream releases for OpenAI `codex` and SST `opencode` repositories, detect changes, and create GitHub issues for release impact analysis.

## Use This Skill When
- You need to track upstream releases for monitoring
- You need to detect breaking changes in releases
- You need to create issues for potential problems
- You need to analyze release diffs and impact on downstream projects

## Do Not Use This Skill When
- You are not monitoring releases
- The change is unrelated to codex or opencode releases
- You don't need to analyze release impact

## Inputs
- Upstream repository (codex or opencode)
- Previous reviewed tag for comparison
- GitHub token for issue creation

## Steps
1. **Poll Releases**: Script polls releases daily or on demand
2. **Detect Diffs**: Compares current release with last reviewed tag
3. **Analyze Impact**: Identifies changes that could break downstream integrations
4. **Create Issues**: Creates GitHub issues labeled `codex-release-watch`
5. **Update State**: Updates `.github/release-watch/state.json` for next diff

## Output
- Analysis of release impact
- GitHub issues created for potential problems
- Updated state file for tracking

## Strong Hints
- **Polling**: Runs daily or on demand via GitHub Actions workflow
- **Release Context**: Uses `release-context.md` for release metadata and plugin touchpoints
- **Diff Analysis**: Uses `release-diff.patch` for raw git diff
- **Agent Guidance**: Uses `.opencode/agent/release-impact.md` for analysis schema
- **Output Format**: JSON schema for impact analysis
- **Required Secrets**: Requires `OPENCODE_API_KEY` and optionally `RELEASE_WATCH_MODEL`

## Common Commands

### Manual Release Poll
```bash
# Poll codex releases
bun run scripts/codex-release-monitor.mjs --repo openai/codex --tag latest

# Poll opencode releases
bun run scripts/codex-release-monitor.mjs --repo sst/opencode --tag latest

# Poll specific tag
bun run scripts/codex-release-monitor.mjs --repo openai/codex --tag v0.1.0
```

### Check Release State
```bash
# Check last reviewed tag
cat .github/release-watch/state.json

# Force re-poll
rm .github/release-watch/state.json
bun run scripts/codex-release-monitor.mjs --repo openai/codex --tag latest
```

## References
- Release monitor script: `scripts/codex-release-monitor.mjs`
- Release impact agent: `.opencode/agent/release-impact.md`
- Release watch workflow: `.github/workflows/codex-release-watch.yml`
- State file: `.github/release-watch/state.json`
- Release context: `release-context.md`

## Important Constraints
- **Daily Polling**: GitHub Actions workflow runs daily or on demand
- **State Tracking**: Script updates `.github/release-watch/state.json` with last reviewed tag
- **Labeling**: Issues are labeled `codex-release-watch`
- **Required Secrets**: Requires `OPENCODE_API_KEY` for OpenCode agent integration
- **Optional Model**: `RELEASE_WATCH_MODEL` repo var selects model (defaults to `openai/gpt-5-codex-high`)

## Analysis Schema
The release impact agent responds with JSON:
```json
{
  "impact": "none" | "needs-attention" | "breaking",
  "summary": "One-sentence release impact synopsis.",
  "issues": [
    {
      "title": "Concise issue title referencing release + subsystem",
      "body": "Markdown body describing evidence, files, and mitigations."
    }
  ],
  "evidence": [
    {
      "path": "relative/path/to/file.ts",
      "description": "What changed and why it matters."
    }
  ],
  "notes": "Optional extra guidance for maintainers."
}
```

## Monitored Repositories
- **OpenAI Codex**: `openai/codex` (rust-v* tags)
- **SST Opencode**: `sst/opencode` (v* tags)

## Output Structure
```
.github/release-watch/
  state.json              # Last reviewed tag and timestamp
codex-release-watch/      # Issues created for potential problems
  <number>-<slug>/         # Issue folders
    thread.md              # GitHub issue thread
```

## Error Handling
- **No Changes**: If no new releases or no diff, script exits silently
- **Missing Token**: Exits with error if `OPENCODE_API_KEY` not set
- **Tag Errors**: Exits with error if tag doesn't exist
- **Diff Errors**: Logs errors but continues with analysis
