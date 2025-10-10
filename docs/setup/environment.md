# Environment Setup for Promethean

> **Scope:** Environment variables, service dependencies, and operational tips required for Promethean's AI-assisted Piper pipelines (symdocs, simtasks, readmeflow, docops, semverguard, sonar, eslint-tasks, etc.).
This guide covers setting up the environment variables required for Promethean's AI-powered piper pipelines.

## Quick Start

1. Copy `.env.example` to `.env` or `.env.local` in the repo root.
   ```bash
   cp .env.example .env
   ```
2. Set the Ollama endpoint you intend to use (defaults to localhost):
   ```bash
   # inside your .env/.env.local
   OLLAMA_URL=http://127.0.0.1:11434
   ```
3. Start Ollama and ensure required models are available:
   ```bash
   ollama serve
   ollama pull qwen3:4b
   ollama pull nomic-embed-text:latest
   ```
4. Fill in SonarQube and GitHub tokens if you plan to run those pipelines.
5. Reload your shell (or `source .env`) before invoking `pnpm piper ...`.
1. **Copy the environment template:**
   ```bash
   cp .env.example .env.local
   ```

> `.env` files are gitignored—never commit live credentials.
2. **Configure OLLAMA URL:**
   ```bash
   # Add to .env.local
   OLLAMA_URL=http://localhost:11434
   ```

3. **Start OLLAMA service:**
   ```bash
   ollama serve
   ```

4. **Download required models:**
   ```bash
   ollama pull qwen3:4b
   ollama pull nomic-embed-text:latest
   ```

## Required Services

### OLLAMA (AI Service)

**Installation:**
```bash
# Linux/macOS
curl -fsSL https://ollama.ai/install.sh | sh

# Or with package manager
brew install ollama  # macOS
# or
sudo apt install ollama  # Ubuntu/Debian
```

**Setup:**
```bash
# Start OLLAMA service
ollama serve

# Verify it's running
curl http://localhost:11434/api/tags

| Variable | Required? | Default / Example | Used by | Notes |
| --- | --- | --- | --- | --- |
| `OLLAMA_URL` | Yes | `http://127.0.0.1:11434` | All AI pipelines | Endpoint for the Ollama API. Override when using a remote host. |
| `OLLAMA_DISABLE` | No | `false` | Utilities consuming `@promethean/utils/ollama` | Set to `true` to bypass Ollama-dependent steps (scripts no-op gracefully). |
| `DEFAULT_MODEL` | No | `qwen3:4b` | Symdocs, semverguard, eslint-tasks | Match the model you have downloaded or override per invocation. |
| `EMBED_MODEL` | No | `nomic-embed-text:latest` | docops, readmeflow, test-gap | Embedding model tag used across pipelines. |
| `SONAR_HOST_URL` | Conditional | `https://sonarcloud.io` | Sonar pipeline | Use your self-hosted Sonar URL if not on SonarCloud. |
| `SONAR_TOKEN` | Conditional | _(none)_ | Sonar pipeline | Must have `analysis` rights for the target project. |
| `SONAR_PROJECT_KEY` | Conditional | `promethean` | Sonar pipeline | Project identifier passed to Sonar CLI tasks. |
| `GITHUB_TOKEN` | Optional | _(none)_ | Board-review, MCP GitHub tooling | PAT with `repo` scope recommended for automation. |
| `AUTH_TOKENS` | Optional | _(none)_ | SmartGPT bridge | Use hashed values if you enable static tokens. |
| `MCP_MONGO_URI` | Optional | `mongodb://127.0.0.1` | MCP services | Override when running services off-host. |
| `ZAI_API_KEY` / `ZAI_BASE_URL` | Optional | `https://api.z.ai/api/coding/paas/v4` | Experimental AI integrations | Only required when targeting Z AI endpoints. |
| `OPENAI_API_KEY` | Optional | _(none)_ | Alternate AI backends | Provide if routing pipelines through OpenAI-compatible APIs. |
# Pull required models
ollama pull qwen3:4b                 # Main reasoning model
ollama pull nomic-embed-text:latest  # Text embedding model
```

**Environment Variables:**
```bash
OLLAMA_URL=http://localhost:11434
DEFAULT_MODEL=qwen3:4b                    # Optional
EMBED_MODEL=nomic-embed-text:latest       # Optional
```

The shared utility [`packages/utils/dist/ollama.js`](../../packages/utils/dist/ollama.js) exports `OLLAMA_URL` with a fallback to `http://127.0.0.1:11434`. Scripts such as `scripts/piper-eslint-tasks.mjs` import this helper so automation keeps working even when the variable is omitted. Pipelines that invoke binaries or shell commands still read from the environment; copying `.env.example` keeps those values synchronized.
### SonarQube (Optional - for sonar pipeline)

## 3. OLLAMA service setup & validation
**Cloud Service:**
1. Sign up at [SonarCloud.io](https://sonarcloud.io)
2. Create a new project
3. Generate an API token from project settings

### Installation
```bash
# Linux/macOS quick install
curl -fsSL https://ollama.ai/install.sh | sh
**Self-Hosted:**
1. Install SonarQube using Docker or package manager
2. Create a project
3. Generate a token from Administration → Security → Users

# Alternative package managers
brew install ollama          # macOS
sudo apt install ollama      # Ubuntu/Debian
```
**Environment Variables:**
```bash
SONAR_HOST_URL=https://sonarcloud.io      # or your self-hosted URL
SONAR_TOKEN=your_generated_token
SONAR_PROJECT_KEY=promethean              # your project identifier
```

### Runtime checklist
```bash
# Start the daemon
ollama serve

# Confirm it is reachable
curl "$OLLAMA_URL/api/tags"

# Ensure the required models exist
ollama list | grep -E "qwen3:4b|nomic-embed-text:latest"
```

### Dry-run validation
```bash
pnpm --filter @promethean/docops doc:01-fm-ensure --model ${DEFAULT_MODEL:-qwen3:4b}
```
The command should complete without `ollama` connection errors. If you must run pipelines without AI capabilities (e.g., CI runners without GPU), set `OLLAMA_DISABLE=true` so scripts degrade gracefully.

## 4. SonarQube configuration
## Environment Files

### Cloud (SonarCloud)
1. Sign in to [SonarCloud](https://sonarcloud.io) and create a project.
2. Generate an analysis token (`My Account → Security → Tokens`).
3. Copy `.env.example` to `.env.local` and set `SONAR_HOST_URL`, `SONAR_TOKEN`, and `SONAR_PROJECT_KEY`.
### File Priority (highest to lowest)
1. System environment variables
2. `.env.local` (gitignored, for local development)
3. `.env` (can be committed for development teams)
4. Default values in pipeline configuration

### Self-hosted
1. Install SonarQube (Docker or package manager).
2. Ensure the service is reachable from your runner.
3. Create a project and token under `Administration → Security → Users`.

Validate the credentials by running:
### Recommended Setup

**Local Development:**
```bash
# Use .env.local for personal development
cp .env.example .env.local
# Edit .env.local with your local settings
```

## 5. Environment files & precedence
**Team Development:**
```bash
# Use .env for shared development settings
# Keep sensitive values in .env.local
```

1. System environment variables
2. `.env.local` (gitignored, per-developer overrides)
3. `.env` (shared defaults for the repo)
4. Defaults baked into pipeline configuration
**Production:**
```bash
# Set environment variables directly in CI/CD system
# Never commit production secrets to version control
```

Recommended workflow:
```bash
# Local development
cp .env.example .env.local
# Edit .env.local with per-host overrides
```
For production/CI, inject values via your secrets manager instead of committing them.
## Pipeline-Specific Requirements

## 6. Pipeline coverage
### AI-Powered Pipelines (require OLLAMA_URL)

### AI-powered pipelines (require `OLLAMA_URL` unless `OLLAMA_DISABLE=true`)
- `symdocs` – documentation generation
- `simtasks` – task clustering
- `semver-guard` – version planning
- `board-review` – task evaluation
- `readmes` – README synthesis
- `buildfix` – automated remediation
- `test-gap` – coverage analysis
- `docops` – document processing
- `eslint-tasks` – lint triage

### External service pipelines
- `sonar` – requires all `SONAR_*` variables
- `board-review` / MCP GitHub helpers – optionally use `GITHUB_TOKEN`

## 7. Troubleshooting & diagnostics

| Symptom | Likely cause | Mitigation |
| --- | --- | --- |
| `fetch ECONNREFUSED` against `/api/generate` | `OLLAMA_URL` incorrect or daemon stopped | Restart Ollama (`ollama serve`) and confirm firewall rules; fallback to localhost default if unset. |
| Sonar pipeline exits with 401 | Missing/invalid `SONAR_TOKEN` | Generate a new token with correct scope and export before rerunning. |
| GitHub requests rate-limited | `GITHUB_TOKEN` missing | Supply a PAT or throttle the pipeline invocation. |
| Pipelines skip AI steps unexpectedly | `OLLAMA_DISABLE=true` in environment | Remove or set the variable to `false` for full functionality. |
These pipelines will fail without proper OLLAMA configuration:
- `symdocs` - Documentation generation
- `simtasks` - Task generation and clustering
- `semver-guard` - Version planning
- `board-review` - Task evaluation
- `readmes` - README generation
- `buildfix` - Automated error fixing
- `test-gap` - Test coverage analysis
- `docops` - Document processing
- `eslint-tasks` - ESLint violation task generation

Additional commands:
```bash
# Inspect active environment settings
env | grep -E "OLLAMA|SONAR|GITHUB"

# Smoke-test generation
curl -X POST "$OLLAMA_URL/api/generate" \
  -H "Content-Type: application/json" \
  -d '{"model":"qwen3:4b","prompt":"test","stream":false}'
```
If the daemon appears sluggish under load, restart it (`pkill ollama && ollama serve`) before rerunning pipelines and monitor logs for GC pauses.

## 8. Security notes

- Never commit `.env.local` or files containing real secrets.
- Use separate tokens per environment and rotate them regularly.
- Scope tokens minimally (e.g., `repo` for GitHub PATs).
- Prefer secrets managers for CI/CD instead of plaintext files.

## 9. Advanced configuration

### Custom model or remote Ollama host
```bash
DEFAULT_MODEL=llama3.1:8b
EMBED_MODEL=nomic-embed-text:latest
OLLAMA_URL=https://your-ollama-instance.example.com:11434
```

### Docker Compose snippet
```yaml
services:
  ollama:
    image: ollama/ollama
    ports:
      - "11434:11434"
    environment:
      - OLLAMA_HOST=0.0.0.0
    volumes:
      - ollama_data:/root/.ollama

volumes:
  ollama_data:
```

### CI/CD injection example
```yaml
# .github/workflows/pipelines.yml
env:
  OLLAMA_URL: ${{ secrets.OLLAMA_URL }}
  SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
  SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

Keep this document updated whenever new pipelines introduce additional secrets or external dependencies.
### External Service Pipelines

**Sonar Pipeline (requires all SONAR_* variables):**
```bash
pnpm --filter @promethean/piper piper run sonar
```

**Board Review Pipeline (may use GITHUB_TOKEN):**
```bash
pnpm --filter @promethean/piper piper run board-review
```

## Troubleshooting

### OLLAMA Issues

**Service not running:**
```bash
# Check if OLLAMA is running
curl http://localhost:11434/api/tags

# Start OLLAMA
ollama serve
```

**Missing models:**
```bash
# List available models
ollama list

# Pull required models
ollama pull qwen3:4b
ollama pull nomic-embed-text:latest
```

**Connection refused:**
- Ensure OLLAMA service is running
- Check if port 11434 is available
- Verify OLLAMA_URL in environment

### Pipeline Failures

**Environment variable issues:**
```bash
# Check current environment
env | grep -E "OLLAMA|SONAR|GITHUB"

# Test OLLAMA connection
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{"model": "qwen3:4b", "prompt": "test", "stream": false}'
```

**Missing configuration:**
- Verify all required environment variables are set
- Check `.env` file format (no spaces around `=`)
- Ensure proper quoting for values with special characters

## Development Workflow

### Running AI-Powered Pipelines
```bash
# Test a specific pipeline
pnpm --filter @promethean/piper piper run symdocs --config pipelines.json

# Run all AI pipelines (requires full setup)
pnpm --filter @promethean/piper piper run symdocs,simtasks,readmes
```

### Verifying Setup
```bash
# Test OLLAMA integration
node -e "
fetch(process.env.OLLAMA_URL + '/api/tags')
  .then(r => r.json())
  .then(d => console.log('Available models:', d.models.map(m => m.name)))
"

# Test pipeline configuration
pnpm --filter @promethean/piper piper list
```

## Security Notes

- **Never commit** `.env.local` or any file containing real secrets
- **Use different tokens** for development and production
- **Rotate tokens regularly** especially if accidentally exposed
- **Use environment-specific configurations** (dev/staging/prod)
- **Limit token permissions** to only what's necessary

## Advanced Configuration

### Custom Model Configuration
```bash
# Override default models
DEFAULT_MODEL=llama3.1:8b
EMBED_MODEL=nomic-embed-text:latest

# Use remote OLLAMA service
OLLAMA_URL=https://your-ollama-instance.com:11434
```

### Docker Integration
```yaml
# docker-compose.yml
services:
  ollama:
    image: ollama/ollama
    ports:
      - "11434:11434"
    environment:
      - OLLAMA_HOST=0.0.0.0
    volumes:
      - ollama_data:/root/.ollama

volumes:
  ollama_data:
```

### CI/CD Integration
```yaml
# .github/workflows/pipelines.yml
env:
  OLLAMA_URL: ${{ secrets.OLLAMA_URL }}
  SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
  SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```