# @promethean-os/mcp-bridge

> _Universal MCP configuration management and adapter system for the Promethean ecosystem_

A sophisticated Clojure-based system that provides unified configuration management for Model Context Protocol (MCP) servers across multiple development environments and configuration formats. The package serves as the central bridge between different IDE configurations and the Promethean MCP infrastructure.

## 🎯 Mission

Enable seamless MCP server configuration management across diverse development environments by providing:

- **Universal adapters** for different configuration formats (JSON, TOML, Elisp, etc.)
- **Synchronization capabilities** between multiple configuration sources
- **IDE integration** support for VSCode, Emacs, Claude Code, and Opencode
- **Atomic configuration updates** with validation and error handling
- **Tree-sitter powered parsing** for Emacs Lisp configurations

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   MCP Servers   │    │   Canonical EDN  │    │   Target Configs │
│                 │    │   Configuration  │    │                 │
│ • stdio servers │◄──►│                 │◄──►│ • VSCode JSON   │
│ • HTTP endpoints │    │ • mcp-servers   │    │ • Claude Code   │
│ • Proxy configs │    │ • http config   │    │ • Emacs Elisp   │
│                 │    │ • outputs       │    │ • Codex TOML    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Adapter Layer  │
                    │                 │
                    │ • JSON adapters │
                    │ • TOML parser   │
                    │ • Elisp AST     │
                    │ • Validation    │
                    └─────────────────┘
```

## 🚀 Key Features

### Universal Configuration Support

- **MCP JSON**: Official MCP configuration format with HTTP transport support
- **VSCode JSON**: VSCode-specific server configuration
- **Claude Code**: Claude Code MCP configuration format
- **Codex TOML**: TOML-based configuration for Codex environments
- **Emacs Elisp**: Tree-sitter powered Emacs Lisp configuration parsing
- **Opencode JSON**: Opencode platform configuration format

### Advanced Capabilities

- **Bidirectional synchronization**: Pull configurations from sources, push to targets
- **Atomic updates**: All configuration changes are atomic and rollback-safe
- **Path expansion**: Automatic `$HOME` and `~` expansion in configuration paths
- **Validation**: Comprehensive configuration validation and error reporting
- **HTTP endpoint management**: Sophisticated HTTP transport configuration
- **Proxy configuration**: Stdio proxy support for HTTP endpoints

### Developer Experience

- **CLI interface**: Full-featured command-line interface for all operations
- **Doctor commands**: Health checking and diagnostics for configurations
- **Batch operations**: Push/sync all configurations in one operation
- **Extensible design**: Easy to add new configuration format adapters

## 📦 Installation & Setup

### Prerequisites

- [Clojure CLI tools](https://clojure.org/guides/install_clojure) - for running Clojure commands
- [Babashka](https://babashka.org/) (optional) - for task automation
- Java runtime environment

### Quick Start

1. **Create your canonical MCP configuration:**

```clojure
;; config/mcp.edn - Your source of truth
{:mcp-servers
 {:filesystem {:command "npx"
               :args ["@modelcontextprotocol/server-filesystem" "/tmp"]
               :description "Local filesystem access"}

 :github {:command "npx"
          :args ["@modelcontextprotocol/server-github"]
          :env {"GITHUB_PERSONAL_ACCESS_TOKEN" "your-token"}
          :description "GitHub integration"}}

 :outputs
 [{:schema :mcp.json :path "~/.config/claude/mcp.json"}
  {:schema :vscode.json :path "~/.vscode/mcp.json"}
  {:schema :elisp :path "~/.config/emacs/mcp-servers.el"}
  {:schema :codex.toml :path "~/.config/codex.toml"}]}
```

2. **Synchronize all configurations:**

```bash
# From repository root
clojure -M:tasks sync-all --edn config/mcp.edn
```

3. **Verify configuration health:**

```bash
clojure -M:tasks doctor --edn config/mcp.edn
```

## 🛠️ CLI Reference

### Core Commands

```bash
# Build and test the package
clojure -M:tasks build
clojure -M:tasks test
clojure -M:tasks lint

# Configuration management
clojure -M:tasks pull <schema> <target> --edn <config.edn>
clojure -M:tasks push <schema> <target> --edn <config.edn>
clojure -M:tasks sync <schema> <target> --edn <config.edn>
clojure -M:tasks push-all --edn <config.edn>
clojure -M:tasks sync-all --edn <config.edn>
clojure -M:tasks doctor --edn <config.edn>
```

### Schema Types

| Schema             | Description              | File Pattern    |
| ------------------ | ------------------------ | --------------- |
| `mcp.json`         | Official MCP JSON format | `*.json`        |
| `vscode.json`      | VSCode configuration     | `settings.json` |
| `claude_code.json` | Claude Code format       | `*.mcp.json`    |
| `codex.toml`       | Codex TOML format        | `*.toml`        |
| `elisp`            | Emacs Lisp format        | `*.el`          |
| `opencode.json`    | Opencode format          | `*.json`        |

## 📚 Usage Examples

### Basic Configuration Management

```bash
# Pull VSCode configuration into your EDN
clojure -M:tasks pull vscode.json ~/.vscode/settings.json --edn config/mcp.edn

# Push updated configuration to Claude Code
clojure -M:tasks push claude_code.json ~/.config/claude/mcp.json --edn config/mcp.edn

# Synchronize a specific target (pull then push)
clojure -M:tasks sync elisp ~/.config/emacs/mcp-servers.el --edn config/mcp.edn
```

### HTTP Transport Configuration

```clojure
{:mcp-servers
 {:local-fs {:command "npx"
             :args ["@modelcontextprotocol/server-filesystem" "/tmp"]}}

 :http
 {:transport :http
  :base-url "http://127.0.0.1:3210"
  :tools ["filesystem" "github"]
  :endpoints
  {:filesystem {:tools ["files_read" "files_write"]
                :include-help? true
                :meta {:title "Filesystem Access"
                       :description "Local file operations"}}}
  :proxy {:config "./config/mcp_servers.edn"}}}
```

### Emacs Lisp Integration

The package provides sophisticated Emacs Lisp configuration management with Tree-sitter parsing:

```elisp
;; Auto-generated by mk.mcp-cli -- edits will be overwritten.
(with-eval-after-load 'mcp
  (setq mcp-hub-servers
        '((:filesystem . (:command "npx"
                         :args ("@modelcontextprotocol/server-filesystem" "/tmp")
                         :description "Local filesystem access"))
          (:github . (:command "npx"
                     :args ("@modelcontextprotocol/server-github")
                     :env ("GITHUB_PERSONAL_ACCESS_TOKEN" . "your-token")
                     :description "GitHub integration")))))
```

## 🔧 Advanced Configuration

### HTTP Endpoint Management

The package supports sophisticated HTTP transport configurations:

```clojure
{:http
 {:transport :http
  :base-url "http://127.0.0.1:3210"
  :tools ["base-toolset"]
  :include-help? false
  :stdio-meta
  {:title "Default MCP Hub"
   :description "Primary MCP HTTP endpoint"
   :workflow ["setup" "configure" "use"]
   :expectations
   {:usage ["HTTP client required"]
    :pitfalls ["Network connectivity"]
    :prerequisites ["MCP server running"]}}
  :endpoints
  {:specialized {:tools ["advanced-tool"]
                 :include-help? true
                 :meta {:title "Specialized Tools"
                        :description "Advanced MCP tools"}}}
  :proxy {:config "./config/proxy-servers.edn"}}}
```

### Server Configuration Options

```clojure
{:mcp-servers
 {:advanced-server
  {:command "npx"
   :args ["@custom/mcp-server" "--port" "8080"]
   :cwd "/workspace"
   :env {"NODE_ENV" "production" "DEBUG" "true"}
   :timeout 30000
   :description "Advanced MCP server"
   :version "2.1.0"
   :metadata {"author" "Promethean Team" "license" "MIT"}
   :capabilities {"claude" {"stream" true "tools" true}}
   :auto-connect? true
   :auto-approve ["files.write" "system.execute"]
   :auto-accept ["files.view" "system.info"]
   :disabled? false}}}
```

## 🔍 Integration with Promethean Ecosystem

### Core Integration Points

1. **@promethean-os/kanban**: Task management and workflow coordination
2. **@promethean-os/logger**: Centralized logging for MCP operations
3. **@promethean-os/platform-core**: Core platform services
4. **IDE Extensions**: VSCode, Emacs, and other editor integrations

### Workflow Integration

```bash
# Typical Promethean workflow
pnpm kanban search "mcp configuration"
pnpm kanban update-status <task-id> in_progress

# Use mcp-bridge for configuration management
clojure -M:tasks sync-all --edn config/mcp.edn

# Verify and commit changes
clojure -M:tasks doctor --edn config/mcp.edn
git add config/
git commit -m "Update MCP server configurations"

pnpm kanban update-status <task-id> done
```

## 🧪 Development & Testing

### Local Development

```bash
# Install dependencies
clojure -M:tasks prepare

# Run tests
clojure -M:tasks test

# Lint code
clojure -M:tasks lint

# Build artifacts
clojure -M:tasks build
```

### Testing Configuration Adapters

```clojure
;; Test adapter functionality
(require '[clj-hacks.mcp.adapter-mcp-json :as adapter])

;; Read configuration
(def config (adapter/read-full "~/.config/claude/mcp.json"))

;; Write configuration
(adapter/write-full "/tmp/test.json" config)
```

### Tree-sitter Verification

```bash
# Verify Elisp parsing (requires Tree-sitter Java bindings)
clojure -A:verify packages/clj-hacks/fixtures/generated.el
```

## 📖 API Reference

### Core Namespaces

- `clj-hacks.mcp.core` - Core utilities and data manipulation
- `clj-hacks.mcp.ops` - High-level operations (push/pull/sync)
- `clj-hacks.mcp.merge` - Adapter coordination and merging logic
- `clj-hacks.mcp.cli` - Command-line interface
- `clj-hacks.mcp.adapter-*` - Format-specific adapters
- `elisp.*` - Emacs Lisp parsing and AST manipulation

### Key Functions

```clojure
;; Core operations
(clj-hacks.mcp.ops/pull-one edn-map base output-spec)
(clj-hacks.mcp.ops/push-one! edn-map base output-spec)
(clj-hacks.mcp.ops/sync-one! edn-map base output-spec)

;; Batch operations
(clj-hacks.mcp.ops/push-all! edn-map base outputs)
(clj-hacks.mcp.ops/sync-all! edn-map base outputs)

;; Health checking
(clj-hacks.mcp.ops/doctor edn-map base)

;; Adapter usage
(clj-hacks.mcp.merge/pull {:schema :mcp.json :path target} edn-map)
(clj-hacks.mcp.merge/push {:schema :mcp.json :path target} edn-map)
```

## 🤝 Contributing

### Adding New Adapters

1. Create adapter namespace: `clj-hacks.mcp.adapter-<format>`
2. Implement `read-full` and `write-full` functions
3. Register adapter in `clj-hacks.mcp.merge/adapters`
4. Add comprehensive tests
5. Update documentation

### Development Guidelines

- Follow functional programming principles
- Use immutable data structures
- Include comprehensive error handling
- Add tests for all new functionality
- Document public APIs with docstrings

## 📄 License

GPL-3.0-only - See [LICENSE.txt](LICENSE.txt) for details.

## 🔗 Related Packages

- [@promethean-os/kanban](../../kanban/) - Task management
- [@promethean-os/logger](../../logger/) - Logging services
- [@promethean-os/platform-core](../../platform-core/) - Core platform

---

_Part of the [Promethean](../../README.md) ecosystem - Stealing fire from the gods to grant man the gift of knowledge and wisdom._
