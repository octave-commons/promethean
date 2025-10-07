# PR Sync Tool - Usage Examples

## Quick Start Examples

### 1. Test Your Setup

```bash
# Check which LLM providers are available
node tools/test-llm-providers.mjs
```

### 2. Basic PR Updates

```bash
# Update PRs targeting main with LLM conflict resolution
node tools/pr-sync-tool.mjs --base main --resolution llm

# Update dev/stealth PRs (your common use case)
./tools/update-stealth-prs.sh
```

### 3. Provider Configuration

```bash
# Use OpenAI as backup when Ollama fails
export OPENAI_API_KEY=sk-your-openai-key
node tools/pr-sync-tool.mjs --base main --resolution llm

# Use ZAI as primary
export ZAI_API_KEY=your-zai-key
export ZAI_BASE_URL=https://your-zai-endpoint.com
node tools/pr-sync-tool.mjs --base main --resolution llm

# Use OpenRouter for latest models
export OPENROUTER_API_KEY=sk-your-openrouter-key
node tools/pr-sync-tool.mjs --base main --resolution llm
```

### 4. Dry Run Testing

```bash
# See what would happen without making changes
node tools/pr-sync-tool.mjs --base main --dry-run

# Preflight analysis
node tools/enhanced-pr-sync.mjs --base main --dry-run
```

### 5. Lock File Updates

```bash
# Fast lock file updates using "theirs" strategy
node tools/pr-sync-tool.mjs --base main --resolution theirs

# Or use the preset
node tools/pr-sync-tool.mjs --base main --preset lockfile-update
```

### 6. Advanced Usage

```bash
# Enhanced tool with ChromaDB semantic search
node tools/enhanced-pr-sync.mjs --base main --chroma --resolution llm

# Force update despite warnings
node tools/enhanced-pr-sync.mjs --base main --force

# Use specific model
node tools/pr-sync-tool.mjs --base main --model qwen2.5-coder:32b
```

## Real-World Scenarios

### Scenario 1: Dependency Update

You've updated a dependency and need to update all PRs with the new lock file:

```bash
# Update all PRs targeting main
node tools/pr-sync-tool.mjs --base main --resolution theirs
```

### Scenario 2: Feature Branch Merge

You've merged a feature to main and need to update related PRs:

```bash
# Use intelligent LLM resolution for code conflicts
node tools/pr-sync-tool.mjs --base main --resolution llm

# Or enhanced version with semantic context
node tools/enhanced-pr-sync.mjs --base main --chroma --resolution llm
```

### Scenario 3: Dev/Stealth Updates (Your Use Case)

Your common workflow for updating PRs targeting dev/stealth:

```bash
# Quick update with your configured APIs
./tools/update-stealth-prs.sh

# Or with more control
node tools/pr-sync-tool.mjs --base dev/stealth --resolution llm
```

### Scenario 4: Provider Fallback Example

When Ollama isn't available, the system automatically falls back to your APIs:

```bash
# Configure multiple providers
export OPENAI_API_KEY=sk-openai-key
export ZAI_API_KEY=zai-key
export ZAI_BASE_URL=https://zai-endpoint.com

# The system will try: Ollama → OpenAI → ZAI → OpenRouter
node tools/pr-sync-tool.mjs --base main --resolution llm
```

## Environment Setup

### One-Time Setup

```bash
# Run the interactive setup
./tools/setup-llm-env.sh

# Or configure manually
export OPENAI_API_KEY=your-key
export ZAI_API_KEY=your-key
export ZAI_BASE_URL=your-endpoint

# Test configuration
node tools/test-llm-providers.mjs
```

### Multiple Provider Configuration

```bash
# Configure all providers for maximum reliability
export OLLAMA_ENABLED=true
export OLLAMA_MODEL=qwen2.5-coder:7b
export OPENAI_API_KEY=sk-your-openai-key
export ZAI_API_KEY=your-zai-key
export ZAI_BASE_URL=https://your-zai-endpoint.com
export OPENROUTER_API_KEY=sk-your-openrouter-key

# The system will automatically use the best available provider
```

## Troubleshooting

### No LLM Providers Available

```bash
# Check what's configured
node tools/test-llm-providers.mjs

# Configure at least one provider
export OPENAI_API_KEY=your-key
```

### GitHub CLI Issues

```bash
# Install and authenticate GitHub CLI
curl -fsSL https://github.com/cli/cli/releases/download/v2.40.0/gh_2.40.0_linux_amd64.tar.gz | tar xz
sudo mv gh_2.40.0_linux_amd64/bin/gh /usr/local/bin/
gh auth login
```

### Permission Issues

```bash
# Ensure you can push to PR branches
git fetch origin
git checkout <pr-branch>
git push origin <pr-branch> --dry-run
```

### Ollama Issues

```bash
# Check if Ollama is running
ollama list

# Start Ollama service
ollama serve

# Pull required models
ollama pull qwen2.5-coder:7b
```

## Performance Tips

1. **Use Local First**: Configure Ollama for fastest resolution
2. **Set Appropriate Timeouts**: Increase timeout for large conflicts
3. **Use Dry Run**: Always test before actual updates
4. **Batch Updates**: Process multiple PRs at once
5. **Monitor Fallbacks**: Check provider performance in logs

```bash
# Monitor provider usage and fallbacks
node tools/pr-sync-tool.mjs --base main --resolution llm | grep "🤖\|⚠️"
```