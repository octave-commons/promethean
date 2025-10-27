# MCP Bridge Documentation

This directory contains comprehensive documentation for the MCP Bridge package (`@promethean-os/mcp-bridge`).

## Documentation Structure

### Core Documentation

- **[../README.md](../README.md)** - Main package documentation with quick start guide
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Detailed architecture and design patterns
- **[API_REFERENCE.md](API_REFERENCE.md)** - Complete API reference
- **[USAGE_EXAMPLES.md](USAGE_EXAMPLES.md)** - Comprehensive usage examples
- **[INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)** - Integration with external systems

### Quick Navigation

| Topic               | Document                                     | Description                          |
| ------------------- | -------------------------------------------- | ------------------------------------ |
| **Getting Started** | [README.md](../README.md)                    | Installation, setup, and basic usage |
| **Architecture**    | [ARCHITECTURE.md](ARCHITECTURE.md)           | System design and patterns           |
| **API Reference**   | [API_REFERENCE.md](API_REFERENCE.md)         | Complete function documentation      |
| **Examples**        | [USAGE_EXAMPLES.md](USAGE_EXAMPLES.md)       | Real-world usage scenarios           |
| **Integration**     | [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) | External system integration          |

## Key Concepts

### MCP Bridge Overview

MCP Bridge is a sophisticated configuration management system that:

1. **Unifies** MCP server configurations across multiple development environments
2. **Synchronizes** configurations between different formats (JSON, TOML, Elisp)
3. **Manages** HTTP transport configurations and endpoint routing
4. **Provides** atomic updates with validation and error handling
5. **Integrates** with IDEs, CI/CD pipelines, and monitoring systems

### Supported Formats

| Format            | Schema              | Use Case                                          |
| ----------------- | ------------------- | ------------------------------------------------- |
| **MCP JSON**      | `:mcp.json`         | Official MCP configuration format                 |
| **VSCode JSON**   | `:vscode.json`      | VSCode settings integration                       |
| **Claude Code**   | `:claude_code.json` | Claude Code MCP configuration                     |
| **Codex TOML**    | `:codex.toml`       | Codex environment configuration                   |
| **Emacs Elisp**   | `:elisp`            | Emacs Lisp configuration with Tree-sitter parsing |
| **Opencode JSON** | `:opencode.json`    | Opencode platform configuration                   |

### Core Operations

1. **Pull** - Extract configuration from target formats
2. **Push** - Write configuration to target formats
3. **Sync** - Bidirectional synchronization
4. **Doctor** - Health checking and validation
5. **Batch Operations** - Process multiple targets simultaneously

## Documentation Reading Guide

### For New Users

1. Start with **[README.md](../README.md)** for installation and quick start
2. Review **[USAGE_EXAMPLES.md](USAGE_EXAMPLES.md)** for practical examples
3. Use **[API_REFERENCE.md](API_REFERENCE.md)** for function details

### For Developers

1. Read **[ARCHITECTURE.md](ARCHITECTURE.md)** for system understanding
2. Study **[API_REFERENCE.md](API_REFERENCE.md)** for integration points
3. Review **[INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)** for extension patterns

### For System Administrators

1. Use **[USAGE_EXAMPLES.md](USAGE_EXAMPLES.md)** for deployment scenarios
2. Reference **[INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)** for CI/CD setup
3. Consult **[API_REFERENCE.md](API_REFERENCE.md)** for automation scripts

## Code Examples

### Basic Usage

```clojure
;; Configuration file
{:mcp-servers
 {:filesystem {:command "npx"
               :args ["@modelcontextprotocol/server-filesystem" "/tmp"]}}

 :outputs
 [{:schema :mcp.json :path "~/.config/claude/mcp.json"}
  {:schema :vscode.json :path "~/.vscode/settings.json"}]}

;; CLI usage
clojure -M:tasks sync-all --edn config/mcp.edn
```

### Advanced Integration

```clojure
;; Programmatic usage
(require '[clj-hacks.mcp.ops :as ops])

;; Synchronize all configurations
(ops/sync-all! config "." (:outputs config))

;; Health check
(ops/doctor config ".")
```

## Architecture Highlights

### Adapter Pattern

```clojure
;; All adapters implement this interface
(defprotocol Adapter
  (read-full [path] "Read configuration from file")
  (write-full [path data] "Write configuration to file"))

;; Example adapter usage
(def adapter (get adapters :mcp.json))
(adapter/read-full "~/.config/claude/mcp.json")
(adapter/write-full target config)
```

### Canonical Data Model

```clojure
{:mcp {:mcp-servers {<server-key> <server-spec>}
        :http {:transport :http
               :base-url <string>
               :tools [<tool-ids>]
               :endpoints {<endpoint-key> <endpoint-spec>}}}
 :outputs [{:schema <keyword> :path <string>} ...]}
```

## Integration Patterns

### IDE Integration

- **VSCode**: Extension for automatic synchronization
- **Emacs**: Package with key bindings and hooks
- **JetBrains**: Plugin for configuration management

### CI/CD Integration

- **GitHub Actions**: Automated deployment workflows
- **GitLab CI**: Pipeline integration
- **Jenkins**: Build and deployment automation

### Monitoring Integration

- **Prometheus**: Metrics collection
- **Grafana**: Dashboard visualization
- **Alerting**: Health check notifications

## Development Guidelines

### Adding New Adapters

1. Create adapter namespace implementing `read-full` and `write-full`
2. Register in `clj-hacks.mcp.merge/adapters`
3. Add comprehensive tests
4. Update documentation

### Testing

```bash
# Run all tests
clojure -M:tasks test

# Test specific adapter
clojure -M:test -n clj-hacks.mcp.adapter-mcp-json-test

# Lint code
clojure -M:tasks lint
```

### Building

```bash
# Build package
clojure -M:tasks build

# Prepare dependencies
clojure -M:tasks prepare
```

## Troubleshooting

### Common Issues

1. **Path Resolution**: Use `doctor` command to check paths
2. **Permission Errors**: Verify file permissions for target directories
3. **Format Errors**: Validate configuration before deployment
4. **Sync Failures**: Check network connectivity and server availability

### Debug Mode

```clojure
;; Enable debug logging
(require '@promethean-os/logger')
(def logger (logger/create :mcp-bridge {:level :debug}))

;; Debug operations
(logger/debug logger "Configuration loaded" {:config-file "config/mcp.edn"})
```

## Best Practices

1. **Version Control**: Keep all configurations in version control
2. **Environment Variables**: Use for sensitive data
3. **Validation**: Always run `doctor` before deployment
4. **Backups**: Create backups before major changes
5. **Testing**: Test in development environments first
6. **Monitoring**: Set up health checks and alerts

## Community and Support

### Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new functionality
4. Update documentation
5. Submit pull request

### Issues

Report issues with:

- Configuration file examples
- Error messages and stack traces
- System environment details
- Expected vs actual behavior

### Discussions

Use discussions for:

- Questions about usage
- Integration help
- Feature requests
- Best practice sharing

## Related Documentation

- **[Promethean README](../../../README.md)** - Overall project documentation
- **[Kanban Documentation](../../kanban/docs/)** - Task management system
- **[Logger Documentation](../../logger/docs/)** - Logging integration
- **[Platform Core Documentation](../../platform-core/docs/)** - Core services

---

This documentation suite provides comprehensive guidance for using, extending, and integrating the MCP Bridge package within the Promethean ecosystem.
