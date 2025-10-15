# API Documentation

This document provides comprehensive API documentation for @promethean/shadow-conf, including all public functions, types, and usage examples.

## 📖 Table of Contents

- [Core API](#core-api)
- [Type Definitions](#type-definitions)
- [CLI API](#cli-api)
- [Error Handling](#error-handling)
- [Examples](#examples)

## 🚀 Core API

### `generateEcosystem(options)`

The main function for generating PM2 ecosystem configurations from EDN files.

#### Signature

```typescript
function generateEcosystem(
  options?: GenerateEcosystemOptions
): Promise<GenerateEcosystemResult>
```

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `options` | `GenerateEcosystemOptions` | No | `{}` | Configuration options |

#### Options Type

```typescript
interface GenerateEcosystemOptions {
  readonly inputDir?: string;    // Directory containing .edn files
  readonly outputDir?: string;   // Output directory for generated file
  readonly fileName?: string;    // Name of generated file
}
```

#### Returns

```typescript
interface GenerateEcosystemResult {
  readonly apps: readonly AppRecord[];           // Extracted applications
  readonly triggers: readonly AutomationRecord[]; // Event triggers
  readonly schedules: readonly AutomationRecord[]; // Scheduled tasks
  readonly actions: readonly AutomationRecord[];   // Action definitions
  readonly files: readonly string[];             // Processed EDN files
  readonly outputPath: string;                   // Generated file path
}
```

#### Examples

```typescript
// Basic usage
import { generateEcosystem } from '@promethean/shadow-conf';

const result = await generateEcosystem();
console.log(`Generated ${result.outputPath} with ${result.apps.length} apps`);

// Custom configuration
const result = await generateEcosystem({
  inputDir: './services',
  outputDir: './config',
  fileName: 'production.ecosystem.mjs'
});

// Access generated data
const { apps, triggers, schedules, actions } = result;
console.log('Apps:', apps);
console.log('Triggers:', triggers);
```

#### Throws

- `Error` - When input directory doesn't exist
- `Error` - When EDN files contain invalid syntax
- `Error` - When required sections are missing from EDN documents
- `Error` - When file system operations fail

---

### `loadEdnFile(filePath)`

Low-level function for loading and parsing individual EDN files.

#### Signature

```typescript
function loadEdnFile(filePath: string): Promise<unknown>
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `filePath` | `string` | Yes | Absolute path to the EDN file |

#### Returns

`Promise<unknown>` - Parsed and normalized JavaScript object

#### Examples

```typescript
import { loadEdnFile } from '@promethean/shadow-conf';

try {
  const config = await loadEdnFile('./ecosystem.edn');
  console.log('Loaded config:', config);
} catch (error) {
  console.error('Failed to load EDN:', error.message);
}
```

#### Throws

- `Error` - When file cannot be read
- `Error` - When EDN syntax is invalid

---

## 📋 Type Definitions

### `AppRecord`

Represents a PM2 application configuration.

```typescript
interface AppRecord extends Readonly<Record<string, unknown>> {
  readonly name: string;                    // Application name (required)
  readonly script?: string;                  // Script file path
  readonly cwd?: string;                     // Working directory
  readonly instances?: number | string;      // Number of instances
  readonly exec_mode?: 'fork' | 'cluster';   // Execution mode
  readonly env?: Record<string, unknown>;    // Environment variables
  readonly env_file?: string;                // Environment file path
  readonly watch?: string | readonly string[]; // Files/directories to watch
  readonly max_memory_restart?: string;      // Max memory before restart
  readonly min_uptime?: string;              // Minimum uptime
  readonly max_restarts?: number;            // Maximum restarts
  readonly error_file?: string;              // Error log file
  readonly out_file?: string;                // Output log file
  readonly log_file?: string;                // Combined log file
  readonly time?: boolean;                   // Add timestamp to logs
  readonly autorestart?: boolean;            // Auto-restart on failure
  readonly node_args?: string;               // Node.js arguments
  readonly merge_logs?: boolean;             // Merge logs from instances
  readonly kill_timeout?: number;            // Kill timeout (ms)
  readonly wait_ready?: boolean;             // Wait for ready message
  readonly listen_timeout?: number;          // Listen timeout (ms)
  readonly cron_restart?: string;            // Cron pattern for restart
  readonly vizion?: boolean;                 // Enable vizion
  readonly pmx?: boolean;                    // Enable PMX monitoring
  readonly source_map_support?: boolean;     // Enable source map support
  readonly disable_trace?: boolean;          // Disable trace
  // ... other PM2 options
}
```

#### Examples

```typescript
// Basic app configuration
const basicApp: AppRecord = {
  name: 'web-app',
  script: './dist/index.js',
  instances: 4
};

// Advanced app configuration
const advancedApp: AppRecord = {
  name: 'api-service',
  script: './dist/server.js',
  cwd: './services/api',
  instances: 'max',
  exec_mode: 'cluster',
  env: {
    NODE_ENV: 'production',
    PORT: 3000,
    DATABASE_URL: 'postgresql://localhost/mydb'
  },
  env_file: './.env.production',
  watch: ['./src', './config'],
  max_memory_restart: '1G',
  min_uptime: '10s',
  max_restarts: 5,
  error_file: './logs/error.log',
  out_file: './logs/out.log',
  time: true,
  autorestart: true
};
```

---

### `AutomationRecord`

Represents automation configurations (triggers, schedules, actions).

```typescript
interface AutomationRecord extends Readonly<Record<string, unknown>> {
  readonly name: string;                     // Automation name (required)
  readonly type?: string;                    // Automation type
  readonly event?: string;                   // Event name (for triggers)
  readonly cron?: string;                    // Cron pattern (for schedules)
  readonly actions?: readonly string[];      // Action names to execute
  readonly url?: string;                     // URL (for webhook actions)
  readonly method?: string;                  // HTTP method
  readonly headers?: Record<string, string>; // HTTP headers
  readonly body?: unknown;                   // Request body
  readonly message?: string;                 // Message (for notification actions)
  readonly command?: string;                 // Command (for command actions)
  readonly timeout?: number;                 // Timeout in milliseconds
  readonly retries?: number;                 // Number of retries
  readonly enabled?: boolean;                // Whether automation is enabled
}
```

#### Examples

```typescript
// Trigger example
const trigger: AutomationRecord = {
  name: 'app-ready',
  event: 'app/ready',
  actions: ['notify-team', 'run-health-check']
};

// Schedule example
const schedule: AutomationRecord = {
  name: 'daily-backup',
  cron: '0 2 * * *',  // Daily at 2 AM
  actions: ['backup-database']
};

// Action examples
const webhookAction: AutomationRecord = {
  name: 'notify-slack',
  type: 'webhook',
  url: 'https://hooks.slack.com/services/...',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: { text: 'Service deployed successfully' }
};

const commandAction: AutomationRecord = {
  name: 'restart-service',
  type: 'command',
  command: 'pm2 restart web-app',
  timeout: 30000,
  retries: 3
};
```

---

### `GenerateEcosystemOptions`

Options for the `generateEcosystem` function.

```typescript
interface GenerateEcosystemOptions {
  readonly inputDir?: string;    // Directory containing .edn files
  readonly outputDir?: string;   // Output directory for generated file
  readonly fileName?: string;    // Name of generated file
}
```

#### Examples

```typescript
// Default options
const defaultOptions: GenerateEcosystemOptions = {};

// Custom options
const customOptions: GenerateEcosystemOptions = {
  inputDir: './services',
  outputDir: './config',
  fileName: 'production.ecosystem.mjs'
};
```

---

### `GenerateEcosystemResult`

Result from the `generateEcosystem` function.

```typescript
interface GenerateEcosystemResult {
  readonly apps: readonly AppRecord[];           // Extracted applications
  readonly triggers: readonly AutomationRecord[]; // Event triggers
  readonly schedules: readonly AutomationRecord[]; // Scheduled tasks
  readonly actions: readonly AutomationRecord[];   // Action definitions
  readonly files: readonly string[];             // Processed EDN files
  readonly outputPath: string;                   // Generated file path
}
```

#### Examples

```typescript
// Using the result
const result: GenerateEcosystemResult = await generateEcosystem();

console.log(`Generated ${result.apps.length} applications`);
console.log(`Found ${result.triggers.length} triggers`);
console.log(`Created ${result.schedules.length} schedules`);
console.log(`Defined ${result.actions.length} actions`);
console.log(`Processed ${result.files.length} EDN files`);
console.log(`Output written to: ${result.outputPath}`);

// Access specific data
const apiApp = result.apps.find(app => app.name === 'api-service');
const backupSchedule = result.schedules.find(schedule => schedule.name === 'daily-backup');
```

---

## 🖥 CLI API

### Command Line Interface

The package provides a command-line interface for generating ecosystem configurations.

#### Installation

```bash
# Local installation
pnpm add @promethean/shadow-conf

# Global installation
pnpm add -g @promethean/shadow-conf
```

#### Usage

```bash
shadow-conf <command> [options]
```

#### Commands

##### `ecosystem`

Generate a PM2 ecosystem file from EDN sources.

```bash
shadow-conf ecosystem [options]
```

##### Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--input-dir <path>` | - | Directory containing `.edn` files | Current working directory |
| `--out <path>` | - | Output directory for generated file | Current working directory |
| `--filename <name>` | - | Name of generated file | `ecosystem.config.mjs` |
| `--help` | -h | Show help message | - |

#### Examples

```bash
# Basic usage
shadow-conf ecosystem

# Custom directories and filename
shadow-conf ecosystem \
  --input-dir ./services \
  --out ./config \
  --filename production.ecosystem.mjs

# Using equals notation
shadow-conf ecosystem --input-dir=./config --filename=ecosystem.mjs

# Show help
shadow-conf ecosystem --help
```

#### Exit Codes

- `0` - Success
- `1` - Error (invalid arguments, file not found, etc.)

---

## ⚠ Error Handling

### Error Types

The package throws specific errors for different failure scenarios:

#### File System Errors

```typescript
// File not found
throw new Error(`EDN file not found: ${filePath}`);

// Directory not found
throw new Error(`Input directory does not exist: ${inputDir}`);

// Permission denied
throw new Error(`Permission denied: ${filePath}`);
```

#### EDN Parsing Errors

```typescript
// Invalid EDN syntax
throw new Error(`Invalid EDN syntax in ${filePath}: ${errorMessage}`);

// Missing required sections
throw new Error(`EDN document ${source} is missing an :apps vector.`);

// Invalid data types
throw new Error(`App at index ${index} in ${source} is not a map.`);
```

#### Validation Errors

```typescript
// Invalid automation configuration
throw new Error(`:${section} in ${source} must be a vector.`);

// Invalid app configuration
throw new Error(`Entry at index ${index} in :${section} of ${source} is not a map.`);
```

### Error Handling Patterns

#### Try-Catch Pattern

```typescript
import { generateEcosystem } from '@promethean/shadow-conf';

try {
  const result = await generateEcosystem({
    inputDir: './services',
    outputDir: './config'
  });
  console.log('Success:', result.outputPath);
} catch (error) {
  if (error instanceof Error) {
    console.error('Generation failed:', error.message);
    
    // Handle specific error types
    if (error.message.includes('not found')) {
      console.error('Check that the input directory exists');
    } else if (error.message.includes('Invalid EDN')) {
      console.error('Check EDN file syntax');
    }
  }
}
```

#### Validation Pattern

```typescript
import { loadEdnFile } from '@promethean/shadow-conf';

async function validateEdnFile(filePath: string): Promise<boolean> {
  try {
    const content = await loadEdnFile(filePath);
    
    // Basic validation
    if (!content || typeof content !== 'object') {
      throw new Error('EDN must evaluate to an object');
    }
    
    const doc = content as Record<string, unknown>;
    if (!Array.isArray(doc.apps)) {
      throw new Error('EDN must contain an :apps vector');
    }
    
    return true;
  } catch (error) {
    console.error(`Validation failed for ${filePath}:`, error.message);
    return false;
  }
}
```

---

## 💡 Examples

### Complete Workflow Example

```typescript
import { generateEcosystem, type GenerateEcosystemOptions } from '@promethean/shadow-conf';
import path from 'path';

async function generateProductionConfig(): Promise<void> {
  const options: GenerateEcosystemOptions = {
    inputDir: path.resolve('./services'),
    outputDir: path.resolve('./config'),
    fileName: 'production.ecosystem.mjs'
  };

  try {
    console.log('Generating PM2 ecosystem configuration...');
    const result = await generateEcosystem(options);
    
    console.log(`✅ Generated ${result.outputPath}`);
    console.log(`📦 Found ${result.apps.length} applications:`);
    
    result.apps.forEach(app => {
      console.log(`  - ${app.name} (${app.instances || 1} instance(s))`);
    });
    
    console.log(`⚡ Found ${result.triggers.length} triggers`);
    console.log(`⏰ Found ${result.schedules.length} schedules`);
    console.log(`🔧 Found ${result.actions.length} actions`);
    console.log(`📄 Processed ${result.files.length} EDN files`);
    
  } catch (error) {
    console.error('❌ Failed to generate configuration:', error);
    process.exit(1);
  }
}

generateProductionConfig();
```

### Custom Validation Example

```typescript
import { loadEdnFile } from '@promethean/shadow-conf';

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

async function validateEcosystemFile(filePath: string): Promise<ValidationResult> {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: []
  };

  try {
    const doc = await loadEdnFile(filePath) as Record<string, unknown>;
    
    // Validate required sections
    if (!doc.apps) {
      result.errors.push('Missing required :apps section');
      result.valid = false;
    } else if (!Array.isArray(doc.apps)) {
      result.errors.push(':apps must be a vector');
      result.valid = false;
    } else {
      // Validate each app
      doc.apps.forEach((app, index) => {
        if (!app || typeof app !== 'object') {
          result.errors.push(`App at index ${index} is not a map`);
          result.valid = false;
          return;
        }
        
        if (!app.name) {
          result.errors.push(`App at index ${index} is missing :name`);
          result.valid = false;
        }
        
        if (!app.script) {
          result.warnings.push(`App "${app.name}" has no :script specified`);
        }
      });
    }
    
    // Validate optional sections
    ['triggers', 'schedules', 'actions'].forEach(section => {
      if (doc[section] && !Array.isArray(doc[section])) {
        result.errors.push(`:${section} must be a vector`);
        result.valid = false;
      }
    });
    
  } catch (error) {
    result.errors.push(`Failed to load EDN file: ${error.message}`);
    result.valid = false;
  }
  
  return result;
}

// Usage
const validation = await validateEcosystemFile('./ecosystem.edn');
if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
}
if (validation.warnings.length > 0) {
  console.warn('Validation warnings:', validation.warnings);
}
```

### Batch Processing Example

```typescript
import { generateEcosystem } from '@promethean/shadow-conf';
import { readdir } from 'fs/promises';
import path from 'path';

async function processMultipleEnvironments(): Promise<void> {
  const environments = ['development', 'staging', 'production'];
  
  for (const env of environments) {
    console.log(`Processing ${env} environment...`);
    
    try {
      const result = await generateEcosystem({
        inputDir: `./config/${env}`,
        outputDir: `./dist/${env}`,
        fileName: `ecosystem.${env}.mjs`
      });
      
      console.log(`✅ ${env}: ${result.apps.length} apps generated`);
      
    } catch (error) {
      console.error(`❌ ${env}: Failed to generate - ${error.message}`);
    }
  }
}

processMultipleEnvironments();
```

### Integration with Build Tools

```typescript
// build-script.ts
import { generateEcosystem } from '@promethean/shadow-conf';
import { execSync } from 'child_process';

async function buildAndDeploy(): Promise<void> {
  try {
    // 1. Build the application
    console.log('Building application...');
    execSync('pnpm build', { stdio: 'inherit' });
    
    // 2. Generate PM2 configuration
    console.log('Generating PM2 configuration...');
    const result = await generateEcosystem({
      inputDir: './config',
      outputDir: './dist',
      fileName: 'ecosystem.config.mjs'
    });
    
    // 3. Deploy with PM2
    console.log('Deploying with PM2...');
    execSync(`pm2 start ${result.outputPath}`, { stdio: 'inherit' });
    
    console.log('🚀 Deployment successful!');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

buildAndDeploy();
```

This comprehensive API documentation provides all the information needed to effectively use @promethean/shadow-conf in various scenarios.