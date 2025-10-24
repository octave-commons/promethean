# Ecosystem DSL

A powerful Clojure DSL for generating enhanced PM2 ecosystem configurations from simple EDN files.

## Overview

The Ecosystem DSL transforms simple, declarative EDN files into sophisticated PM2 ecosystem configurations with advanced features like:

- 🚀 **Nx Integration** - Intelligent affected project detection
- 📊 **Comprehensive Logging** - Structured logging with rotation
- 🔧 **Performance Optimization** - Memory limits, restart policies
- 👀 **File Watching** - Auto-regeneration on EDN changes
- 🛡️ **Error Handling** - Robust restart and recovery
- 📈 **Monitoring** - Health checks and metrics
- 🌍 **Environment Awareness** - Development/production optimizations

## Quick Start

### 1. Basic Usage

```bash
# Generate ecosystem configuration from EDN files
./scripts/generate-ecosystem.clj

# Or using Clojure directly
clojure -M:ecosystem

# Generate and watch for changes
./scripts/generate-ecosystem.clj --watch

# Validate EDN files only
./scripts/generate-ecosystem.clj --validate-only

# Show generation statistics
./scripts/generate-ecosystem.clj --stats
```

### 2. EDN File Structure

Create simple EDN files in your `system/` directory:

```clojure
;; system/daemons/services/autocommit/ecosystem.edn
{:apps [{:name "autocommit"
         :script "pnpm"
         :cwd "/home/err/devel/promethean"
         :args ["autocommit" "--path" "." "--debounce-ms" "10000"]
         :env {:OPENAI_BASE_URL "http://localhost:11434"
               :AUTOCOMMIT_MODEL "error/qwen3:4b-instruct-100k"
               :NODE_ENV "production"}
         :instances 1
         :autorestart true
         :watch ["./packages/autocommit/dist"]}]}
```

### 3. Generated Output

The DSL generates a comprehensive `ecosystem.config.enhanced.mjs` with:

- Automatic Nx watcher integration
- Enhanced logging configuration
- Performance optimizations
- Error handling policies
- Environment-specific settings
- Monitoring and health checks

## Command Line Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--dir` | `-d` | System directory containing EDN files | `system` |
| `--output` | `-o` | Output ecosystem file | `ecosystem.config.enhanced.mjs` |
| `--watch` | `-w` | Enable file watching for auto-regeneration | `false` |
| `--validate-only` | `-v` | Only validate EDN files, don't generate | `false` |
| `--stats` | `-s` | Show generation statistics | `false` |
| `--cleanup` | `-c` | Clean up old generated files | `false` |
| `--help` | `-h` | Show help message | - |

## DSL Architecture

### Core Components

1. **Core DSL** (`ecosystem-dsl.core`) - Main generation logic
2. **Enhancement System** - Modular enhancement patterns
3. **File Discovery** - Recursive EDN file discovery
4. **JavaScript Generation** - PM2-compatible output
5. **File Watching** - Auto-regeneration on changes

### Enhancement System

The DSL uses a modular enhancement system where each enhancement adds specific capabilities:

```clojure
;; Built-in enhancements
(defenhancement logging [config] ...)
(defenhancement performance [config] ...)
(defenhancement monitoring [config] ...)
(defenhancement error-handling [config] ...)
(defenhancement development [config] ...)
(defenhancement production [config] ...)
```

### Configuration Builders

Specialized builders for different process types:

```clojure
;; Nx watcher (always included)
(create-nx-watcher-config)

;; Development servers
(create-dev-server-config "my-project" :frontend)
(create-dev-server-config "my-service" :service)

;; Background tasks
(create-background-task-config "task-name" "script" ["args"])
```

## Advanced Usage

### Custom Enhancements

Define your own enhancement patterns:

```clojure
(defenhancement custom-security
  "Add security enhancements."
  [config]
  (merge config
         {:env (merge (:env config {})
                     {:SECURITY_LEVEL "high"
                      :ENABLE_AUDIT "true"})}))

;; Apply to configuration
(-> base-config
    (with-enhancements logging performance custom-security))
```

### Environment-Specific Generation

```bash
# Development environment
NODE_ENV=development ./scripts/generate-ecosystem.clj

# Production environment  
NODE_ENV=production ./scripts/generate-ecosystem.clj

# With verbose Nx logging
NX_VERBOSE_LOGGING=true ./scripts/generate-ecosystem.clj
```

### File Watching

Enable automatic regeneration when EDN files change:

```bash
./scripts/generate-ecosystem.clj --watch
```

The watcher monitors:
- File creation in `system/` directories
- Modifications to existing `ecosystem.edn` files
- File deletions

## Integration with PM2

### Start the Generated Ecosystem

```bash
# Start all processes
pm2 start ecosystem.config.enhanced.mjs

# Start specific environment
NODE_ENV=production pm2 start ecosystem.config.enhanced.mjs

# Reload after changes
pm2 reload ecosystem.config.enhanced.mjs
```

### Monitor Processes

```bash
# Show process status
pm2 status

# View logs
pm2 logs

# Monitor specific app
pm2 logs autocommit
```

## File Structure

```
packages/ecosystem-dsl/
├── src/
│   └── ecosystem_dsl/
│       ├── core.clj          # Main DSL logic
│       └── script.clj        # Script entry point
├── package.json             # Package configuration
├── shadow-cljs.edn          # Shadow-CLJS build config
└── README.md               # This file

scripts/
└── generate-ecosystem.clj   # Main generation script

system/                      # Your EDN files
├── daemons/
│   ├── services/
│   │   └── autocommit/
│   │       └── ecosystem.edn
│   └── devops/
└── services/
```

## Development

### Building the DSL

```bash
# Build the package
pnpm --filter @promethean-os/ecosystem-dsl build

# Run tests
pnpm --filter @promethean-os/ecosystem-dsl test

# Lint code
pnpm --filter @promethean-os/ecosystem-dsl lint
```

### Testing the DSL

```bash
# Test with sample EDN files
clojure -M:ecosystem --dir test/fixtures/system --validate-only

# Generate to test output
clojure -M:ecosystem --output test-output.mjs
```

## Troubleshooting

### Common Issues

1. **No EDN files found**
   ```
   ❌ No ecosystem.edn files found in system
   ```
   - Ensure you have `ecosystem.edn` files in your `system/` directory
   - Check file permissions

2. **Invalid EDN structure**
   ```
   ❌ Error in ecosystem.edn: Invalid EDN structure
   ```
   - Verify EDN syntax with online validator
   - Check for unmatched brackets/parentheses

3. **Missing dependencies**
   ```
   Could not find ecosystem-dsl.core
   ```
   - Run `pnpm install` to install dependencies
   - Check `deps.edn` configuration

### Debug Mode

Enable verbose logging:

```bash
NX_VERBOSE_LOGGING=true ./scripts/generate-ecosystem.clj --stats
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## License

MIT License - see LICENSE file for details.