# Spec: Commander maximization for @promethean/docs-cli

## Scope

Make the docs CLI "most commander-y" by adopting Commander.js features across the `search`, `view`, and `tasks` commands with strong UX, validation, and help. Keep existing behaviors (search, tasks summary) while enhancing ergonomics and error handling.

## Code references

- cli/docs/src/cli.ts:57-181 — search helpers, keyword/regex/fuzzy/semantic search logic and table output
- cli/docs/src/cli.ts:184-266 — tasks summary aggregation and output
- cli/docs/src/cli.ts:268-319 — Commander wiring for commands/options, CLI entry guard
- cli/docs/src/cli.test.ts:1-91 — current JSON-path tests for keyword search and tasks summary
- cli/docs/README.md:1-43 — usage examples and documented entrypoints
- cli/docs/package.json:1-27 — scripts, dependencies (commander^12)
- cli/docs/vitest.config.ts:1-21 — test setup with alias

## Known issues / PRs

- No open issues/PRs referenced in repo for this CLI (manual scan).

## Requirements / definition of done

- Enrich Commander usage: validations, required/optional/variadic args as appropriate, aliases, choices/env/defaults/custom parsers, help customizations (help command/options/groups, banners), hooks, parsing config, error/help-after-error, suggestion toggles as needed.
- Strong error handling: invalid mode, invalid regex, missing files/args should surface clear commander-driven errors (non-zero exit when appropriate).
- Improved UX: categorized help, global options, shared flags with inheritance, custom help text, examples banner.
- Add tests covering new commander wiring (option parsing, aliases, help/showHelpAfterError hooks, error paths, markdown output tables) without removing existing functional coverage.
- Keep semantic search stub messaging intact but presented via commander error/info path.
- Documentation updated to reflect new flags/options/help usage.
- CLI continues to run via `pnpm --filter @promethean/docs-cli ...` with commands succeeding; tests pass.
