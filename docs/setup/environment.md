# Piper Environment Configuration Guide

> **Scope:** This document covers the environment variables and service dependencies required for Promethean's AI-assisted Piper pipelines (symdocs, readmeflow, docops, semverguard, sonar, eslint-tasks, etc.).

## 1. Quick start checklist

1. Copy `.env.example` to `.env` (or `.env.local`) in the repo root.
2. Verify an [Ollama](https://ollama.ai/docs) service is reachable at the URL you configured.
3. Pull the required models once per host: `ollama pull qwen3:4b` and `ollama pull nomic-embed-text:latest`.
4. Fill in SonarQube and GitHub tokens if you intend to run the corresponding pipelines.
5. Reload your shell or export the variables before invoking `pnpm piper ...`.

```bash
cp .env.example .env
# edit .env to inject secrets, then:
source .env
```

> `.env` files are gitignored—never commit live credentials.

## 2. Environment variable reference

| Variable | Required? | Default | Used by | Notes |
| --- | --- | --- | --- | --- |
| `OLLAMA_URL` | Yes | `http://127.0.0.1:11434` | All AI pipelines | Endpoint for the Ollama API. Override when using a remote host.
| `OLLAMA_DISABLE` | No | `false` | Utilities consuming `@promethean/utils/ollama` | Set to `true` to bypass Ollama-dependent steps (scripts will no-op gracefully).
| `DEFAULT_MODEL` | No | `qwen3:4b` | Symdocs, semverguard, eslint-tasks (prompt generation) | Match the model you have downloaded or override per pipeline step arguments.
| `EMBED_MODEL` | No | `nomic-embed-text:latest` | docops, readmeflow, testgap | Embedding model tag used across pipelines.
| `SONAR_HOST_URL` | Conditionally (for sonar pipeline) | `https://sonarcloud.io` | Sonar pipeline | Use your self-hosted Sonar URL if not on SonarCloud.
| `SONAR_TOKEN` | Conditionally (for sonar pipeline) | _(none)_ | Sonar pipeline | Must have `analysis` rights for the target project.
| `SONAR_PROJECT_KEY` | Conditionally (for sonar pipeline) | `promethean` | Sonar pipeline | Project identifier passed to Sonar CLI tasks.
| `GITHUB_TOKEN` | Optional | _(none)_ | Board review, MCP GitHub tooling | PAT with `repo` scope recommended for cross-repo automation.

### How defaults are enforced

The shared utility [`packages/utils/dist/ollama.js`](../../packages/utils/dist/ollama.js) exports `OLLAMA_URL` with a fallback to `http://localhost:11434`. Scripts such as `scripts/piper-eslint-tasks.mjs` now import this helper, ensuring a deterministic default even when the variable is omitted. Pipelines that invoke binaries or shell commands still read from the environment; copying `.env.example` keeps those values synchronized.

## 3. OLLAMA service validation

1. **Service health** – confirm the daemon is reachable:
   ```bash
   curl "$OLLAMA_URL/api/tags"
   ```
   Expect a JSON payload containing available models. A connection error indicates the URL or port is incorrect.
2. **Model availability** – ensure required models are listed:
   ```bash
   ollama list | grep -E "qwen3:4b|nomic-embed-text:latest"
   ```
3. **Pipeline dry run** – execute a lightweight step, for example:
   ```bash
   pnpm --filter @promethean/docops doc:01-fm-ensure --model ${DEFAULT_MODEL:-qwen3:4b}
   ```
   The command should complete without throwing `ollama` connection errors.

If you need to run pipelines without AI capabilities (e.g., on CI without GPU access), set `OLLAMA_DISABLE=true` and ensure consuming scripts detect that flag before attempting remote calls.

## 4. SonarQube configuration

- `SONAR_HOST_URL` – SonarCloud users keep the default (`https://sonarcloud.io`). Self-hosted instances should expose an HTTPS endpoint accessible from your runner.
- `SONAR_TOKEN` – create a token with project analysis permissions. Store it in a secrets manager for CI and inject it via environment variables instead of committing it to `.env`.
- `SONAR_PROJECT_KEY` – align with the key defined in your SonarQube project settings (`Administration → Projects → Management`).

Validate the credentials by running the sonar fetch step:
```bash
pnpm --filter @promethean/sonarflow sonar:fetch --project "$SONAR_PROJECT_KEY"
```
If authentication fails, regenerate the token and confirm the host URL is reachable.

## 5. Optional GitHub access

Pipelines such as `board-review` or MCP GitHub tools require a `GITHUB_TOKEN` when they need to mutate issues, pull requests, or projects. The recommended scopes are:
- `repo` – read/write on repository contents.
- `project` – if you automate GitHub Projects operations.

When unavailable, these pipelines should degrade to read-only operations or emit actionable errors prompting you to supply the token.

## 6. Troubleshooting

| Symptom | Likely cause | Mitigation |
| --- | --- | --- |
| `fetch ECONNREFUSED` against `/api/generate` | `OLLAMA_URL` incorrect or daemon stopped | Restart Ollama (`ollama serve`) and confirm firewall rules; fallback to localhost default if unset. |
| Sonar pipeline exits with 401 | Missing/invalid `SONAR_TOKEN` | Generate a new token with correct scope and export before rerunning. |
| GitHub requests rate-limited | `GITHUB_TOKEN` missing | Supply a PAT or throttle the pipeline invocation. |
| Pipelines skip AI steps unexpectedly | `OLLAMA_DISABLE=true` in environment | Remove or set the variable to `false` for full functionality. |

Keep this document updated whenever new pipelines introduce additional secrets or external dependencies.
