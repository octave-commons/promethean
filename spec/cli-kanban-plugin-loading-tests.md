# cli/kanban plugin loading tests

## Context

We need coverage for the Kanban CLI feature that dynamically loads CLI plugins. Tests should exercise multiple plugin fixtures that emulate the different layouts/configs the loader needs to handle, while treating each plugin as independent (SDK/contract-compliant) modules.

Related: [[docs/AGENTS]] • [[packages/kanban/README]]

## Relevant code

- cli/kanban/src/cli/plugins.ts:13-37 – loads `EXTENSION_MODULES` via dynamic import, invokes `registerCli` when present, logs quietly otherwise.
- cli/kanban/src/cli/commander.ts:102-104 – integrates `loadCliExtensions` into CLI boot.
- cli/kanban/src/cli/extensions/advanced.ts:27-45 – example of an internal CLI extension registered via `registerCli`.

## Existing issues/PRs

- No related issues or PRs found during current review.

## Definition of done

- New AVA test(s) in cli/kanban validate CLI plugin loading across multiple plugin fixture shapes (e.g., package-style module, relative/extension module, and a no-op/invalid plugin), asserting proper registration and graceful skipping.
- Fixtures represent the directory/config structures required for plugin execution and treat each plugin as an independent module assuming SDK/contract compliance.
- Optional debug logging path remains safe (does not break when a plugin fails to load).
- Tests pass for @promethean-os/kanban without impacting other packages.

## Requirements / plan

- Add test helpers/fixtures for plugin modules reflecting distinct resolution patterns (package-style, extension-style, non-exporting module).
- Ensure `loadCliExtensions` is testable with injected modules/importer while keeping production behavior unchanged.
- Write AVA coverage that validates registerCli invocation payloads and skipping behavior when a plugin is missing or invalid.
- Keep tests isolated and file-system safe (use temp dirs or fixtures under src/tests/fixtures).
