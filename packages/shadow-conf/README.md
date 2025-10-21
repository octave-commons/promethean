# @promethean/shadow-conf

[![npm version](https://badge.fury.io/js/%40promethean%2Fshadow-conf.svg)](https://badge.fury.io/js/%40promethean%2Fshadow-conf)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://opensource.org/licenses/GPL-3.0)

A powerful configuration transformation tool that converts EDN (Extensible Data Notation) files into PM2 ecosystem configurations. This package enables declarative service management using Clojure-style configuration while generating production-ready PM2 setups.

## 🚀 Features

- **EDN to PM2 Conversion**: Transform Clojure-style EDN configurations into PM2 ecosystem files
- **Declarative Service Management**: Define apps, triggers, schedules, and actions in a structured format
- **Path Normalization**: Automatically resolves relative paths against output directory
- **TypeScript Support**: Full TypeScript definitions for enhanced development experience
- **CLI Tool**: Command-line interface for easy integration into build processes
- **Environment Integration**: Built-in dotenv support for environment variable management
- **Recursive Discovery**: Automatically discovers all `.edn` files in input directory

## 📦 Installation

```bash
# Install as a dependency
pnpm add @promethean/shadow-conf

# Install globally for CLI usage
pnpm add -g @promethean/shadow-conf
```

## 🎯 Quick Start

### 1. Create EDN Configuration Files

Create `.edn` files in your project directory defining your services:

```clojure
;; services/api/ecosystem.edn
{:apps [{:name "api-service"
         :script "./dist/index.js"
         :cwd "./services/api"
         :instances "max"
         :exec_mode "cluster"
         :env {:NODE_ENV "production"
               :PORT "3000"}
         :env_file "./.env.production"
         :watch ["./src" "./config"]
         :max_memory_restart "1G"}]
 
 :triggers [{:name "api-ready"
             :event "api/ready"
             :actions ["notify-team"]}]
 
 :schedules [{:name "api-health-check"
              :cron "*/5 * * * *"
              :actions ["health-check"]}]
 
 :actions [{:name "notify-team"
            :type "webhook"
            :url "https://hooks.slack.com/..."
            :message "API service is ready"}
           {:name "health-check"
            :type "http"
            :url "http://localhost:3000/health"}]}
```

```clojure
;; services/worker/ecosystem.edn
{:apps [{:name "background-worker"
         :script "./dist/worker.js"
         :cwd "./services/worker"
         :instances 2
         :env {:NODE_ENV "production"}
         :watch ["./src"]}]}
```

### 2. Generate PM2 Ecosystem

```bash
# Using CLI
shadow-conf ecosystem --input-dir ./services --out ./config --filename ecosystem.config.mjs

# Or programmatically
import { generateEcosystem } from '@promethean/shadow-conf';

const result = await generateEcosystem({
  inputDir: './services',
  outputDir: './config',
  fileName: 'ecosystem.config.mjs'
});

console.log(`Generated ${result.outputPath} with ${result.apps.length} apps`);
```

### 3. Use with PM2

```bash
# Start all services
pm2 start ./config/ecosystem.config.mjs

# Monitor
pm2 monit

# View logs
pm2 logs
```

## 📖 API Documentation

### Core Functions

#### `generateEcosystem(options)`

Generates a PM2 ecosystem configuration from EDN files.

```typescript
import { generateEcosystem, type GenerateEcosystemOptions } from '@promethean/shadow-conf';

const options: GenerateEcosystemOptions = {
  inputDir: './config',        // Directory containing .edn files
  outputDir: './dist',         // Output directory for generated file
  fileName: 'ecosystem.mjs'    // Name of generated file
};

const result = await generateEcosystem(options);
```

**Parameters:**
- `options.inputDir` (string, optional): Directory containing EDN files. Defaults to `process.cwd()`
- `options.outputDir` (string, optional): Output directory. Defaults to `process.cwd()`
- `options.fileName` (string, optional): Generated filename. Defaults to `'ecosystem.config.mjs'`

**Returns:** `Promise<GenerateEcosystemResult>`

```typescript
interface GenerateEcosystemResult {
  readonly apps: readonly AppRecord[];
  readonly triggers: readonly AutomationRecord[];
  readonly schedules: readonly AutomationRecord[];
  readonly actions: readonly AutomationRecord[];
  readonly files: readonly string[];
  readonly outputPath: string;
}
```

### Type Definitions

#### `AppRecord`

Represents a PM2 application configuration:

```typescript
interface AppRecord {
  readonly name: string;
  readonly script?: string;
  readonly cwd?: string;
  readonly instances?: number | string;
  readonly exec_mode?: 'fork' | 'cluster';
  readonly env?: Record<string, string | number | boolean>;
  readonly env_file?: string;
  readonly watch?: string | readonly string[];
  readonly max_memory_restart?: string;
  readonly min_uptime?: string;
  readonly max_restarts?: number;
  readonly error_file?: string;
  readonly out_file?: string;
  readonly log_file?: string;
  readonly time?: boolean;
  // ... other PM2 options
}
```

#### `AutomationRecord`

Represents automation configurations:

```typescript
interface AutomationRecord {
  readonly name: string;
  readonly type?: string;
  readonly event?: string;
  readonly cron?: string;
  readonly actions?: readonly string[];
  readonly url?: string;
  readonly message?: string;
  readonly command?: string;
  // ... other automation properties
}
```

## 🛠 CLI Usage

### Commands

```bash
# Show help
shadow-conf --help

# Generate ecosystem configuration
shadow-conf ecosystem [options]
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--input-dir <path>` | Directory containing `.edn` files | Current working directory |
| `--out <path>` | Output directory for generated file | Current working directory |
| `--filename <name>` | Name of generated file | `ecosystem.config.mjs` |

### Examples

```bash
# Basic usage
shadow-conf ecosystem

# Custom directories and filename
shadow-conf ecosystem \
  --input-dir ./services \
  --out ./config \
  --filename production.ecosystem.mjs

# Using inline values
shadow-conf ecosystem --input-dir=./config --filename=ecosystem.mjs
```

## 📝 EDN Configuration Format

### Document Structure

Each EDN file can contain four main sections:

```clojure
{:apps [...]        ; Application definitions
 :triggers [...]    ; Event-based automations
 :schedules [...]   ; Time-based automations
 :actions [...]     ; Reusable action definitions}
```

### Apps Section

Defines PM2 applications:

```clojure
{:apps [{:name "web-app"
         :script "./dist/server.js"
         :cwd "./apps/web"
         :instances 4
         :exec_mode "cluster"
         :env {:NODE_ENV "production"
               :PORT "8080"
               :DATABASE_URL "postgresql://..."}
         :env_file "./.env.production"
         :watch ["./src" "./config"]
         :max_memory_restart "512M"
         :min_uptime "10s"
         :max_restarts 5
         :error_file "./logs/error.log"
         :out_file "./logs/out.log"
         :time true}]}
```

### Triggers Section

Event-based automations:

```clojure
{:triggers [{:name "app-ready"
             :event "app/ready"
             :actions ["notify-slack" "run-health-check"]}
            {:name "error-threshold"
             :event "app/error-rate-high"
             :actions ["restart-app" "alert-team"]}]}
```

### Schedules Section

Time-based automations:

```clojure
{:schedules [{:name "daily-backup"
              :cron "0 2 * * *"  ; Daily at 2 AM
              :actions ["backup-database"]}
             {:name "health-check"
              :cron "*/5 * * * *"  ; Every 5 minutes
              :actions ["check-services"]}]}
```

### Actions Section

Reusable action definitions:

```clojure
{:actions [{:name "notify-slack"
            :type "webhook"
            :url "https://hooks.slack.com/..."
            :method "POST"
            :headers {:Content-Type "application/json"}
            :body {:text "{{message}}"}}
           {:name "backup-database"
            :type "command"
            :command "./scripts/backup.sh"
            :env {:BACKUP_PATH "./backups"}}
           {:name "restart-app"
            :type "pm2"
            :command "restart web-app"}]}
```

## 🔧 Advanced Configuration

### Path Resolution

The package automatically normalizes relative paths:

- **Relative paths** (`./`, `../`) are resolved against the output directory
- **Absolute paths** are preserved as-is
- **Array paths** in `watch` and `env` are processed individually

```clojure
{:apps [{:name "app"
         :script "./dist/index.js"     ; Becomes "./dist/index.js"
         :cwd "./apps/app"             ; Becomes "./apps/app"
         :watch ["./src" "../shared"]  ; Becomes ["./src", "../shared"]
         :env {:CONFIG "./config/app.edn"}}]} ; Becomes {:CONFIG "./config/app.edn"}
```

### Environment Variables

Generated files include dotenv integration:

```javascript
// Generated ecosystem.config.mjs
import dotenv from "dotenv";

try {
  dotenv.config();
} catch (error) {
  if (error?.code !== "ERR_MODULE_NOT_FOUND") {
    throw error;
  }
}

export const apps = [
  // Your app configurations
];
```

### Multiple EDN Files

The package recursively discovers and merges all `.edn` files:

```
services/
├── api/
│   └── ecosystem.edn
├── worker/
│   └── ecosystem.edn
├── web/
│   └── ecosystem.edn
└── shared/
    └── ecosystem.edn
```

All apps, triggers, schedules, and actions are aggregated into a single ecosystem file.

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run with coverage
pnpm coverage

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

## 🔍 Troubleshooting

### Common Issues

#### 1. "EDN document did not evaluate to a map"

**Problem**: Your EDN file doesn't have a top-level map structure.

**Solution**: Ensure your EDN file starts and ends with curly braces:

```clojure
;; ❌ Wrong
{:apps [...]}

;; ✅ Correct
{:apps [{:name "app"}]}
```

#### 2. "Missing an :apps vector"

**Problem**: The EDN document doesn't contain an `:apps` section.

**Solution**: Add an `:apps` section even if empty:

```clojure
{:apps []}
```

#### 3. Path Resolution Issues

**Problem**: Generated paths don't match expected locations.

**Solution**: Understand path resolution rules:
- Relative paths are resolved against the **output directory**
- Use absolute paths for files outside the output directory
- Test with different `--out` options

#### 4. Module Import Errors

**Problem**: Generated ecosystem file can't be imported.

**Solution**: Ensure:
- File extension matches your Node.js version (`.mjs` for ES modules)
- Node.js version supports ES modules (v14+)
- No syntax errors in your EDN files

### Debug Mode

Enable verbose logging to debug issues:

```bash
# Use Node.js debug mode
DEBUG=* shadow-conf ecosystem --input-dir ./config
```

### Validation

Validate your EDN files before processing:

```bash
# Using jsedn CLI (if available)
jsedn your-config.edn

# Or create a simple validation script
import { loadEdnFile } from '@promethean/shadow-conf';

try {
  const config = await loadEdnFile('./ecosystem.edn');
  console.log('✅ EDN file is valid');
} catch (error) {
  console.error('❌ Invalid EDN:', error.message);
}
```

## 🏗 Architecture

### Package Structure

```
src/
├── ecosystem.ts     # Core generation logic
├── edn.ts          # EDN parsing and normalization
├── index.ts        # Public API exports
├── bin/
│   └── shadow-conf.ts  # CLI implementation
└── tests/
    └── ecosystem.test.ts  # Test suite
```

### Design Principles

1. **Declarative Configuration**: Use EDN for human-readable configuration
2. **Type Safety**: Full TypeScript support with comprehensive types
3. **Path Awareness**: Intelligent path resolution for different deployment scenarios
4. **Extensibility**: Support for custom automation and actions
5. **Error Handling**: Clear error messages for common configuration issues

### Data Flow

```
EDN Files → Parser → Normalizer → Aggregator → Generator → PM2 Ecosystem
```

1. **Discovery**: Recursively find all `.edn` files
2. **Parsing**: Convert EDN to JavaScript objects
3. **Normalization**: Strip EDN keywords, normalize paths
4. **Aggregation**: Merge all configurations
5. **Generation**: Create PM2-compatible JavaScript module

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/promethean/shadow-conf.git
cd shadow-conf

# Install dependencies
pnpm install

# Run tests
pnpm test

# Build the package
pnpm build
```

### Code Style

- Use TypeScript for all new code
- Follow the existing code style
- Add tests for new features
- Update documentation for API changes

## 📄 License

This project is licensed under the GPL-3.0 License. See the [LICENSE](./LICENSE) file for details.

## 🔗 Related Packages

- [@promethean/pm2-helpers](https://github.com/promethean/pm2-helpers) - PM2 utility functions
- [jsedn](https://github.com/edn-format/jsedn) - EDN parser for JavaScript

## 📞 Support

- Create an issue on [GitHub](https://github.com/promethean/shadow-conf/issues)
- Check the [documentation](https://github.com/promethean/shadow-conf/wiki)
- Join our [Discord community](https://discord.gg/promethean)