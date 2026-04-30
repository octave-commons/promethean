# Centralized Clojure MCP Server

A unified Model Context Protocol (MCP) server system that provides comprehensive Clojure development support across all runtimes - JVM, ClojureScript, and Babashka.

## Overview

The centralized MCP server provides a single entry point for Clojure development tools, supporting:

- **JVM Clojure** - Traditional JVM-based Clojure development
- **ClojureScript** - Browser and Node.js ClojureScript development  
- **Babashka** - Scripting and task automation
- **Shadow-CLJS** - Advanced ClojureScript build tool integration
- **REPL Integration** - nREPL and Shadow-CLJS REPL support

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Opencode      │    │  MCP Clients     │    │  Development    │
│   IDE/CLI       │◄──►│  (Various)       │◄──►│  Tools          │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │  Centralized     │
                       │  MCP Server      │
                       │  (Ports 7890-7893)│
                       └──────────────────┘
                                │
                    ┌───────────┼───────────┐
                    ▼           ▼           ▼
            ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
            │ JVM Runtime │ │ CLJS Runtime│ │ BB Runtime  │
            │ (Port 7888) │ │ (Shadow)    │ │ (Tasks)     │
            └─────────────┘ └─────────────┘ └─────────────┘
```

## Server Modes

### Unified Server (Port 7890)
- **Purpose**: Supports all Clojure runtimes in a single server
- **Use Case**: General development when working with multiple runtime types
- **Command**: `./mcp-server.sh unified 7890`

### JVM Server (Port 7891)  
- **Purpose**: JVM Clojure development only
- **Use Case**: Backend development, traditional Clojure applications
- **Command**: `./mcp-server.sh jvm 7891`

### ClojureScript Server (Port 7892)
- **Purpose**: ClojureScript and Shadow-CLJS development
- **Use Case**: Frontend development, React applications, Node.js targets
- **Command**: `./mcp-server.sh cljs 7892`

### Development Server (Port 7890)
- **Purpose**: Development mode with detailed logging
- **Use Case**: Debugging MCP server issues, development
- **Command**: `./mcp-server.sh dev 7890`

### Test Server (Port 7893)
- **Purpose**: Test mode for validation
- **Use Case**: Automated testing, CI/CD pipelines
- **Command**: `./mcp-server.sh test 7893`

## Available Tools

### Runtime Management
- `detect-runtime` - Detect current Clojure runtime (JVM/CLJS/BB)
- `get-runtime-info` - Get detailed runtime information
- `switch-runtime` - Switch between different runtimes

### Code Evaluation
- `eval-clojure` - Evaluate Clojure code in appropriate runtime
- `eval-babashka` - Execute Babashka tasks
- `eval-shadow` - Evaluate ClojureScript via Shadow-CLJS

### Project Management
- `get-project-info` - Get project configuration and dependencies
- `list-aliases` - Available Clojure aliases
- `run-test` - Execute project tests
- `build-project` - Build project for current runtime

### REPL Integration
- `connect-repl` - Connect to nREPL (port 7888)
- `send-to-repl` - Send code to active REPL
- `get-repl-status` - Check REPL connection status

### File Operations
- `read-clj-file` - Read Clojure source files with parsing
- `write-clj-file` - Write Clojure files with formatting
- `format-code` - Format Clojure code using cljfmt
- `lint-code` - Lint code using clj-kondo

### Documentation
- `get-docs` - Get documentation for symbols
- `find-definitions` - Find symbol definitions
- `get-function-info` - Get function signatures and metadata

## Configuration

### Opencode Integration

The MCP server is integrated with Opencode through `opencode.json` configurations:

```json
{
  "mcp": {
    "clojure-centralized": {
      "type": "local",
      "command": ["./mcp-server.sh", "unified", "7890"],
      "enabled": true,
      "description": "Centralized Clojure MCP server for all runtimes"
    },
    "clojure-jvm": {
      "type": "local", 
      "command": ["./mcp-server.sh", "jvm", "7891"],
      "enabled": true,
      "description": "JVM Clojure development MCP server"
    },
    "clojure-cljs": {
      "type": "local",
      "command": ["./mcp-server.sh", "cljs", "7892"], 
      "enabled": true,
      "description": "ClojureScript development MCP server"
    }
  }
}
```

### Repository-Specific Configurations

Different repositories use different server configurations:

- **Root workspace**: Uses unified server for general development
- **Promethean**: Uses JVM and CLJS servers for full-stack development
- **Openhax**: Uses CLJS-optimized server for Reactant development
- **STT Opencode**: Uses unified server for tool development

## Usage Examples

### Starting the Server

```bash
# Start unified server (recommended for most use cases)
./mcp-server.sh unified 7890

# Start JVM-only server
./mcp-server.sh jvm 7891

# Start ClojureScript-only server  
./mcp-server.sh cljs 7892

# Start development server with logging
./mcp-server.sh dev 7890
```

### Connecting from Opencode

1. Open Opencode in any Clojure project directory
2. The appropriate MCP server will be automatically selected based on:
   - Project type (JVM vs CLJS vs BB)
   - Available configuration in `opencode.json`
   - Repository-specific settings

3. Use Opencode's chat interface to interact with Clojure tools:

```
User: "What dependencies does this project have?"
MCP: [Uses get-project-info tool] Shows project dependencies

User: "Run the tests for the user module"  
MCP: [Uses run-test tool] Executes tests and shows results

User: "Connect to REPL and evaluate (map inc [1 2 3])"
MCP: [Uses connect-repl + send-to-repl] Returns (2 3 4)
```

### Direct Tool Usage

The MCP server exposes tools that can be used directly:

```clojure
;; Detect current runtime
{:tool "detect-runtime"}
;; => {:runtime :jvm, :version "1.12.1"}

;; Evaluate code
{:tool "eval-clojure", :code "(+ 1 2 3)"}
;; => {:result 6, :runtime :jvm}

;; Get project info
{:tool "get-project-info"}
;; => {:name "my-project", :dependencies {...}, :aliases {...}}
```

## Development

### Project Structure

```
src/centralized_clojure_mcp/
├── server.clj              # Main MCP server implementation
├── runtime/                # Runtime-specific implementations
│   ├── jvm.clj            # JVM Clojure runtime
│   ├── cljs.clj           # ClojureScript runtime  
│   └── babashka.clj       # Babashka runtime
├── tools/                  # MCP tool implementations
│   ├── evaluation.clj     # Code evaluation tools
│   ├── project.clj        # Project management tools
│   ├── repl.clj           # REPL integration tools
│   └── filesystem.clj     # File operation tools
└── prompts/               # MCP prompt templates
    ├── clojure-assistant.edn
    ├── project-manager.edn
    └── runtime-guide.edn
```

### Adding New Tools

1. Create tool implementation in `src/centralized_clojure_mcp/tools/`
2. Register tool in `server.clj` main function
3. Add documentation and examples
4. Test with all runtime configurations

### Runtime Extensions

To add support for new Clojure runtimes:

1. Create runtime implementation in `src/centralized_clojure_mcp/runtime/`
2. Implement required protocols: `RuntimeProtocol`, `EvaluationProtocol`
3. Register runtime in runtime detection logic
4. Add runtime-specific tools and prompts

## Troubleshooting

### Common Issues

**Server won't start:**
- Check Clojure installation: `clojure --version`
- Verify dependencies in `deps.edn`
- Check port availability: `netstat -an | grep 7890`

**MCP connection fails:**
- Verify `opencode.json` configuration
- Check server is running on correct port
- Review firewall settings

**Runtime detection issues:**
- Check project structure (deps.edn, shadow-cljs.edn, bb.edn)
- Verify build tools are installed
- Review runtime-specific configurations

### Debug Mode

Start server in development mode for detailed logging:

```bash
./mcp-server.sh dev 7890
```

This enables:
- Detailed request/response logging
- Runtime detection diagnostics
- Error stack traces
- Performance metrics

### Log Files

- Server logs: Console output (development mode)
- Runtime logs: Respective runtime log files
- Error logs: Console and runtime-specific error handlers

## Integration Examples

### VS Code Integration

```json
{
  "mcp.servers": {
    "clojure-centralized": {
      "command": "/path/to/mcp-server.sh",
      "args": ["unified", "7890"]
    }
  }
}
```

### Emacs Integration

```elisp
(setq mcp-servers
      '((clojure-centralized . ("/path/to/mcp-server.sh" "unified" "7890"))))
```

### CLI Integration

```bash
# Direct MCP communication
echo '{"tool": "detect-runtime"}' | nc localhost 7890

# Using MCP client tools
mcp-client --server localhost:7890 --tool eval-clojure --code "(+ 1 2)"
```

## Performance Considerations

### Server Optimization

- **Unified Server**: Best for most use cases, single process overhead
- **Specialized Servers**: Use when working with specific runtime types only
- **Port Allocation**: Ensure no port conflicts (7890-7893 reserved)

### Runtime Performance

- **JVM**: Warm startup time, best for long-running sessions
- **ClojureScript**: Fast compilation with Shadow-CLJS
- **Babashka**: Instant startup, best for scripts and tasks

### Memory Usage

- **Unified Server**: ~200-500MB base memory
- **JVM Runtime**: Additional 512MB-2GB depending on workload
- **CLJS Runtime**: ~100-300MB for compilation
- **Babashka**: ~50-100MB minimal footprint

## Security Considerations

### Code Execution

- All code evaluation runs in isolated runtime contexts
- File system access is restricted to project directories
- Network access requires explicit configuration
- MCP server runs with minimal privileges

### Configuration Security

- API keys and secrets use environment variable placeholders
- Server configurations validate command arguments
- Runtime detection prevents unauthorized code execution
- File operations are sandboxed to project roots

## Contributing

### Development Setup

1. Clone repository with submodules:
   ```bash
   git clone --recurse-submodules /path/to/repo
   ```

2. Install dependencies:
   ```bash
   clojure -M:dev
   ```

3. Run tests:
   ```bash
   clojure -M:test
   ```

4. Start development server:
   ```bash
   ./mcp-server.sh dev 7890
   ```

### Pull Request Process

1. Fork repository
2. Create feature branch
3. Add tests for new functionality
4. Ensure all existing tests pass
5. Update documentation
6. Submit pull request with description

### Code Style

- Follow Clojure style guidelines
- Use functional programming patterns
- Add comprehensive docstrings
- Include error handling
- Write tests for all tools

## License

This project is licensed under the same terms as Clojure. See LICENSE file for details.

## Support

- **Issues**: Report via GitHub issues
- **Discussions**: Use GitHub discussions for questions
- **Documentation**: Check this README and code comments
- **Community**: Join Clojure community forums for general help