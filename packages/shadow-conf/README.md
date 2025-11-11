# @promethean-os/shadow-conf

[![npm version](https://badge.fury.io/js/%40promethean%2Fshadow-conf.svg)](https://badge.fury.io/js/%40promethean%2Fshadow-conf)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://opensource.org/licenses/GPL-3.0)

A powerful configuration transformation tool that converts EDN (Extensible Data Notation) files into PM2 ecosystem configurations. This package enables declarative service management using Clojure-style configuration while generating production-ready PM2 setups.

## 🚀 Features

- **EDN to PM2 Conversion**: Transform Clojure-style EDN configurations into PM2 ecosystem files
- **AI-Driven Security Evaluation**: Contextual AI security assessment using Pantheon framework
- **Declarative Service Management**: Define apps, triggers, schedules, and actions in a structured format
- **Path Normalization**: Automatically resolves relative paths against output directory
- **TypeScript Support**: Full TypeScript definitions for enhanced development experience
- **CLI Tool**: Command-line interface for easy integration into build processes
- **Environment Integration**: Built-in dotenv support for environment variable management
- **Recursive Discovery**: Automatically discovers all `.edn` files in input directory
- **Pantheon Integration**: Leverages Pantheon's LLM adapter system for AI security evaluation

## 📦 Installation

```bash
# Install as a dependency
pnpm add @promethean-os/shadow-conf

# Install globally for CLI usage
pnpm add -g @promethean-os/shadow-conf
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
import { generateEcosystem } from '@promethean-os/shadow-conf';

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

Generates a PM2 ecosystem configuration from EDN files with traditional security validation.

```typescript
import { generateEcosystem, type GenerateEcosystemOptions } from '@promethean-os/shadow-conf';

const options: GenerateEcosystemOptions = {
  inputDir: './config', // Directory containing EDN files
  outputDir: './dist', // Output directory for generated file
  fileName: 'ecosystem.mjs', // Name of generated file
};

const result = await generateEcosystem(options);
```

**Parameters:**

- `options.inputDir` (string, optional): Directory containing EDN files. Defaults to `process.cwd()`
- `options.outputDir` (string, optional): Output directory. Defaults to `process.cwd()`
- `options.fileName` (string, optional): Generated filename. Defaults to `'ecosystem.config.mjs'`

**Returns:** `Promise<GenerateEcosystemResult>`

#### `generateEcosystemSecure(options)`

Generates a PM2 ecosystem configuration with AI-driven security evaluation using Pantheon framework.

```typescript
import {
  generateEcosystemSecure,
  type SecureGenerateEcosystemOptions,
} from '@promethean-os/shadow-conf';

const options: SecureGenerateEcosystemOptions = {
  inputDir: './config',
  outputDir: './dist',
  fileName: 'ecosystem.mjs',
  security: {
    enableAI: true,
    llmEndpoint: 'http://localhost:11434/v1',
    model: 'error/qwen3:4b-instruct-100k',
    blockThreshold: 0.8,
    warnThreshold: 0.5,
    enableUserConfirmation: true,
    fallbackToTraditional: true,
  },
};

const result = await generateEcosystemSecure(options);
```

**Parameters:**

- `options.inputDir` (string, optional): Directory containing EDN files
- `options.outputDir` (string, optional): Output directory for generated file
- `options.fileName` (string, optional): Generated filename
- `options.security` (SecurityConfig, optional): AI security evaluation configuration

**Security Configuration:**

- `enableAI` (boolean): Enable AI-driven security evaluation. Default: `true`
- `llmEndpoint` (string): LLM API endpoint URL
- `model` (string): LLM model to use for evaluation
- `blockThreshold` (number): Confidence threshold for blocking (0-1). Default: `0.8`
- `warnThreshold` (number): Confidence threshold for warnings (0-1). Default: `0.5`
- `enableUserConfirmation` (boolean): Prompt user for warnings. Default: `true`
- `fallbackToTraditional` (boolean): Use traditional validation if AI fails. Default: `true`

**Returns:** `Promise<GenerateEcosystemResult>` with additional security assessment metadata

#### `createAISecurityEvaluator(config)`

Creates an AI security evaluator instance using Pantheon's LLM adapter system.

```typescript
import { createAISecurityEvaluator, createOllamaAdapter } from '@promethean-os/shadow-conf';

const evaluator = createAISecurityEvaluator({
  llmPort: createOllamaAdapter(),
  model: 'error/qwen3:4b-instruct-100k',
  temperature: 0.2,
  blockThreshold: 0.8,
  warnThreshold: 0.5,
  enableUserConfirmation: true,
});

// Evaluate specific inputs
const assessment = await evaluator.evaluateSecurityThreat(
  '../../../etc/passwd',
  'filepath',
  'attempting to access system file',
);

if (assessment.isThreat) {
  console.log(`Threat detected: ${assessment.explanation}`);
}
```

#### `createOllamaAdapter(model)`

Creates a Pantheon-compatible LLM adapter for Ollama (local OpenAI-compatible endpoint).

```typescript
import { createOllamaAdapter } from '@promethean-os/shadow-conf';

const adapter = createOllamaAdapter('error/qwen3:4b-instruct-100k');

// Use with Pantheon LLM interface
const response = await adapter.complete(
  [
    { role: 'system', content: 'You are a security evaluator.' },
    { role: 'user', content: 'Is this path safe: /etc/passwd?' },
  ],
  { temperature: 0.2 },
);
```

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

| Option               | Description                         | Default                   |
| -------------------- | ----------------------------------- | ------------------------- |
| `--input-dir <path>` | Directory containing `.edn` files   | Current working directory |
| `--out <path>`       | Output directory for generated file | Current working directory |
| `--filename <name>`  | Name of generated file              | `ecosystem.config.mjs`    |

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

### AI-Driven Security Evaluation

shadow-conf uses the Pantheon framework for contextual AI security evaluation:

```typescript
import { generateEcosystemSecure } from '@promethean-os/shadow-conf';

// AI-enhanced security evaluation
const result = await generateEcosystemSecure({
  inputDir: './services',
  outputDir: './config',
  fileName: 'ecosystem.config.mjs',
  security: {
    enableAI: true,
    llmEndpoint: 'http://localhost:11434/v1', // Ollama endpoint
    model: 'error/qwen3:4b-instruct-100k',
    blockThreshold: 0.8,
    warnThreshold: 0.5,
    enableUserConfirmation: true,
  },
});
```

**AI Security Features:**

- **Contextual Threat Assessment**: AI understands development vs production contexts
- **Pattern Recognition**: Detects sophisticated attack patterns beyond regex
- **Adaptive Security**: Different security levels for different environments
- **Explainable Decisions**: AI provides reasoning for security decisions
- **Fallback Protection**: Traditional pattern-based validation as backup

### LLM Adapter Configuration

Configure different LLM backends through Pantheon's adapter system:

```typescript
// Ollama (Local OpenAI-compatible)
const ollamaConfig = {
  llmEndpoint: 'http://localhost:11434/v1',
  model: 'error/qwen3:4b-instruct-100k',
  apiKey: 'ollama', // Not used by Ollama but required
};

// OpenAI (Cloud)
const openaiConfig = {
  llmEndpoint: 'https://api.openai.com/v1',
  model: 'gpt-4',
  apiKey: process.env.OPENAI_API_KEY,
};

// Custom OpenAI-compatible endpoint
const customConfig = {
  llmEndpoint: 'https://my-llm-provider.com/v1',
  model: 'my-custom-model',
  apiKey: process.env.CUSTOM_API_KEY,
};
```

### Security Evaluation Context

The AI evaluator considers multiple contexts:

```typescript
interface SecurityContext {
  processingStage: 'discovery' | 'parsing' | 'normalization' | 'generation';
  environment: 'development' | 'production' | 'ci';
  userIntent: 'development' | 'deployment' | 'automation';
  hasUserInteraction: boolean;
}
```

**Context-Aware Rules:**

- **Development**: More permissive, warns on suspicious patterns
- **Production**: Strict validation, blocks on medium confidence
- **CI/CD**: Automated decisions, no user interaction
- **Interactive**: Allows user confirmation for borderline cases

### Path Resolution with Security

The package normalizes relative paths with AI security validation:

- **Relative paths** (`./`, `../`) are resolved and validated against security policies
- **Absolute paths** are preserved and checked for system directory access
- **Array paths** in `watch` and `env` are processed individually with security checks
- **AI Evaluation**: Each path is evaluated for traversal attempts and injection risks

```clojure
{:apps [{:name "app"
         :script "./dist/index.js"     ; Validated and normalized
         :cwd "./apps/app"             ; Checked for directory traversal
         :watch ["./src" "../shared"]  ; Each path AI-validated
         :env {:CONFIG "./config/app.edn"}}]} ; Environment variables secured
```

### Environment Variables with Security

Generated files include dotenv integration with security validation:

```javascript
// Generated ecosystem.config.mjs
import dotenv from 'dotenv';

try {
  dotenv.config();
} catch (error) {
  if (error?.code !== 'ERR_MODULE_NOT_FOUND') {
    throw error;
  }
}

// AI-validated and sanitized configurations
export const apps = [
  // Your app configurations with security-enhanced paths
];
```

### Multiple EDN Files with AI Security

The package recursively discovers and validates all `.edn` files:

```
services/
├── api/
│   └── ecosystem.edn    ; AI-validated for API-specific threats
├── worker/
│   └── ecosystem.edn    ; Validated for worker process security
├── web/
│   └── ecosystem.edn    ; Web-specific security evaluation
└── shared/
    └── ecosystem.edn    ; Shared configuration validation
```

**AI Security Pipeline:**

1. **File Discovery**: Each `.edn` file path is AI-validated
2. **Content Analysis**: EDN content evaluated for injection risks
3. **Contextual Assessment**: Security decisions based on file purpose
4. **Aggregation**: Merged with security-aware conflict resolution
5. **Generation**: Output with security-enhanced path normalization

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
import { loadEdnFile } from '@promethean-os/shadow-conf';

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
├── ecosystem.ts           # Core generation logic
├── ecosystem-secure.ts    # Security-enhanced generation with AI evaluation
├── edn.ts                # EDN parsing and normalization
├── security-utils.ts     # Traditional security validation utilities
├── ai-security-evaluator.ts # AI-driven security evaluation using Pantheon
├── index.ts              # Public API exports
├── bin/
│   └── shadow-conf.ts    # CLI implementation
└── tests/
    ├── ecosystem.test.ts  # Core functionality tests
    └── security-final.test.ts # Security evaluation tests
```

### Design Principles

1. **Declarative Configuration**: Use EDN for human-readable configuration
2. **AI-Enhanced Security**: Contextual AI evaluation using Pantheon framework
3. **Type Safety**: Full TypeScript support with comprehensive types
4. **Path Awareness**: Intelligent path resolution with security validation
5. **Extensibility**: Support for custom automation and actions
6. **Dual Security**: Traditional pattern-based + AI contextual evaluation
7. **Error Handling**: Clear error messages with security assessment context

### Security Architecture

```
EDN Files → AI Security Evaluation → Traditional Validation → Parser → Normalizer → Generator → PM2 Ecosystem
```

1. **Discovery**: Recursively find all `.edn` files
2. **AI Security Evaluation**: Contextual threat assessment using Pantheon LLM adapters
3. **Traditional Validation**: Pattern-based security checks as fallback
4. **Parsing**: Convert EDN to JavaScript objects
5. **Normalization**: Strip EDN keywords, normalize paths with security awareness
6. **Aggregation**: Merge all configurations
7. **Generation**: Create PM2-compatible JavaScript module

### Pantheon Integration

shadow-conf leverages the Pantheon framework for AI-driven security evaluation:

- **LlmPort Interface**: Uses Pantheon's standardized LLM adapter system
- **OpenAI-Compatible Support**: Works with Ollama and other OpenAI-compatible endpoints
- **Production-Ready Adapters**: Benefits from Pantheon's retry logic and error handling
- **Contextual Evaluation**: AI understands development vs production contexts

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

- [@promethean-os/pantheon](https://github.com/promethean/pantheon) - Agent management framework with LLM adapters
- [@promethean-os/pantheon-llm-openai](https://github.com/promethean/pantheon-llm-openai) - OpenAI LLM adapter for Pantheon
- [@promethean-os/pm2-helpers](https://github.com/promethean/pm2-helpers) - PM2 utility functions
- [jsedn](https://github.com/edn-format/jsedn) - EDN parser for JavaScript

## 🤖 Pantheon Integration Details

### Why Pantheon Framework?

shadow-conf's AI-driven security evaluation leverages Pantheon framework for several key reasons:

#### 1. **Production-Ready LLM Adapters**

- **Robust Error Handling**: Built-in retry logic with exponential backoff
- **Input Validation**: Comprehensive Zod schema validation for all inputs
- **Timeout Protection**: Prevents hanging operations with configurable timeouts
- **Rate Limiting**: Built-in rate limiting to prevent API abuse

#### 2. **OpenAI-Compatible Ecosystem**

- **Multiple Providers**: Works with OpenAI, Ollama, and other OpenAI-compatible endpoints
- **Consistent Interface**: Same `LlmPort` interface across all providers
- **Easy Switching**: Change LLM providers without changing application code

#### 3. **Security-First Design**

- **Input Sanitization**: All inputs validated before processing
- **Error Boundaries**: Comprehensive error handling prevents information leakage
- **Audit Logging**: Built-in logging for security events
- **Resource Limits**: Configurable limits prevent resource exhaustion

### Integration Architecture

```
shadow-conf → Pantheon LlmPort → LLM Provider (Ollama/OpenAI/Custom)
     ↓               ↓                        ↓
AI Security    Standardized    OpenAI-Compatible
Evaluation    Interface       API Communication
     ↓               ↓                        ↓
Contextual    Retry Logic     Local/Cloud LLM
Threat        Error Handling  Model Execution
Assessment    Input Validation
```

### Benefits Over Direct API Integration

| Feature                | Direct Integration    | Pantheon Integration         |
| ---------------------- | --------------------- | ---------------------------- |
| **Error Handling**     | Manual implementation | Built-in retry & backoff     |
| **Input Validation**   | Custom code required  | Zod schemas included         |
| **Provider Switching** | Code changes required | Configuration only           |
| **Security**           | Manual implementation | Built-in protections         |
| **Monitoring**         | Custom logging needed | Built-in audit trails        |
| **Testing**            | Mock required         | In-memory adapters available |

### Advanced Usage Examples

#### Custom LLM Provider

```typescript
import { makeOpenAIAdapter } from '@promethean-os/pantheon-llm-openai';
import { createAISecurityEvaluator } from '@promethean-os/shadow-conf';

// Custom OpenAI-compatible provider
const customAdapter = makeOpenAIAdapter({
  apiKey: process.env.CUSTOM_API_KEY,
  baseURL: 'https://my-llm-provider.com/v1',
  defaultModel: 'my-security-model',
  timeout: 60000,
  retryConfig: {
    maxRetries: 5,
    baseDelay: 2000,
    maxDelay: 30000,
  },
});

const evaluator = createAISecurityEvaluator({
  llmPort: customAdapter,
  model: 'my-security-model',
  blockThreshold: 0.9, // Higher threshold for production
  warnThreshold: 0.6,
  enableUserConfirmation: false, // Automated environment
});
```

#### Multi-Provider Security Evaluation

```typescript
import { createAISecurityEvaluator, createOllamaAdapter } from '@promethean-os/shadow-conf';
import { makeOpenAIAdapter } from '@promethean-os/pantheon-llm-openai';

// Primary: Local Ollama for speed
const primaryAdapter = createOllamaAdapter('error/qwen3:4b-instruct-100k');

// Fallback: Cloud OpenAI for reliability
const fallbackAdapter = makeOpenAIAdapter({
  apiKey: process.env.OPENAI_API_KEY,
  defaultModel: 'gpt-4',
});

const evaluator = createAISecurityEvaluator({
  llmPort: {
    complete: async (messages, opts) => {
      try {
        // Try local Ollama first
        return await primaryAdapter.complete(messages, opts);
      } catch (error) {
        console.warn('Local Ollama failed, falling back to OpenAI:', error);
        return await fallbackAdapter.complete(messages, opts);
      }
    },
  },
  model: 'error/qwen3:4b-instruct-100k',
  blockThreshold: 0.8,
  warnThreshold: 0.5,
});
```

## 📞 Support

- Create an issue on [GitHub](https://github.com/promethean/shadow-conf/issues)
- Check the [documentation](https://github.com/promethean/shadow-conf/wiki)
- Join our [Discord community](https://discord.gg/promethean)
