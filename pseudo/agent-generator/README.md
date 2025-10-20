# Agent Generator

A cross-platform Clojure/ClojureScript agent instruction generator for the Promethean framework.

## Overview

This package provides tools for generating agent instruction files from templates and collected data. It supports multiple platforms including:

- **Babashka (bb)** - Script execution and automation
- **NBB (Node Babashka)** - Node.js runtime with Clojure
- **JVM Clojure** - Full Java Virtual Machine runtime
- **ClojureScript** - Browser and Node.js JavaScript compilation

## Features

- 🏗️ **Template Engine** - Flexible template system for different agent types
- 📊 **Data Collection** - Collect data from git, files, and APIs
- 🔧 **CLI Interface** - Command-line tools for generation and validation
- ✅ **Validation** - Comprehensive data and configuration validation
- 🌐 **Cross-Platform** - Works across multiple Clojure runtimes

## Installation

Add to your `deps.edn`:

```clojure
{:deps {promethean/agent-generator {:mvn/version "0.1.0"}}}
```

## Usage

### Command Line

```bash
# Generate agent instructions
bb generate --template agents.md --data config.json

# Validate agent specification
bb validate --spec agent-spec.json

# List available templates
bb list
```

### Programmatic

```clojure
(require '[promethean.agent-generator.core :as core])

;; Generate an agent
(core/generate-agent config data template)

;; Batch generation
(core/generate-batch config batch-data)
```

## Configuration

Default configuration:

```clojure
{:output-dir "generated-agents"
 :template-dir "resources/templates"
 :validation-enabled true
 :log-level :info}
```

## Templates

The package includes templates for:

- **agents.md** - General agent instructions
- **claude.md** - Claude-specific agents
- **crush.md** - CRUSH framework agents

## Development

### Running Tests

```bash
# JVM tests
clojure -M:test

# Babashka tests
bb test

# ClojureScript tests
npx shadow-cljs compile test
```

### Building

```bash
# Build for JVM
clojure -M:build

# Build for Node.js
npx shadow-cljs release agent-generator
```

## Architecture

```
promethean.agent-generator/
├── config.clj      # Configuration management
├── collectors.clj  # Data collection layer
├── templates.clj   # Template engine
├── core.clj        # Generator core logic
├── platform.clj    # Platform detection
├── validation.clj  # Data validation
└── cli.clj         # Command-line interface
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

Eclipse Public License 2.0
