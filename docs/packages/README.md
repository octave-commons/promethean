# Promethean Package Catalog

Complete catalog of all Promethean packages with their documentation and usage information.

## 🔗 Documentation-to-Code Linking

**Enhanced packages** feature direct code links for seamless navigation between documentation and implementation:

- **📁 Implementation** sections link directly to source files
- **📚 API Reference** sections link to specific functions, classes, and line numbers
- **IDE Integration** links work in VS Code, GitHub, and browsers
- **100% Validated** links ensure reliable navigation

### Enhanced Packages ✨

| Package                 | Code Links                  | Status      |
| ----------------------- | --------------------------- | ----------- |
| [[ai-learning]]         | 28 links (20 line-specific) | ✅ Enhanced |
| [[llm]]                 | 21 links (12 line-specific) | ✅ Enhanced |
| [[github-sync]]         | 9 links (6 line-specific)   | ✅ Enhanced |
| [[obsidian-export]]     | 12 links (4 line-specific)  | ✅ Enhanced |
| [[autocommit]]          | 70 links (50 line-specific) | ✅ Enhanced |
| [[benchmark]]           | 88 links (67 line-specific) | ✅ Enhanced |
| [[platform-core]]       | 48 links (39 line-specific) | ✅ Enhanced |
| [[prompt-optimization]] | 47 links (40 line-specific) | ✅ Enhanced |

## 📦 Package Categories

### Core System

| Package           | Description                        | Status            |
| ----------------- | ---------------------------------- | ----------------- |
| [[agent]]         | Agent system framework             | 🚧 In Development |
| [[agent-ecs]]     | Entity Component System for agents | 🚧 In Development |
| [[platform-core]] | Cross-platform system abstraction  | ✅ Active         |
| [[llm]]           | Core LLM integration and service   | ✅ Active         |
| [[mcp]]           | Model Context Protocol server      | ✅ Active         |

### Data & Storage

| Package          | Description                      | Status            |
| ---------------- | -------------------------------- | ----------------- |
| [[persistence]]  | Data persistence and storage     | ✅ Active         |
| [[level-cache]]  | LevelDB-based caching system     | ✅ Active         |
| [[file-indexer]] | File indexing and search         | ✅ Active         |
| [[embeddings]]   | Vector embeddings and similarity | 🚧 In Development |

### AI & Learning

| Package                 | Description                       | Status    |
| ----------------------- | --------------------------------- | --------- |
| [[ai-learning]]         | Adaptive ML model optimization    | ✅ Active |
| [[prompt-optimization]] | AI prompt engineering utilities   | ✅ Active |
| [[model-server]]        | Local model serving and inference | ✅ Active |

### Development Tools

| Package          | Description                             | Status            |
| ---------------- | --------------------------------------- | ----------------- |
| [[buildfix]]     | Automated TypeScript build error fixing | ✅ Active         |
| [[codemods]]     | Code transformation tools               | 🚧 In Development |
| [[test-utils]]   | Testing utilities and helpers           | ✅ Active         |
| [[lint-taskgen]] | Linting task generation                 | 🚧 In Development |

### Documentation & Content

| Package             | Description                           | Status            |
| ------------------- | ------------------------------------- | ----------------- |
| [[docops]]          | Documentation pipeline and processing | ✅ Active         |
| [[obsidian-export]] | Obsidian vault export and conversion  | ✅ Active         |
| [[markdown]]        | Markdown processing utilities         | ✅ Active         |
| [[markdown-graph]]  | Markdown relationship graphing        | 🚧 In Development |

### Integration & Sync

| Package                | Description                         | Status            |
| ---------------------- | ----------------------------------- | ----------------- |
| [[github-sync]]        | GitHub repository synchronization   | ✅ Active         |
| [[webcrawler-service]] | Web crawling and content extraction | ✅ Active         |
| [[discord]]            | Discord bot integration             | 🚧 In Development |

### User Interface

| Package              | Description                      | Status    |
| -------------------- | -------------------------------- | --------- |
| [[ui-components]]    | Reusable web components          | ✅ Active |
| [[frontend-service]] | Frontend asset serving           | ✅ Active |
| [[duck-web]]         | Web interface for Duck assistant | ✅ Active |

### Operations & Monitoring

| Package        | Description                      | Status            |
| -------------- | -------------------------------- | ----------------- |
| [[monitoring]] | System monitoring and metrics    | 🚧 In Development |
| [[health]]     | Health check service             | ✅ Active         |
| [[heartbeat]]  | Process heartbeat monitoring     | ✅ Active         |
| [[benchmark]]  | Performance testing and analysis | ✅ Active         |

### Workflow & Automation

| Package              | Description                   | Status    |
| -------------------- | ----------------------------- | --------- |
| [[kanban]]           | Kanban task management system | ✅ Active |
| [[kanban-processor]] | Kanban board processing       | ✅ Active |
| [[autocommit]]       | Intelligent automated commits | ✅ Active |
| [[piper]]            | Pipeline execution runner     | ✅ Active |

### Communication

| Package    | Description                 | Status            |
| ---------- | --------------------------- | ----------------- |
| [[broker]] | Message broker service      | ✅ Active         |
| [[ws]]     | WebSocket utilities         | 🚧 In Development |
| [[http]]   | HTTP utilities and services | 🚧 In Development |

## 🚀 Quick Start

### For Development

1. **Core System**: Start with [[platform-core]] and [[llm]]
2. **Data Storage**: Add [[persistence]] and [[file-indexer]]
3. **AI Features**: Include [[ai-learning]] and [[prompt-optimization]]

### For Documentation

1. **Base Setup**: Use [[docops]] for documentation pipeline
2. **Export**: Add [[obsidian-export]] for vault conversion
3. **Processing**: Include [[markdown]] for content handling

### For Integration

1. **GitHub**: Use [[github-sync]] for repository integration
2. **Web**: Add [[webcrawler-service]] for content extraction
3. **Communication**: Include [[broker]] for message handling

## 📋 Package Status Legend

- ✅ **Active** - Fully functional and in use
- 🚧 **In Development** - Core features implemented, integration in progress
- 📋 **Planned** - Design complete, implementation pending
- ⚠️ **Deprecated** - Use alternative package

## 🔗 Related Documentation

- [[../HOME]] - Main project overview
- [[../architecture/index]] - System architecture
- [[../api-architecture]] - API design guidelines
- [[../CONTRIBUTOR-FRIENDLY-GITHUB-BOARDS]] - GitHub integration guide

## 🔧 Documentation Tools

The following tools maintain and validate code links:

- **Code Scanner**: `tools/code-scanner-fixed.mjs` - Extracts code structure and generates links
- **Link Validator**: `tools/doc-link-validator.mjs` - Validates all documentation links
- **Bulk Updater**: `tools/bulk-doc-updater.mjs` - Mass-updates package documentation

### Usage Examples

```bash
# Validate all package links
node tools/doc-link-validator.mjs --all

# Update specific package with code links
node tools/bulk-doc-updater.mjs package-name

# Scan package for code structure
node tools/code-scanner-fixed.mjs package-name
```

---

_This catalog is automatically updated as packages are added or modified. Last updated: 2025-11-01_
