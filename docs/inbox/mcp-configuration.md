# MCP Configuration System

This document describes the MCP (Model Context Protocol) configuration system used in the Promethean project.

## Overview

The MCP configuration system generates multiple configuration formats from a single source of truth (`packages/mcp/config/mcp_servers.edn`). This allows different tools and applications to consume MCP server configurations in their native formats while maintaining a single source for server definitions.

## Architecture

### Core Components

1. **Source Configuration**: `packages/mcp/config/mcp_servers.edn`
   - Single source of truth for all MCP server definitions
   - Contains server configurations with commands, args, cwd, and environment variables
   - Defines output targets with different schemas and file paths

2. **Configuration Adapters**: `packages/clj-hacks/src/clj_hacks/mcp/`
   - `adapter_mcp_json.clj`: Generates JSON configurations for different formats
   - `adapter_codex_toml.clj`: Generates TOML configurations for various tools
   - `core.clj`: Core utilities for configuration processing

3. **Output Formats**:
   - **promethean.mcp.json**: Internal format with separate HTTP metadata
   - **.mcp.json**: Claude Code format with HTTP servers as `{"type": "http", "url": "..."}`
   - **codex.toml**: TOML format for various code editors
   - **vscode.json**: VS Code extension format
   - **elisp**: Emacs Lisp configuration

## Configuration Formats

### Promethean Format (`promethean.mcp.json`)

- **Purpose**: Internal Promethean applications
- **Transport**: stdio only in mcpServers section
- **HTTP Configuration**: Separate metadata section with endpoints, tools, and transport info
- **Structure**:
  ```json
  {
    "mcpServers": {
      "server-name": {
        "command": "...",
        "args": [...],
        "cwd": "..."
      }
    },
    "transport": "http",
    "tools": [...],
    "endpoints": {...}
  }
  ```

### Claude Code Format (`.mcp.json`)

- **Purpose**: Claude Code desktop application
- **Transport**: Both stdio and HTTP in mcpServers section
- **HTTP Configuration**: Servers as `{"type": "http", "url": "..."}`
- **Structure**:
  ```json
  {
    "mcpServers": {
      "server-name": {
        "command": "..."
      },
      "http-default": {
        "type": "http",
        "url": "http://localhost:PORT/mcp"
      }
    },
    "transport": "http",
    "tools": [...],
    "endpoints": {...}
  }
  ```

## Usage

### Generating Configurations

The configuration system uses Clojure/Babashka scripts to generate the various output formats:

```bash
# From the clj-hacks directory
bb -e "(require '[clj-hacks.mcp.adapter-mcp-json :as adapter]) (adapter/write-full \"/path/to/output\" (adapter/read-full \"/path/to/mcp_servers.edn\"))"
```

### Configuration Management Scripts

The following npm scripts are available for MCP configuration management:

- `pnpm mcp:generate` - Generate all MCP configuration files
- `pnpm mcp:promethean` - Generate promethean.mcp.json only
- `pnpm mcp:claude-code` - Generate .mcp.json only
- `pnpm mcp:all` - Generate all configuration formats

### Adding New Servers

1. Edit `packages/mcp/config/mcp_servers.edn`
2. Add server configuration to `:mcp-servers` map
3. Run `pnpm mcp:generate` to update all output files
4. Commit both the source configuration and generated files

### Adding New Output Targets

1. Create adapter function for the new format if needed
2. Add output target to `:outputs` vector in `mcp_servers.edn`
3. Update generation scripts to include the new format
4. Test generation with `pnpm mcp:generate`

## File Locations

- **Source**: `packages/mcp/config/mcp_servers.edn`
- **Promethean**: `/home/err/devel/promethean/promethean.mcp.json`
- **Claude Code**: `/home/err/devel/promethean/.mcp.json`
- **Adapters**: `packages/clj-hacks/src/clj_hacks/mcp/`

## Development Notes

- The promethean format deliberately excludes HTTP servers from the mcpServers section to avoid noise
- The Claude Code format includes HTTP servers as `{"type": "http", "url": "..."}` entries
- Format detection is based on filename patterns (e.g., `.mcp.json` vs `promethean.mcp.json`)
- All generated files should be committed to version control
- The system supports both stdio and HTTP transport protocols

## Quick Reference

### Available Scripts

```bash
# Generate all MCP configurations
pnpm mcp:generate

# Generate specific formats
pnpm mcp:promethean    # Generate promethean.mcp.json only
pnpm mcp:claude-code   # Generate .mcp.json only
pnpm mcp:all          # Generate both formats

# Check configuration health
pnpm mcp:doctor       # Validate server paths and output targets

# Legacy compatibility
pnpm generate_mcp_configs  # Alias for pnpm mcp:generate
```

### Generated File Locations

| Format | Path | Size | Usage |
|--------|------|------|-------|
| promethean.json | `/home/err/devel/promethean/promethean.mcp.json` | ~55 lines | Internal Promethean apps |
| claude-code.json | `/home/err/devel/promethean/.mcp.json` | ~149 lines | Claude Code desktop |
| codex.toml | `/home/err/.codex/config.toml` | - | Various editors |
| vscode.json | `/home/err/.config/User/mcp.json` | - | VS Code extension |
| elisp | `/home/err/devel/promethean/.emacs/layers/llm/config.el` | - | Emacs MCP package |

### Key Differences

- **promethean.mcp.json**: HTTP servers in metadata, stdio only in mcpServers
- **.mcp.json**: HTTP servers as `{"type": "http", "url": "..."}` in mcpServers
- Both support the same server definitions from the single source EDN file

## Troubleshooting

### Common Issues

1. **Missing configurations**: Ensure `mcp_servers.edn` has the correct output targets
2. **Format errors**: Check that adapter functions handle the format correctly
3. **Path issues**: Verify absolute paths in server configurations
4. **Permission errors**: Ensure scripts have execute permissions
5. **Schema errors**: Verify schema names match those in `merge.clj` adapters map

### Debugging

- Use `pnpm mcp:doctor` to validate configuration health
- Check generated file sizes (promethean: ~55 lines, claude-code: ~149 lines)
- Verify JSON syntax with `jq .` or online validators
- Test MCP server connections with the target applications
- Check the CLI help: `cd packages/clj-hacks && clojure -M:mcp-cli`