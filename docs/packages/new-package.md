# New package workflow

Promethean packages are scaffolded with Nx so every service, library, and frontend follows the same functional TypeScript, AVA-first foundation. This guide walks through the generator presets, directory expectations, and the follow-up tasks you must complete before shipping a new workspace package.

## Nx generator presets

### Prerequisites

- Ensure `tools/generators/package` exists in the workspace.
- Confirm the generator path is registered under the `"plugins"` key in `nx.json`.
- Verify a base TypeScript config is present at `config/tsconfig.base.json`.

Run the shared generator from the repository root:

```bash
pnpm exec nx g tools:package <name> --preset <type>
```

Use one of the supported presets:

| Preset | When to use it | Key directories | Follow-up tasks |
| --- | --- | --- | --- |
| `library` | Shared functional TypeScript utilities, adapters, ports | `src/`, `src/tests/`, `dist/` | Flesh out AVA specs in `src/tests/`, ensure exports keep `.js` extensions, keep package license `GPL-3.0-only`. |
| `service` | Fastify-based APIs or background services | `src/`, `src/tests/`, `static/openapi/`, `dist/` | Register `@fastify/swagger` + `@fastify/swagger-ui`, expose `/openapi.json`, keep schemas in `static/openapi/`, serve `static/` and `dist/frontend/` when present. |
| `frontend` | Webcomponent frontends co-located with a service | `src/`, `src/frontend/`, `src/tests/`, `static/`, `dist/`, `dist/frontend/` | Build UI with webcomponents, wire static assets through `@fastify/static`, make sure Fastify host serves `dist/frontend` and `static`, cover UI logic with AVA-compatible tests. |

All presets emit ESM-ready builds, keep `.js` extensions in TypeScript imports, and enforce the GPL-3.0-only license string in `package.json`.

## Repository conventions to carry forward

- **Functional TypeScript.** Compose small pure functions, favour immutable data, and isolate side effects behind ports/adapters.
- **Ava tests in `src/tests`.** Generators provide stubs—expand them with deterministic specs and keep test-only helpers out of production paths.
- **Flat package layout.** Place sources under `src/`, frontends under `src/frontend/`, and assets under `static/`. Generated builds live in `dist/` and `dist/frontend/`.
- **Fastify integrations.** Service presets include scaffolding for `@fastify/swagger`, `@fastify/swagger-ui`, and `@fastify/static`. After generation, ensure `/openapi.json` returns the schema exported from `static/openapi/`.
- **Native ESM everywhere.** Maintain `.js` extensions in imports even in TypeScript sources so the compiled output remains valid.
- **License.** Do not change the default `"license": "GPL-3.0-only"` string in generated manifests.

## Follow-up checklist

1. Review the generated README and scripts; add `build`, `test`, `lint`, and `typecheck` entries if the generator stubbed placeholders.
2. Update OpenAPI definitions in `static/openapi/` (service preset) and wire them to Fastify routes that expose `/openapi.json`.
3. For frontend packages, confirm your bundler output lands in `dist/frontend/` and reference assets from `static/`.
4. Add additional Nx targets (e.g., `lint`, `storybook`) if the package needs them, but avoid touching files inside `repo/config/`. If a configuration change there is unavoidable, raise a task for a human operator instead of editing it yourself.
5. Run `pnpm lint:diff`, `pnpm test`, and `pnpm typecheck` for the new package before opening a pull request.

Keeping to this workflow ensures new packages integrate smoothly with automation pipelines, Fastify infrastructure, and our functional TypeScript standards.
