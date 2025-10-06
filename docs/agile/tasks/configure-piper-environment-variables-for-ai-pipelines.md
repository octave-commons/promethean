---
uuid: d4e5f6g7-h8i9-0123-defg-456789012345
title: Configure piper environment variables for AI-powered pipelines
status: todo
priority: P1
labels:
  - piper
  - environment
  - ai-configuration
  - ollama
  - setup
created_at: '2025-10-05T00:00:00.000Z'
---

## 🛠️ Task: Configure piper environment variables for AI-powered pipelines

## 🐛 Problem Statement

Multiple piper pipelines require AI model interactions (symdocs, readmes, semver-guard, board-review, sonar, docops) but fail due to missing or misconfigured environment variables. The OLLAMA_URL and other required environment variables are not properly set up.

## 🎯 Desired Outcome

All AI-powered piper pipelines should work reliably with:
- Properly configured OLLAMA_URL pointing to working AI service
- Required environment variables for external services (Sonar, GitHub, etc.)
- Clear documentation of required environment variables
- Graceful fallbacks when AI services are unavailable
- Development and production environment configurations

## 📋 Requirements

### Phase 1: Environment Variable Discovery
- [ ] Document all environment variables used across piper pipelines
- [ ] Identify which variables are required vs optional
- [ ] Check current environment variable status
- [ ] Create comprehensive environment variable documentation

### Phase 2: OLLAMA Service Setup
- [ ] Verify OLLAMA service is running and accessible
- [ ] Test OLLAMA_URL connectivity
- [ ] Ensure required AI models are available (qwen3:4b, nomic-embed-text:latest)
- [ ] Configure OLLAMA for development environment

### Phase 3: External Service Configuration
- [ ] Configure SonarQube connection variables (SONAR_HOST_URL, SONAR_TOKEN, SONAR_PROJECT_KEY)
- [ ] Set up GitHub token for board-review pipeline if needed
- [ ] Configure any other external service credentials
- [ ] Create .env template file

### Phase 4: Pipeline Testing
- [ ] Test each AI-powered pipeline with proper environment
- [ ] Verify AI model responses and functionality
- [ ] Test error handling when services are unavailable
- [ ] Validate pipeline outputs are generated correctly

## 🔧 Technical Implementation Details

### Required Environment Variables
```bash
# AI Service Configuration
OLLAMA_URL=http://localhost:11434          # OLLAMA service endpoint

# SonarQube Configuration (for sonar pipeline)
SONAR_HOST_URL=https://sonarcloud.io       # SonarQube server URL
SONAR_TOKEN=your_sonar_token               # SonarQube API token
SONAR_PROJECT_KEY=promethean               # Project identifier

# Optional: GitHub Configuration (for board-review pipeline)
GITHUB_TOKEN=your_github_token             # GitHub API token (optional)

# Optional: Custom Model Configuration
DEFAULT_MODEL=qwen3:4b                     # Default AI model
EMBED_MODEL=nomic-embed-text:latest        # Embedding model
```

### Environment Setup Files
1. **.env.example** - Template with all required variables
2. **.env.local** - Local development (gitignored)
3. **.env.production** - Production configuration template
4. **docs/setup/environment.md** - Environment setup documentation

### Pipeline Environment Variable Usage
- **symdocs**: OLLAMA_URL for doc generation
- **readmes**: OLLAMA_URL for README content
- **semver-guard**: OLLAMA_URL for version planning
- **board-review**: OLLAMA_URL for task evaluation
- **sonar**: SONAR_* variables for code analysis
- **docops**: OLLAMA_URL for document processing

### AI Model Requirements
```bash
# Required models for full functionality
ollama pull qwen3:4b                 # Main reasoning model
ollama pull nomic-embed-text:latest  # Text embedding model
```

## ✅ Acceptance Criteria

1. **Environment Documentation**: Complete list of required environment variables
2. **OLLAMA Service**: Running and accessible with required models
3. **Pipeline Success**: All AI-powered pipelines complete successfully
4. **Error Handling**: Graceful degradation when AI services are down
5. **Development Setup**: Easy local development environment setup
6. **Configuration Validation**: Pipelines validate environment before execution

## 🔗 Related Resources

- **OLLAMA Documentation**: https://ollama.ai/docs
- **SonarQube Setup**: https://docs.sonarqube.org/
- **Pipeline Definitions**: `pipelines.json` - environment variable references
- **Environment Scripts**: Any setup scripts in the repository
- **Docker Compose**: Potential OLLAMA service configuration

## 📝 Technical Notes

### OLLAMA Setup Instructions
```bash
# Install OLLAMA (if not already installed)
curl -fsSL https://ollama.ai/install.sh | sh

# Start OLLAMA service
ollama serve

# Pull required models
ollama pull qwen3:4b
ollama pull nomic-embed-text:latest

# Verify installation
curl http://localhost:11434/api/tags
```

### Environment Variable Priority
1. System environment variables
2. .env.local file
3. .env file
4. Default values in pipeline configuration

This configuration will enable the full power of the AI-powered piper pipelines, providing automated documentation, code analysis, and intelligent task generation capabilities.