# PR Sync Tool Suite

A comprehensive suite of tools for batch updating PR branches with intelligent conflict resolution powered by local LLMs.

## Overview

The PR Sync Tool Suite addresses the common need to update multiple PR branches with changes from a base branch (like lock file updates, dependency upgrades, or feature merges). It provides intelligent conflict resolution using local LLMs with rich context gathering.

## Tools

### 1. `pr-sync-tool.mjs` - Core Tool

General-purpose PR batch update tool with LLM-powered conflict resolution.

**Features:**
- Batch update multiple PR branches
- Intelligent conflict resolution using local LLMs
- Context gathering with symbol search
- Automatic fallback strategies
- Detailed logging and reporting

**Usage:**
```bash
# Basic usage
node pr-sync-tool.mjs --base main --resolution llm

# Dry run to see what would happen
node pr-sync-tool.mjs --base dev/stealth --dry-run

# Use different conflict resolution strategies
node pr-sync-tool.mjs --base main --resolution theirs  # Lock file updates
node pr-sync-tool.mjs --base main --resolution ours    # Conservative approach
```

**Options:**
- `--base <branch>`: Base branch to merge from (default: main)
- `--resolution <mode>`: Conflict resolution mode - llm, ours, theirs, manual (default: llm)
- `--model <model>`: LLM model for conflict resolution (default: qwen2.5-coder:7b)
- `--dry-run`: Simulate updates without pushing changes
- `--no-context`: Disable context gathering for LLM resolution

### 2. `enhanced-pr-sync.mjs` - Advanced Tool

Enhanced version with ChromaDB integration and advanced context gathering.

**Additional Features:**
- Semantic code search using ChromaDB
- Symbol extraction and context gathering
- Preflight conflict detection
- Advanced LLM prompts with codebase awareness
- Enhanced fallback strategies

**Usage:**
```bash
# Full semantic merge with ChromaDB
node enhanced-pr-sync.mjs --base main --chroma --resolution llm

# Preflight check only
node enhanced-pr-sync.mjs --base dev/stealth --dry-run

# Force update despite warnings
node enhanced-pr-sync.mjs --base main --force
```

**Additional Options:**
- `--chroma`: Enable ChromaDB semantic search for context
- `--force`: Proceed despite preflight warnings

### 3. `update-stealth-prs.sh` - Convenience Script

Bash script for quickly updating PRs targeting `dev/stealth` branch.

**Usage:**
```bash
# Standard update
./update-stealth-prs.sh

# Dry run
./update-stealth-prs.sh --dry-run

# Use specific preset
./update-stealth-prs.sh --preset lockfile-update
```

### 4. `pr-sync-config.json` - Configuration

Configuration file with presets and conflict resolution strategies.

**Presets:**
- `lockfile-update`: Fast updates using base branch version
- `intelligent-merge`: Smart LLM-powered resolution
- `conservative`: Preserve PR changes when in doubt
- `stealth-updates`: Optimized for dev/stealth branch

## Conflict Resolution Strategies

### 1. LLM Resolution (`llm`)

Uses local LLM (Ollama) to intelligently resolve conflicts with context.

**Best for:**
- Code files with semantic meaning
- Documentation conflicts
- Complex merge scenarios

**Context gathered:**
- Git diff and history
- Symbol search results
- Related file context
- Recent commits

### 2. Theirs Resolution (`theirs`)

Always take the base branch version.

**Best for:**
- Lock file updates
- Generated files
- Dependency upgrades

### 3. Ours Resolution (`ours`)

Always preserve the PR branch version.

**Best for:**
- Conservative updates
- Feature branches
- Manual review required

### 4. Manual Resolution (`manual`)

Leave conflicts for manual resolution.

**Best for:**
- Critical merge decisions
- Complex architectural changes
- When human judgment is required

## Setup

### Prerequisites

1. **GitHub CLI** (for PR management):
```bash
# Install and authenticate
gh auth login
```

2. **LLM Provider** (at least one required for intelligent conflict resolution):

   **Option A: Ollama (Local)**
   ```bash
   # Install Ollama
   curl -fsSL https://ollama.ai/install.sh | sh

   # Pull recommended models
   ollama pull qwen2.5-coder:7b
   ollama pull qwen2.5-coder:32b  # For more complex conflicts

   # Start Ollama service
   ollama serve
   ```

   **Option B: OpenAI API**
   ```bash
   export OPENAI_API_KEY=your_api_key
   export OPENAI_MODEL=gpt-4  # optional
   ```

   **Option C: ZAI (OpenAI-compatible)**
   ```bash
   export ZAI_API_KEY=your_api_key
   export ZAI_BASE_URL=your_base_url
   ```

   **Option D: OpenRouter**
   ```bash
   export OPENROUTER_API_KEY=your_api_key
   export OPENROUTER_MODEL=qwen/qwen-2.5-coder-7b-instruct
   ```

3. **Optional: ChromaDB** (for semantic search):
```bash
# Set up ChromaDB for enhanced context gathering
# (Integration details in pr-sync-config.json)
```

### Quick Setup

Use the interactive setup script to configure providers:

```bash
./setup-llm-env.sh
```

Or configure manually:

```bash
# Test current configuration
node test-llm-providers.mjs

# Example: Use OpenAI as fallback
export OPENAI_API_KEY=sk-...
node pr-sync-tool.mjs --base main --resolution llm

# Example: Use ZAI as primary
export ZAI_API_KEY=your_key ZAI_BASE_URL=https://your-endpoint.com
node pr-sync-tool.mjs --base main --resolution llm
```

### Configuration

Edit `pr-sync-config.json` to customize:
- Presets for different scenarios
- Conflict resolution strategies
- LLM model selection
- Context gathering options

## Examples

### Lock File Updates

Quick update of all PRs with latest lock file changes:

```bash
node pr-sync-tool.mjs --base main --resolution theirs
```

### Feature Branch Updates

Update all PRs with new feature changes:

```bash
node enhanced-pr-sync.mjs --base main --chroma --resolution llm
```

### Dev/Stealth Updates

Update PRs targeting the dev/stealth branch:

```bash
./update-stealth-prs.sh
```

### Preflight Analysis

Check for potential conflicts before updating:

```bash
node enhanced-pr-sync.mjs --base main --dry-run
```

## Architecture

### Multi-Provider LLM System

The tools support multiple LLM providers with automatic fallback:

1. **Ollama (Local)**: Preferred for privacy and speed
   - Models: qwen2.5-coder:7b, qwen2.5-coder:32b
   - Environment: `OLLAMA_ENABLED=true`, `OLLAMA_MODEL=...`

2. **OpenAI API**: Cloud-based with high-quality models
   - Models: GPT-4, GPT-3.5-turbo
   - Environment: `OPENAI_API_KEY=...`, `OPENAI_MODEL=...`

3. **ZAI (OpenAI-compatible)**: Custom endpoints
   - Models: qwen2.5-coder-7b-instruct
   - Environment: `ZAI_API_KEY=...`, `ZAI_BASE_URL=...`

4. **OpenRouter**: Multi-model access
   - Models: qwen/qwen-2.5-coder-7b-instruct
   - Environment: `OPENROUTER_API_KEY=...`, `OPENROUTER_MODEL=...`

**Fallback Order**: Ollama → OpenAI → ZAI → OpenRouter → Manual

### Context Gathering

The tools gather multiple types of context for LLM resolution:

1. **Git Context**: Diff, history, commit messages
2. **Symbol Context**: Function/class definitions and usage
3. **File Context**: Related files and dependencies
4. **Semantic Context**: Similar code patterns (with ChromaDB)

### Fallback Strategies

Multi-layer fallback system:
1. **Multi-Provider LLM**: Intelligent resolution with provider fallback
2. **Rule-based**: File pattern matching (lock files, generated files)
3. **Manual**: Human intervention for complex cases

### Provider Selection Strategy

- **Local First**: Prefer Ollama for privacy and speed
- **Automatic Fallback**: Switch to API providers when local unavailable
- **Error Recovery**: Retry with different providers on failure
- **Transparent Switching**: Users see which provider is being used

## Best Practices

1. **Always run with `--dry-run` first** to understand potential impacts
2. **Use appropriate conflict resolution** for your use case
3. **Configure presets** for common scenarios
4. **Monitor LLM performance** and choose models accordingly
5. **Use preflight checks** for critical updates
6. **Review results** especially for first-time usage

## Troubleshooting

### LLM Resolution Fails

1. Check Ollama is running: `ollama list`
2. Verify model is available: `ollama show qwen2.5-coder:7b`
3. Increase timeout: Use larger models or increase `llm.timeout`
4. Check context size: Reduce `llm.contextWindow` for large files

### Context Gathering Issues

1. Verify ripgrep is installed: `rg --version`
2. Check file permissions: Ensure read access to all files
3. Exclude patterns: Update `excludePatterns` in config

### Merge Conflicts

1. Use `--force` to proceed despite warnings
2. Switch to manual resolution for critical conflicts
3. Check branch status and rebase strategy

## Contributing

The tool suite is designed to be extensible:

1. **Add new conflict resolution strategies** in the core classes
2. **Extend context gathering** with additional data sources
3. **Create new presets** for specific workflows
4. **Integrate additional LLM providers** beyond Ollama

## License

Part of the Promethean project. See main project license for details.