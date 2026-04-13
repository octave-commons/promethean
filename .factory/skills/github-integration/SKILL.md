---
name: github-integration
description: "Perform GitHub operations across all tracked repositories in orgs/**, including issue/PR management, repository synchronization, and automation workflows"
---

# Skill: GitHub Integration

## Goal
Perform GitHub operations across all tracked repositories in `orgs/**`, including issue/PR management, repository synchronization, and automation workflows.

## Use This Skill When
- You need to interact with GitHub from multiple repositories
- You need to project issues/PRs into the workspace
- You need to mirror PRs between repositories
- You need to run GitHub CLI commands across multiple orgs

## Do Not Use This Skill When
- You are only working in a single repository
- The task is unrelated to GitHub operations

## Inputs
- GitHub repository (owner/repo format)
- GitHub action (issues, PRs, branches, etc.)
- GitHub token (required for most operations)

## Steps
1. **Project Issues/PRs**: Use `src/issues/projector.ts` to mirror issues/PRs into workspace
2. **Mirror PRs**: Use `mirror-prs.ts` to sync PRs between repositories
3. **Run GitHub CLI**: Use `gh` command with repository context
4. **Handle Authentication**: Requires `GITHUB_TOKEN` environment variable with `repo` scope

## Output
- Issues/PRs projected into structured markdown files
- Mirror PRs created between repositories
- GitHub CLI command results

## Strong Hints
- **Token Required**: Most operations require `GITHUB_TOKEN` environment variable
- **Scope**: Token must have `repo` scope for PRs and issues
- **Repository Context**: Always specify repo for `gh` commands
- **Rate Limits**: Octokit handles rate limits automatically
- **Output Structure**: Issues/PRs organized under `issues/org/<owner>/<repo>/`

## Common Commands

### Project Issues and PRs
```bash
# Project everything for all tracked repos
GITHUB_TOKEN=<token> pnpm issues:project

# Clean output first
GITHUB_TOKEN=<token> pnpm issues:project -- --clean

# Project only issues
GITHUB_TOKEN=<token> pnpm issues:project -- --type issues

# Project only open PRs
GITHUB_TOKEN=<token> pnpm issues:project -- --type prs --state open

# Limit to specific repo
GITHUB_TOKEN=<token> pnpm issues:project -- --repo riatzukiza/promethean
```

### Mirror PRs Between Repositories
```bash
# Mirror PRs from sst/opencode to riatzukiza/opencode
bun mirror-prs.ts

# This syncs dev branches and creates missing mirror PRs
```

### Run GitHub CLI Commands
```bash
# List issues for a repo
GITHUB_TOKEN=<token> gh issue list --repo owner/repo --state open

# Create PR
GITHUB_TOKEN=<token> gh pr create --repo owner/repo --title "PR Title" --body "PR description"

# List PRs
GITHUB_TOKEN=<token> gh pr list --repo owner/repo --state open

# Check repo status
GITHUB_TOKEN=<token> gh repo view owner/repo
```

## References
- Issues projector: `src/issues/projector.ts`
- Mirror PRs script: `mirror-prs.ts`
- Giga watch with GitHub: `src/giga/giga-watch.ts`
- PR mirroring docs: `docs/pr-mirroring.md`

## Important Constraints
- **Token Required**: Most operations require `GITHUB_TOKEN` environment variable
- **Scope**: Token must have `repo` scope for PRs and issues
- **Repository Discovery**: Discovers all tracked submodules under `orgs/`
- **Output Structure**: Issues/PRs organized under `issues/org/<owner>/<repo>/`
- **Rate Limits**: Octokit handles rate limits automatically

## Error Handling
- **Missing Token**: Exits with error if `GITHUB_TOKEN` not set
- **Network Errors**: GitHub API errors handled gracefully by Octokit
- **Rate Limits**: Octokit automatically handles rate limits
- **Invalid Options**: Validates repo, type, state options

## Data Models
- **IssueThread**: Number, title, state, url, author, labels, assignees, milestone, body, comments
- **PullRequestProjection**: Full PR with reviews, comments, files
- **ReviewProjection**: Review state, body, submittedAt, author, comments
- **ReviewComment**: Review ID, position, path, diffHunk, line, body, author

## Submodule Integration
- **Issue Projection**: Discovers all tracked submodules under `orgs/`
- **PR Mirroring**: Only mirrors PRs created by specific user (riatzukiza)
- **Remote Configuration**: Requires both source and target remotes configured
- **Branch Strategy**: Uses `dev` branch for mirroring
