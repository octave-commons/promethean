# MCP Bridge Architecture Documentation

## Overview

The MCP Bridge package implements a sophisticated adapter pattern for managing Model Context Protocol (MCP) configurations across multiple development environments. The architecture is designed around a canonical EDN-based configuration format with bidirectional synchronization to various target formats.

## Core Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Canonical Configuration                     │
│                        (EDN Format)                        │
├─────────────────────────────────────────────────────────────────┤
│  {:mcp-servers {...} :http {...} :outputs [...]}           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Adapter Layer                             │
├─────────────────────────────────────────────────────────────────┤
│  • Format-specific adapters                                   │
│  • Bidirectional conversion                                   │
│  • Validation and error handling                              │
│  • Atomic write operations                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Target Configurations                       │
├─────────────────────────────────────────────────────────────────┤
│  • MCP JSON (Official)                                      │
│  • VSCode JSON                                             │
│  • Claude Code JSON                                         │
│  • Codex TOML                                              │
│  • Emacs Elisp                                             │
│  • Opencode JSON                                           │
└─────────────────────────────────────────────────────────────────┘
```

## Design Patterns

### 1. Adapter Pattern

Each configuration format is implemented as a separate adapter following a consistent interface:

```clojure
;; Adapter Interface
(defprotocol Adapter
  (read-full [path] "Read configuration from file")
  (write-full [path data] "Write configuration to file"))

;; Implementation Example
(defrecord MCPJSONAdapter []
  Adapter
  (read-full [path] ...)
  (write-full [path data] ...))
```

### 2. Canonical Data Model

All adapters work with a unified internal representation:

```clojure
{:mcp {:mcp-servers {<server-key> <server-spec>}
        :http {:transport :http
               :base-url <string>
               :tools [<tool-ids>]
               :endpoints {<endpoint-key> <endpoint-spec>}
               :proxy {:config <path>}}}
 :rest {<format-specific-data>}}
```

### 3. Policy-Based Merging

Configurable merge policies for different synchronization scenarios:

```clojure
;; Push Policy: EDN overrides target
(def ^:dynamic *push-policy*
  {:mcp-merge deep-merge
   :rest-policy :preserve})

;; Pull Policy: Target fills gaps, EDN wins on conflict
(def ^:dynamic *pull-policy*
  {:mcp-merge deep-merge-prefer-existing})
```

## Component Architecture

### Core Components

#### 1. `clj-hacks.mcp.core`

- **Purpose**: Core utilities and data manipulation
- **Responsibilities**:
  - Path resolution and expansion
  - Atomic file operations
  - Data validation
  - Merge policies
- **Key Functions**:
  - `resolve-path` - Path resolution with home expansion
  - `write-atomic!` - Atomic file writes
  - `expand-servers-home` - Environment variable expansion
  - `deep-merge` / `deep-merge-prefer-existing` - Merge strategies

#### 2. `clj-hacks.mcp.ops`

- **Purpose**: High-level operations orchestration
- **Responsibilities**:
  - Coordinating adapter operations
  - Batch processing
  - Health checking (doctor)
  - Output validation
- **Key Functions**:
  - `push-one!` / `pull-one` / `sync-one!` - Single target operations
  - `push-all!` / `sync-all!` - Batch operations
  - `doctor` - Health checking

#### 3. `clj-hacks.mcp.merge`

- **Purpose**: Adapter coordination and routing
- **Responsibilities**:
  - Adapter registry and lookup
  - Operation routing
  - Format-specific handling
- **Key Functions**:
  - `pull` - Generic pull operation
  - `push` - Generic push operation
  - `sync!` - Generic sync operation

### Adapter Components

#### 1. JSON Adapters (`adapter_mcp_json.clj`, `adapter_vscode_json.clj`, `adapter_opencode.clj`)

- **Common Features**:
  - JSON parsing with Cheshire
  - Schema validation
  - Format-specific field mapping
  - Atomic writes with pretty printing

#### 2. TOML Adapter (`adapter_codex_toml.clj`)

- **Special Features**:
  - Custom TOML parser for MCP-specific tables
  - Inline table and array parsing
  - Environment variable handling
  - HTTP endpoint to stdio server conversion

#### 3. Elisp Adapter (`adapter_elisp.clj`)

- **Advanced Features**:
  - Tree-sitter based parsing
  - Generated block detection and preservation
  - Legacy format support
  - HTTP endpoint integration
  - Property list parsing

### Elisp Processing Pipeline

```
Elisp Source File
        │
        ▼
┌─────────────────┐
│ Tree-sitter     │
│ Parser          │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│ Syntax Tree     │
│ Construction   │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│ AST            │
│ Manipulation    │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│ MCP Block      │
│ Detection      │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│ Canonical      │
│ Conversion     │
└─────────────────┘
```

## Data Flow

### Push Operation Flow

```
EDN Configuration
        │
        ▼
┌─────────────────┐
│ Server Spec     │
│ Expansion      │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│ Target         │
│ Adapter        │
│ Selection      │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│ Format         │
│ Conversion     │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│ Merge with     │
│ Existing      │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│ Atomic Write   │
└─────────────────┘
```

### Pull Operation Flow

```
Target File
        │
        ▼
┌─────────────────┐
│ Format         │
│ Detection      │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│ Adapter        │
│ Selection      │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│ Parse &        │
│ Validate      │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│ Canonical      │
│ Conversion     │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│ Merge with     │
│ EDN Config    │
└─────────────────┘
```

## HTTP Transport Architecture

### HTTP Endpoint Management

The package provides sophisticated HTTP transport configuration:

```clojure
{:http
 {:transport :http
  :base-url "http://127.0.0.1:3210"
  :tools ["base-toolset"]
  :endpoints
  {:endpoint-1 {:tools ["tool1" "tool2"]
                :include-help? true
                :meta {...}}}
  :proxy {:config "./config/proxy-servers.edn"}}}
```

### Endpoint to Server Conversion

Different target formats handle HTTP endpoints differently:

1. **MCP JSON**: Preserves HTTP configuration as-is
2. **Claude Code**: Converts to `mcp-remote` command format
3. **Codex TOML**: Converts to stdio proxy servers
4. **Elisp**: Converts to HTTP server specifications

## Error Handling Strategy

### Validation Layers

1. **Input Validation**: EDN structure validation
2. **Adapter Validation**: Format-specific validation
3. **Path Validation**: File system and permission checks
4. **Runtime Validation**: Command existence and permissions

### Error Recovery

- **Atomic Operations**: All writes are atomic to prevent corruption
- **Rollback Support**: Failed operations can be rolled back
- **Graceful Degradation**: Partial failures don't affect other targets
- **Detailed Error Reporting**: Contextual error messages with suggestions

## Performance Considerations

### Optimization Strategies

1. **Lazy Loading**: Adapters loaded only when needed
2. **Caching**: Parsed configurations cached during operations
3. **Batch Operations**: Minimize file system operations
4. **Memory Efficiency**: Streaming for large configuration files

### Scalability

- **Large Configurations**: Handles hundreds of servers efficiently
- **Concurrent Operations**: Thread-safe operations for multiple targets
- **Memory Management**: Efficient garbage collection for temporary objects

## Security Considerations

### Path Security

- **Path Traversal Prevention**: Validates all file paths
- **Home Directory Protection**: Safe expansion of user directories
- **Permission Checking**: Validates read/write permissions

### Configuration Security

- **Environment Variable Handling**: Secure expansion of sensitive values
- **Token Protection**: Careful handling of authentication tokens
- **Validation**: Prevents injection attacks through configuration

## Extensibility

### Adding New Adapters

1. **Create Adapter Namespace**: `clj-hacks.mcp.adapter-<format>`
2. **Implement Interface**: `read-full` and `write-full` functions
3. **Register Adapter**: Add to `clj-hacks.mcp.merge/adapters`
4. **Add Tests**: Comprehensive test coverage
5. **Update Documentation**: Include in README and API docs

### Custom Merge Policies

```clojure
;; Custom merge policy
(def ^:dynamic *custom-policy*
  {:mcp-merge (fn [existing new] ...)
   :rest-policy :merge})
```

### Custom Validation

```clojure
;; Add format-specific validation
(defn validate-custom-format [config]
  {:valid? true
   :errors []
   :warnings []})
```

## Integration Points

### Promethean Ecosystem

1. **Kanban Integration**: Task tracking for configuration changes
2. **Logger Integration**: Centralized logging for operations
3. **Platform Core**: Core services and utilities
4. **IDE Extensions**: Editor-specific integrations

### External Integrations

1. **MCP Servers**: Direct server configuration management
2. **Development Tools**: IDE and editor integration
3. **CI/CD Pipelines**: Automated configuration deployment
4. **Configuration Management**: Git-based configuration tracking

## Testing Architecture

### Test Organization

```
test/
├── clj_hacks/mcp/          # MCP adapter tests
│   ├── adapter_*_test.clj   # Format-specific tests
│   ├── core_test.clj        # Core functionality tests
│   ├── ops_test.clj         # Operations tests
│   └── cli_test.clj         # CLI interface tests
├── elisp/                  # Elisp processing tests
│   ├── ast_test.clj         # AST manipulation tests
│   ├── read_test.clj        # Tree-sitter parsing tests
│   └── validate_test.clj    # Validation tests
└── fixtures/               # Test data files
    ├── *.el                # Elisp test files
    ├── *.json              # JSON test files
    └── *.toml              # TOML test files
```

### Test Strategies

1. **Unit Tests**: Individual function testing
2. **Integration Tests**: End-to-end workflow testing
3. **Property Tests**: Generative testing for edge cases
4. **Round-trip Tests**: Read/write cycle validation
5. **Error Case Tests**: Exception handling validation

## Future Architecture Considerations

### Planned Enhancements

1. **Configuration Templates**: Reusable configuration patterns
2. **Schema Validation**: JSON Schema-based validation
3. **Configuration Diff**: Visual diff of configuration changes
4. **Rollback Management**: Automatic rollback on failures
5. **Configuration History**: Git-like history tracking

### Scalability Improvements

1. **Streaming Processing**: For very large configurations
2. **Parallel Operations**: Concurrent target processing
3. **Incremental Updates**: Only update changed configurations
4. **Configuration Caching**: Intelligent caching strategies

This architecture provides a robust, extensible foundation for MCP configuration management across diverse development environments while maintaining consistency, reliability, and performance.
