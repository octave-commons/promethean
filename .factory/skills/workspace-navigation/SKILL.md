---
name: workspace-navigation
description: "Locate the right repo, file, and pattern quickly in a multi-repo workspace with many submodules"
---

# Skill: Workspace Navigation

## Goal
Locate the right repo, file, and pattern quickly in a multi-repo workspace.

## Use This Skill When
- The request spans multiple modules or unknown locations.
- You need to identify "where" a feature or workflow lives.
- You must confirm patterns before editing.

## Do Not Use This Skill When
- The file path is already explicit and verified.
- The task is a single, known file edit.

## Inputs
- The user's target feature or workflow description.
- Any hints in `AGENTS.md` about repository structure.

## Steps
1. Locate the most likely repo under `orgs/**` or `src/`.
2. Identify 1-2 reference files that match the requested pattern.
3. Confirm the expected edit location before changing anything.

## Repository Structure References

**Cephalon Discord Agent System** (`orgs/octave-commons/cephalon-clj/`):
- **Multi-bot architecture**: Duck (`duck-*`) and OpenSkull (`skull-*`) processes
- **Profile system**: `CEPHALON_HOME/profiles/duck.edn`, `profiles/skull.edn`
- **Process files**: `ecosystem.pm2.clj` for PM2 deployment
- **Documentation**: `docs/duck-deployment.md` for deployment guides
- **Brain components**: `brain/src/cephalon/brain/` (agent, profiles, permissions)
- **Discord IO**: `discord-io/` for WebSocket RPC server
- **Configuration**: Look for profile schemas, agent registration, permission stores

**Common patterns**:
- Discord bot issues → `discord-io/` or `brain/src/cephalon/brain/tools/discord.clj`
- Profile configuration → `$CEPHALON_HOME/profiles/` or `brain/src/cephalon/brain/profiles/`
- Permission system → `brain/src/cephalon/brain/permission_store.clj`, `admin_ws.clj`
- PM2 deployment → `ecosystem.pm2.clj` in cephalon-clj root

## Cross-Reference Docs
- Use `docs/MASTER_CROSS_REFERENCE_INDEX.md` for ecosystem navigation.
- Check per-repo `CROSS_REFERENCES.md` files for integration issues.

## Strong Hints
- Prefer narrow searches first; widen only if needed.
- Use existing patterns as templates, not guesses.
- If patterns conflict, surface the ambiguity before editing.

## Output
- The file paths used as references and the planned edit location.
