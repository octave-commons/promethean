# ClojureScript LSP Configuration

This document describes the complete ClojureScript Language Server Protocol (LSP) setup for the Promethean Framework.

## Overview

The Promethean Framework now includes comprehensive ClojureScript LSP support through multiple integrated components:

- **clojure-lsp**: Standard LSP server for Clojure/ClojureScript
- **clojure-mcp**: Bruce Hauman's comprehensive Clojure MCP server
- **clj-kondo-mcp**: Linting capabilities via MCP
- **shadow-cljs integration**: ClojureScript build tool with nREPL support

## Configuration Files

### 1. OpenCode Configuration (`opencode.json`)

Updated to include ClojureScript MCP servers:

```json
{
  "mcp": {
    "clojure-lsp": {
      "type": "local",
      "command": ["clojure-lsp"],
      "enabled": true
    },
    "clojure-mcp": {
      "type": "local",
      "command": ["clojure", "-X:mcp"],
      "environment": {
        "CLOJURE_MCP_PORT": "7888"
      },
      "enabled": true
    },
    "clj-kondo-mcp": {
      "type": "local",
      "command": ["npx", "clj-kondo-mcp"],
      "enabled": true
    }
  },
  "tools": {
    "clojure-lsp": true,
    "clojure-mcp_clojure_eval": true,
    "clojure-mcp_clojure_edit": true,
    "clojure-mcp_read_file": true,
    "clojure-mcp_ls": true,
    "clojure-mcp_grep": true,
    "clojure-mcp_glob_files": true,
    "clj-kondo-mcp_lint_clojure": true
  }
}
```

### 2. Clojure MCP Configuration (`.clojure/deps.edn`)

```clojure
{:aliases
 {:mcp
  {:deps {org.slf4j/slf4j-nop {:mvn/version "2.0.16"}
          com.bhauman/clojure-mcp {:git/url "https://github.com/bhauman/clojure-mcp.git"
                                   :git/tag "v0.1.11-alpha"
                                   :git/sha "7739dba"}}
   :exec-fn clojure-mcp.main/start-mcp-server
   :exec-args {:port 7888}}

  :nrepl
  {:extra-paths ["test"]
   :extra-deps {nrepl/nrepl {:mvn/version "1.3.1"}}
   :jvm-opts ["-Djdk.attach.allowAttachSelf"]
   :main-opts ["-m" "nrepl.cmdline" "--port" "7888"]}}}
```

### 3. LSP Configuration (`.lsp/config.edn`)

```clojure
{:source-paths ["bb/src"
                 "packages/*/src"
                 "packages/*/src/cljs"
                 "packages/*/src/main"
                 "packages/*/src/test"]
 :source-paths-ignore-regex ["resources.*"
                             "target.*"
                             "node_modules.*"
                             "dist.*"
                             "build.*"
                             "\\.direnv.*"
                             "\\.venv.*"
                             "\\.cache.*"
                             "packages/*/dist.*"
                             "packages/*/out.*"]
 :clj-kondo {:config-dir ".clj-kondo"}
 :clojure-lsp {:additional-suffixes [".cljs" ".cljc" ".clj"]
               :source-paths ["packages/*/src"
                              "packages/*/src/cljs"
                              "bb/src"]
               :test-paths ["packages/*/test"
                            "bb/test"]
               :dependencies ["src/main"]
               :project-specs {:shadow-cljs {:project-type "shadow-cljs"
                                             :shadow-cljs-config "shadow-cljs.edn"}}}}
```

### 4. Shadow-CLJS Configuration (`shadow-cljs.edn`)

Updated to include nREPL support:

```clojure
{:source-paths ["packages/promethean-cli/src"
                 "packages/shadow-ui/src"
                 "packages/kanban/src/cljs"
                 ;; ... other source paths
                 ]
 :dependencies [[binaryage/devtools "1.0.7"]
                [nrepl "1.3.1"]]
 :nrepl {:port 9000
         :host "0.0.0.0"}
 :builds
 {:promethean-cli
  {:target :node-script
   :main promethean.cli.core/-main
   :output-to "packages/promethean-cli/dist/promethean_cli.cjs"
   :compiler-options {:infer-externs :auto
                      :source-map true}}
  ;; ... other builds
  }}
```

## Installation and Setup

### Prerequisites

- Java 17+
- Clojure CLI
- Node.js and npm
- shadow-cljs

### Quick Setup

Run the automated setup script:

```bash
./scripts/setup-clojurescript-lsp.sh
```

### Manual Installation

1. **Install clojure-lsp**:

   ```bash
   curl -L -o clojure-lsp.zip https://github.com/clojure-lsp/clojure-lsp/releases/latest/download/clojure-lsp-native-linux-amd64.zip
   unzip clojure-lsp.zip
   chmod +x clojure-lsp
   sudo mv clojure-lsp /usr/local/bin/
   ```

2. **Install clj-kondo**:

   ```bash
   curl -L -o clj-kondo.zip https://github.com/clj-kondo/clj-kondo/releases/latest/download/clj-kondo-2025.01.16-linux-amd64.zip
   unzip clj-kondo.zip
   chmod +x clj-kondo
   sudo mv clj-kondo /usr/local/bin/
   ```

3. **Install MCP servers**:
   ```bash
   npm install -g @playwright/mcp@latest
   npm install -g @z_ai/mcp-server
   npm install -g clj-kondo-mcp
   ```

## Usage

### Starting Development Environment

1. **Start nREPL server**:

   ```bash
   clojure -M:nrepl
   ```

2. **Start shadow-cljs** (in another terminal):

   ```bash
   npx shadow-cljs watch app
   ```

3. **Start Clojure MCP server** (in another terminal):
   ```bash
   clojure -X:mcp :port 7888
   ```

### Using with OpenCode

The OpenCode configuration automatically includes ClojureScript tools:

- `clojure-lsp`: Language server functionality
- `clojure-mcp_clojure_eval`: Evaluate Clojure code
- `clojure-mcp_clojure_edit`: Structure-aware editing
- `clojure-mcp_read_file`: Smart file reading
- `clojure-mcp_ls`: Directory listing
- `clojure-mcp_grep`: Content search
- `clojure-mcp_glob_files`: File pattern matching
- `clj-kondo-mcp_lint_clojure`: Linting capabilities

### Editor Integration

Configure your editor to use clojure-lsp:

**VS Code**:

```json
{
  "clojure-lsp.useClojureLspBinary": true,
  "clojure-lsp.clojureLspPath": "/usr/local/bin/clojure-lsp"
}
```

**Emacs** (with lsp-mode):

```elisp
(setq lsp-clojure-server-command '("clojure-lsp"))
```

## Project Structure

The ClojureScript LSP setup supports the following project structure:

```
promethean/
├── .clojure/
│   └── deps.edn              # Clojure MCP configuration
├── .clojure-mcp/
│   └── config.edn            # MCP server settings
├── .lsp/
│   └── config.edn            # LSP server configuration
├── .clj-kondo/               # Linting configuration
├── shadow-cljs.edn           # ClojureScript builds
├── deps.edn                  # Clojure dependencies
└── packages/
    └── */
        ├── src/
        ├── src/cljs/         # ClojureScript sources
        └── test/             # Test files
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 7888 (nREPL) and 9000 (shadow-cljs) are available
2. **MCP server not starting**: Check Clojure dependencies and network connectivity
3. **LSP not connecting**: Verify clojure-lsp installation and configuration
4. **File not found errors**: Check source paths in `.lsp/config.edn`

### Debug Commands

```bash
# Test clojure-lsp
clojure-lsp --version

# Test nREPL connection
clojure -M:nrepl

# Test shadow-cljs
npx shadow-cljs info

# Test MCP configuration
clojure -X:mcp :port 7888

# Run linting
clj-kondo --lint src
```

## Advanced Configuration

### Dual REPL Setup

For simultaneous Clojure and ClojureScript development:

```clojure
;; .clojure/deps.edn
{:aliases
 {:mcp-shadow-dual
  {:deps {org.slf4j/slf4j-nop {:mvn/version "2.0.16"}
          com.bhauman/clojure-mcp {:git/url "https://github.com/bhauman/clojure-mcp.git"
                                   :git/tag "v0.1.11-alpha"
                                   :git/sha "7739dba"}}
   :exec-fn clojure-mcp.main-examples.shadow-main/start-mcp-server
   :exec-args {:port 7888 :shadow-port 9000 :shadow-build "app"}}}}
```

### Custom MCP Tools

Create custom MCP servers by extending the base configuration in `.clojure-mcp/config.edn`:

```clojure
{:allowed-directories ["." "src" "test" "packages"]
 :write-file-guard :full-read
 :cljfmt true
 :bash-over-nrepl true
 :scratch-pad-load true
 :scratch-pad-file "workspace.edn"}
```

## Integration with Promethean Framework

The ClojureScript LSP setup integrates seamlessly with:

- **Kanban system**: Task management and workflow automation
- **Agent framework**: AI-powered development assistants
- **Build system**: Automated compilation and testing
- **Documentation**: Auto-generated docs and type information

## Resources

- [clojure-lsp Documentation](https://clojure-lsp.io/)
- [Clojure MCP Repository](https://github.com/bhauman/clojure-mcp)
- [shadow-cljs Guide](https://shadow-cljs.github.io/docs/)
- [clj-kondo Configuration](https://github.com/clj-kondo/clj-kondo)
- [OpenCode Documentation](https://opencode.ai/docs)
