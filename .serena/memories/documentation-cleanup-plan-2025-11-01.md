# Documentation Cleanup Plan - November 1, 2025

## High Priority Tasks

### 1. Complete TODO Service Descriptions (20 packages)
Need to research and replace "TODO: Add service description" in:
- docs/packages/tts/agents.md
- docs/packages/voice/agents.md 
- docs/packages/vision/agents.md
- docs/packages/stt/agents.md
- docs/packages/proxy/agents.md
- docs/packages/reasoner/agents.md
- docs/packages/llm/agents.md
- docs/packages/markdown-graph/agents.md
- docs/packages/file-watcher/agents.md
- docs/packages/heartbeat/agents.md
- docs/packages/health/agents.md
- docs/packages/embedding-service/agents.md
- docs/packages/discord-indexer/agents.md
- docs/packages/eidolon-field/agents.md
- docs/packages/discord-embedder/agents.md
- docs/packages/discord-attachment-indexer/agents.md
- docs/packages/discord-attachment-embedder/agents.md
- docs/packages/broker/agents.md
- docs/packages/cephalon/agents.md

### 2. Update Version Requirements
- Node.js: v16.0.0+ → v22.20.0+ (match package.json)
- Playwright: update to v1.56.0
- Other hardcoded version references

### 3. Fix Broken Internal Links
- ../docs/packages/omni-protocol/README.md 
- ../docs/packages/omni-protocol/guides/adapter-development.md
- Other relative path references

### 4. Update README Files with Usage Instructions
- packages/cli/README.md - Usage section
- packages/discord/README.md - Usage section

### 5. Correct Repository URLs
- kanban package.json: riatzukiza/kanban.git → promethean structure

## Medium Priority Tasks

### 6. Update Configuration Examples
- Docker and development configuration references
- Current ports and endpoints

### 7. Remove Deprecated References
- eslint-lsp from 2021
- Other outdated package references

## Research Strategy
1. For each package with TODO description: examine source code in packages/ directory
2. Check package.json for current versions
3. Verify all internal links resolve correctly
4. Cross-reference with actual implementation

## Execution Order
1. Start with TODO service descriptions (highest impact)
2. Update version requirements
3. Fix broken links
4. Complete README usage sections
5. Correct repository URLs
6. Update configuration examples
7. Remove deprecated references