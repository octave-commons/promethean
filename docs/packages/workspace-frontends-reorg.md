# Frontend workspace reorganization (wave 1)

## Summary
- Added `packages/frontends/` and moved existing `-frontend` workspaces into the new namespace.
- Updated pnpm and Nx configuration to recognize nested package folders.
- Adjusted legacy documentation and generated metadata to point at the new paths.
- Captured the planned follow-up waves as agile tasks for services, libraries, and tooling packages.

## Moved packages
| Package | Previous path | New path |
```
| --- | --- | --- |
```
| `@promethean/docops-frontend` | `packages/docops-frontend` | `packages/frontends/docops-frontend` |
| `@promethean/health-dashboard-frontend` | `packages/health-dashboard-frontend` | `packages/frontends/health-dashboard-frontend` |
| `@promethean/llm-chat-frontend` | `packages/llm-chat-frontend` | `packages/frontends/llm-chat-frontend` |
| `@promethean/markdown-graph-frontend` | `packages/markdown-graph-frontend` | `packages/frontends/markdown-graph-frontend` |
| `@promethean/portfolio-frontend` | `packages/portfolio-frontend` | `packages/frontends/portfolio-frontend` |
| `@promethean/smart-chat-frontend` | `packages/smart-chat-frontend` | `packages/frontends/smart-chat-frontend` |
| `@promethean/smartgpt-dashboard-frontend` | `packages/smartgpt-dashboard-frontend` | `packages/frontends/smartgpt-dashboard-frontend` |

## Follow-up iterations
- [organize-backend-packages] — stage and execute the migration of services into `packages/services/`.
- [organize-library-packages] — design the taxonomy for library subgroups and prepare their move.
- [organize-tooling-packages] — consolidate CLI/tooling packages under a dedicated namespace.

## Next steps
- Run the new tasks through the agile workflow to scope each wave.
- Update CI pipelines once additional package groups are relocated.
