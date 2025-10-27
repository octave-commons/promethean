# Clojure LSP Configuration for Promethean Framework

This document describes the comprehensive OpenCode LSP configuration for all Clojure-related development in the Promethean Framework.

## Configuration File Location

`.lsp/config.edn`

## Supported File Extensions

The LSP server now supports all Clojure ecosystem file types:

- **`.clj`** - Clojure source files
- **`.cljs`** - ClojureScript source files
- **`.cljc`** - Clojure CLR (common) source files
- **`.bb`** - Babashka script files

## Source Paths Coverage

### Global Source Paths

- `bb/src` - Babashka source files
- `mk` - Root-level Clojure utilities
- `packages/*/src` - All package source directories
- `packages/*/src/cljs` - ClojureScript sources
- `packages/*/src/main` - Main source directories
- `packages/*/src/test` - Test source directories
- `docs/agile/rules` - Documentation rule files (Clojure)

### Specific Package Coverage

- `packages/clj-hacks/src` - Native Clojure package sources
- `packages/clj-hacks/verify.clj` - Standalone verification script

## Test Paths Coverage

- `packages/*/test` - All package test directories
- `bb/test` - Babashka test files
- `packages/clj-hacks/test` - Native Clojure package tests

## Ignored Paths

The configuration excludes temporary and build directories:

- `resources/`, `target/`, `node_modules/`, `dist/`, `build/`
- `.direnv/`, `.venv/`, `.cache/`
- `packages/*/dist/`, `packages/*/out/`
- `.clj-kondo/` (linter configs)
- Temporary test directories (`test-comprehensive*`, `test-kanban*`, etc.)

## Project Specifications

### Shadow-CLJS Projects

- **Type**: `shadow-cljs`
- **Config**: `shadow-cljs.edn`
- **Coverage**: All packages with shadow-cljs configurations

### Clj-Hacks Project

- **Type**: `gradle` (native Clojure project)
- **Root**: `packages/clj-hacks`
- **Source Paths**: `src`
- **Test Paths**: `test`

## Key Features

### 1. Complete File Extension Support

All Clojure ecosystem files are now recognized by the LSP server, including Babashka scripts.

### 2. Comprehensive Path Coverage

The configuration covers:

- All package structures in the monorepo
- Root-level Clojure utilities
- Documentation-based Clojure files
- Native Clojure projects with custom structures

### 3. Project-Specific Configuration

Special handling for:

- Shadow-CLJS projects (common in frontend packages)
- Native Clojure projects (like clj-hacks)

### 4. Performance Optimization

Ignored paths prevent the LSP from indexing:

- Build artifacts and dependencies
- Temporary test directories
- Configuration files

## Usage

### LSP Server Features Available

- **Code completion** for all Clojure variants
- **Syntax highlighting** for `.clj`, `.cljs`, `.cljc`, `.bb` files
- **Error checking** and linting via clj-kondo integration
- **Go to definition** across all Clojure sources
- **Refactoring** support
- **Documentation lookup**

### IDE Integration

Most modern editors (VS Code, Emacs, IntelliJ, etc.) will automatically use this configuration when:

1. The `.lsp/config.edn` file is present
2. Clojure LSP extensions are installed
3. The project root is detected

## Verification

To verify the configuration is working:

1. **Check LSP Status**: Most editors show LSP connection status
2. **Test Completion**: Open any `.clj`, `.cljs`, `.cljc`, or `.bb` file and test code completion
3. **Verify Navigation**: Try "go to definition" on symbols
4. **Check Error Detection**: Introduce syntax errors to see linting

## Troubleshooting

### Common Issues

1. **LSP not starting**: Check that `clojure-lsp` is installed and in PATH
2. **Missing completions**: Verify file extensions are recognized
3. **Slow performance**: Check if too many directories are being indexed

### Debug Commands

```bash
# Check LSP configuration
clojure-lsp --config-file .lsp/config.edn --dry-run

# Verify paths are recognized
clojure-lsp --config-file .lsp/config.edn --analyze
```

## Future Enhancements

Potential improvements to consider:

1. **Workspace-specific configurations** for different development contexts
2. **Custom linting rules** via clj-kondo configuration
3. **Performance tuning** for large monorepo operations
4. **Integration with build tools** (Leiningen, tools.deps, etc.)

This configuration ensures comprehensive Clojure development support across the entire Promethean Framework ecosystem.
