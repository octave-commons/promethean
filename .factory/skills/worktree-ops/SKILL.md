---
name: worktree-ops
description: "Create/manage git worktrees for the devel root repo or any submodule, stored at <repo>/.worktrees/<branch>"
---

# Skill: Worktree Operations

## Goal
Create and manage git worktrees for either:
- the root `devel` workspace repo, or
- any submodule repo under `orgs/**` or `services/**`,

using a consistent, discoverable convention:

```
<repo-path>/.worktrees/<branch-name>/
```

This is specifically intended for PR/work-in-parallel workflows.

## Use This Skill When
- You want to work on a branch without disturbing your current checkout.
- You are asked to “open a PR” / “spin up a worktree for branch X”.
- You need parallel checkouts (e.g. compare `main` vs feature branch).

## Do Not Use This Skill When
- A simple `git checkout <branch>` is sufficient (no parallel checkout needed).
- The repo has uncommitted changes you are not ready to stash/commit.

## Inputs
- `REPO_PATH`: path to the git repo (e.g. `.` or `orgs/open-hax/openhax`).
- `BRANCH`: branch name (existing or new).
- `BASE` (optional): base ref for new branches (default: `origin/main`).

## Safety / invariants
- **Never** place worktrees under `.opencode/`.
  - Worktrees contain their own `.git` file and can be misdetected/added as a submodule gitlink if you ever run `git add -A`.
- This repo git-ignores `.worktrees/` at the root.
  - For submodules, prefer adding `/.worktrees/` to that repo’s local ignore (`.git/info/exclude`) or global ignore (`core.excludesfile`) so the submodule doesn’t show as dirty.

## Steps

### 1) Preflight
```bash
git -C "$REPO_PATH" rev-parse --show-toplevel
git -C "$REPO_PATH" status --porcelain=v1
git -C "$REPO_PATH" fetch --all --prune
```

### 2) Create a worktree for an existing branch
```bash
git -C "$REPO_PATH" worktree add \
  "$REPO_PATH/.worktrees/$BRANCH" \
  "$BRANCH"
```

### 3) Create a worktree for a new branch
```bash
BASE=${BASE:-origin/main}

git -C "$REPO_PATH" worktree add \
  "$REPO_PATH/.worktrees/$BRANCH" \
  -b "$BRANCH" "$BASE"
```

### 4) Verify
```bash
git -C "$REPO_PATH" worktree list
```

If operating inside the `devel` superproject, also verify submodules didn’t get broken:
```bash
git submodule status --recursive
```

### 5) Remove a worktree (after merge)
```bash
rm -rf "$REPO_PATH/.worktrees/$BRANCH"
git -C "$REPO_PATH" worktree prune -v
```

## Output
- A worktree directory at `<repo-path>/.worktrees/<branch-name>`.
- No changes to `.gitmodules` and no new gitlinks created.

## References
- Worktree policy: `docs/worktrees-and-submodules.md`
- Submodule safety: `.opencode/skills/submodule-ops/SKILL.md`
