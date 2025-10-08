# Environment Setup for Promethean

This guide covers setting up the environment variables required for Promethean's AI-powered piper pipelines.

## Quick Start

1. **Copy the environment template:**
   ```bash
   cp .env.example .env.local
   ```

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

### SonarQube (Optional - for sonar pipeline)

**Cloud Service:**
1. Sign up at [SonarCloud.io](https://sonarcloud.io)
2. Create a new project
3. Generate an API token from project settings

**Self-Hosted:**
1. Install SonarQube using Docker or package manager
2. Create a project
3. Generate a token from Administration → Security → Users

**Environment Variables:**
```bash
SONAR_HOST_URL=https://sonarcloud.io      # or your self-hosted URL
SONAR_TOKEN=your_generated_token
SONAR_PROJECT_KEY=promethean              # your project identifier
```

## Environment Files

### File Priority (highest to lowest)
1. System environment variables
2. `.env.local` (gitignored, for local development)
3. `.env` (can be committed for development teams)
4. Default values in pipeline configuration

### Recommended Setup

**Local Development:**
```bash
# Use .env.local for personal development
cp .env.example .env.local
# Edit .env.local with your local settings
```

**Team Development:**
```bash
# Use .env for shared development settings
# Keep sensitive values in .env.local
```

**Production:**
```bash
# Set environment variables directly in CI/CD system
# Never commit production secrets to version control
```

## Pipeline-Specific Requirements

### AI-Powered Pipelines (require OLLAMA_URL)

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