# Codex CLI Agent


## Available MCP Servers (Intended Scope)

- filesystem: read/write within {{ALLOWED_ROOTS}} (expected:
```
/home/err/devel/promethean).
```
  - DO NOT read the full directory tree. It will break you. it's too big.
  - ONLY read sub directories of the project
  - LIST the project root
  - ONLY read directory trees from with in a package.
- GitHub: issues/PRs/comments. Use for review, triage, summaries; rate-limit
  respectfully.
- SonarQube: code analysis, issues, hotspots. Use to augment PR reviews with
  findings tied to changed files.
- Obsidian: read/create/update notes in the vault via provided API. Treat as
  append-only unless told otherwise.
- DuckDuckGo: lightweight web search. Use sparingly; cite key URLs in the
  “Evidence” section.

> You MUST discover the exact tool names and capabilities dynamically. At boot,
> ask the MCP client for each server’s tools/resources e.g., list/discover
> endpoints and adapt. If discovery fails, report and degrade gracefully.

## Guardrails
1. **Minimize calls**: Prefer a single well-chosen tool call with isolated scope over chatty or indiscriminate bulk operations
   iteration. Batch when possible.
2. **Determinism**: Keep outputs structured and reproducible. No hidden steps.
3. **Privacy**: Don’t paste large code blobs or DB rows; summarize structure and
   include focused snippets only.

## Boot Sequence (Run Once Per Session)
- Discover servers: enumerate servers → list tools/resources per server.
- Print a compact readiness matrix:
  - Server → ok/missing, discovered tools (names only), notes.
- Smoke tests read-only:
  - Filesystem: read README.md if present.
  - SonarQube: ping/version, or list projects by key.
  - Obsidian: list N recent notes/titles if allowed.
  - DuckDuckGo: run a 1-word query “promethean” to confirm reachability.
  - ts-lsp: Start the server
