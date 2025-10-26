# MCP Configuration Loader Documentation

## 📋 Module Overview

The `load-config.ts` module serves as the central configuration management system for the Promethean MCP (Model Context Protocol) framework. It provides a robust, secure, and flexible mechanism for loading, validating, and managing configuration across multiple sources while ensuring type safety and security best practices.

### Core Responsibilities

- **Configuration Discovery**: Automatically finds configuration files through multiple strategies
- **Schema Validation**: Enforces type safety using Zod schemas for all configuration objects
- **Multi-Source Resolution**: Merges configuration from files, environment variables, and defaults
- **Security Enforcement**: Prevents directory traversal attacks and ensures secure path resolution
- **Configuration Persistence**: Provides utilities for saving and normalizing configuration files

### Role in MCP System

This module is the foundation for all MCP server operations, providing the configuration that determines:

- Which tools are available and how they're organized
- Transport layer settings (HTTP vs stdio)
- Endpoint routing and tool assignments
- Proxy configurations for external MCP servers
- Security and access control settings

---

## 📚 API Documentation

### Types and Interfaces

#### `AppConfig`

```typescript
export type AppConfig = z.infer<typeof ConfigSchema>;
```

The main configuration interface representing the complete MCP server configuration.

**Properties:**

- `transport`: `'stdio' | 'http'` - Communication transport (default: `'http'`)
- `tools`: `string[]` - Array of tool identifiers available at the default endpoint
- `includeHelp`: `boolean` - Whether to include help documentation (default: `true`)
- `stdioMeta`: `ToolsetMeta` - Metadata for the default stdio endpoint
- `endpoints`: `Record<string, EndpointConfig>` - Named endpoint configurations
- `stdioProxyConfig`: `string | null` - Path to EDN proxy configuration file
- `stdioProxies`: `InlineProxyConfig[]` - Inline proxy configurations
- `version`: `string` - Configuration version identifier
- `metadata`: `Record<string, unknown>` - Additional metadata

#### `EndpointConfig`

```typescript
interface EndpointConfig {
  tools: string[];
  includeHelp?: boolean;
  meta?: ToolsetMeta;
}
```

Configuration for individual HTTP endpoints.

#### `ToolsetMeta`

```typescript
interface ToolsetMeta {
  title?: string;
  description?: string;
  workflow?: string[];
  expectations?: {
    usage?: string[];
    pitfalls?: string[];
    prerequisites?: string[];
  };
}
```

Descriptive metadata for toolsets and endpoints.

#### `InlineProxyConfig`

```typescript
interface InlineProxyConfig {
  name: string;
  command: string;
  args: string[];
  env: Record<string, string>;
  cwd?: string;
  httpPath: string;
}
```

Configuration for inline stdio proxies.

#### `ConfigSource`

```typescript
type ConfigSource = { type: 'file'; path: string } | { type: 'env' } | { type: 'default' };
```

Identifies the source of loaded configuration.

#### `LoadedConfig`

```typescript
interface LoadedConfig {
  config: AppConfig;
  source: ConfigSource;
}
```

Combines configuration with its source information.

### Core Functions

#### `loadConfig(env, argv?, cwd?)`

```typescript
export const loadConfig = (
  env: NodeJS.ProcessEnv,
  argv: string[] = process.argv,
  cwd: string = process.cwd(),
): AppConfig
```

Loads configuration with automatic source resolution.

**Parameters:**

- `env`: NodeJS process environment variables
- `argv`: Command line arguments array (default: `process.argv`)
- `cwd`: Current working directory (default: `process.cwd()`)

**Returns:** Normalized `AppConfig` object

**Resolution Order:**

1. `--config` / `-c` CLI flag
2. Nearest `promethean.mcp.json` file
3. `MCP_CONFIG_JSON` environment variable
4. Default configuration

**Example:**

```typescript
import { loadConfig } from '@promethean/mcp/config/load-config.js';

// Load with default parameters
const config = loadConfig(process.env);

// Load with custom arguments
const config = loadConfig(process.env, ['node', 'app', '--config', './custom.json']);
```

#### `loadConfigWithSource(env, argv?, cwd?)`

```typescript
export const loadConfigWithSource = (
  env: NodeJS.ProcessEnv,
  argv: string[] = process.argv,
  cwd: string = process.cwd(),
): LoadedConfig
```

Loads configuration including source tracking information.

**Returns:** `LoadedConfig` object containing both configuration and source metadata

**Example:**

```typescript
import { loadConfigWithSource } from '@promethean/mcp/config/load-config.js';

const { config, source } = loadConfigWithSource(process.env);

if (source.type === 'file') {
  console.log(`Loaded from: ${source.path}`);
} else if (source.type === 'env') {
  console.log('Loaded from environment variable');
} else {
  console.log('Using default configuration');
}
```

#### `saveConfigFile(filePath, config, baseDir?)`

```typescript
export const saveConfigFile = (
  filePath: string,
  config: AppConfig,
  baseDir?: string,
): AppConfig
```

Saves configuration to file with normalization and directory creation.

**Parameters:**

- `filePath`: Target file path (relative or absolute)
- `config`: Configuration object to save
- `baseDir`: Base directory for relative path resolution (default: `CONFIG_ROOT`)

**Returns:** Normalized configuration that was written

**Example:**

```typescript
import { saveConfigFile, ConfigSchema } from '@promethean/mcp/config/load-config.js';

const config = ConfigSchema.parse({
  transport: 'http',
  tools: ['files_view_file', 'github_request'],
  endpoints: {
    '/api': { tools: ['github_request'] },
  },
});

const saved = saveConfigFile('./config/promethean.mcp.json', config);
```

#### `findConfigPath(cwd?)`

```typescript
export const findConfigPath = (cwd: string = process.cwd()): string | null
```

Finds the nearest configuration file by searching up the directory tree.

**Returns:** Path to configuration file or `null` if not found

**Example:**

```typescript
import { findConfigPath } from '@promethean/mcp/config/load-config.js';

const configPath = findConfigPath('/home/user/project/subdir');
// Returns: '/home/user/project/promethean.mcp.json' if found
```

#### `resolveConfigPath(filePath, baseDir?, options?)`

```typescript
export const resolveConfigPath = (
  filePath: string,
  baseDir: string = CONFIG_ROOT,
  options: ResolveConfigPathOptions = {},
): string
```

Resolves and validates file paths with security constraints.

**Parameters:**

- `filePath`: Path to resolve
- `baseDir`: Base directory for resolution (default: `CONFIG_ROOT`)
- `options`: Resolution options

**Options:**

```typescript
interface ResolveConfigPathOptions {
  allowOutsideBase?: boolean; // Allow paths outside base directory
}
```

**Returns:** Resolved absolute path

**Throws:** `Error` if path traversal is detected and not allowed

**Example:**

```typescript
import { resolveConfigPath } from '@promethean/mcp/config/load-config.js';

// Safe resolution (prevents directory traversal)
const safePath = resolveConfigPath('../config.json', '/base/dir');

// Allow absolute paths outside base
const absolutePath = resolveConfigPath('/etc/config.json', '/base/dir', {
  allowOutsideBase: true,
});
```

#### `createDefaultConfig()`

```typescript
export const createDefaultConfig = (): AppConfig
```

Creates a default configuration with all required fields.

**Returns:** Default `AppConfig` object

**Example:**

```typescript
import { createDefaultConfig } from '@promethean/mcp/config/load-config.js';

const defaultConfig = createDefaultConfig();
// Returns: { transport: 'http', tools: [], endpoints: {}, ... }
```

### Constants

#### `CONFIG_FILE_NAME`

```typescript
export const CONFIG_FILE_NAME = 'promethean.mcp.json';
```

The default configuration filename.

#### `CONFIG_ROOT`

```typescript
export const CONFIG_ROOT = process.cwd();
```

The root directory for configuration resolution.

#### `ConfigSchema`

```typescript
export const ConfigSchema = Config;
```

The Zod schema for configuration validation.

---

## 🔧 Configuration Schema

### Root Configuration Structure

```json
{
  "transport": "http",
  "tools": ["files_view_file", "github_request"],
  "includeHelp": true,
  "stdioMeta": {
    "title": "Default MCP Endpoint",
    "description": "Primary MCP server endpoint",
    "workflow": ["mcp_toolset", "mcp_validate_config"],
    "expectations": {
      "usage": ["Call mcp_toolset before editing"],
      "pitfalls": ["Avoid binary writes"],
      "prerequisites": ["Valid authentication"]
    }
  },
  "endpoints": {
    "/github": {
      "tools": ["github_request", "github_graphql"],
      "includeHelp": true,
      "meta": {
        "title": "GitHub Tools",
        "description": "GitHub API integration tools"
      }
    },
    "/files": {
      "tools": ["files_list_directory", "files_view_file"],
      "meta": {
        "expectations": {
          "pitfalls": ["Be careful with file operations"]
        }
      }
    }
  },
  "stdioProxyConfig": "./config/mcp_servers.edn",
  "stdioProxies": [
    {
      "name": "github-proxy",
      "command": "./bin/github.sh",
      "args": ["--stdio"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      },
      "cwd": "/workspace",
      "httpPath": "/github-proxy/mcp"
    }
  ],
  "version": "2025-06-18",
  "metadata": {
    "environment": "development",
    "source": "generated"
  }
}
```

### Schema Validation Rules

#### Transport

- **Type**: `enum('stdio', 'http')`
- **Default**: `'http'`
- **Required**: No
- **Validation**: Must be one of the supported transport types

#### Tools

- **Type**: `array(string)`
- **Default**: `[]`
- **Required**: No
- **Validation**: Each string must be a valid tool identifier

#### IncludeHelp

- **Type**: `boolean`
- **Default**: `true`
- **Required**: No
- **Validation**: Boolean value

#### Endpoints

- **Type**: `Record<string, EndpointConfig>`
- **Default**: `{}`
- **Required**: No
- **Validation**: Each endpoint must have valid configuration

#### StdioProxyConfig

- **Type**: `string | null`
- **Default**: `null`
- **Required**: No
- **Validation**: If provided, must be a non-empty string

#### StdioProxies

- **Type**: `array(InlineProxyConfig)`
- **Default**: `[]`
- **Required**: No
- **Validation**: Each proxy must have required fields

#### Version

- **Type**: `string`
- **Required**: No
- **Validation**: Optional version identifier

#### Metadata

- **Type**: `Record<string, unknown>`
- **Required**: No
- **Validation**: Free-form metadata object

### Endpoint Configuration Schema

```typescript
interface EndpointConfig {
  tools: string[]; // Required: Array of tool identifiers
  includeHelp?: boolean; // Optional: Include help documentation
  meta?: ToolsetMeta; // Optional: Endpoint metadata
}
```

### Toolset Metadata Schema

```typescript
interface ToolsetMeta {
  title?: string; // Optional: Human-readable title
  description?: string; // Optional: Detailed description
  workflow?: string[]; // Optional: Workflow identifiers
  expectations?: {
    // Optional: Usage expectations
    usage?: string[]; // Optional: Usage guidelines
    pitfalls?: string[]; // Optional: Common pitfalls
    prerequisites?: string[]; // Optional: Prerequisites
  };
}
```

### Inline Proxy Schema

```typescript
interface InlineProxyConfig {
  name: string; // Required: Proxy name identifier
  command: string; // Required: Command to execute
  args: string[]; // Required: Command arguments
  env: Record<string, string>; // Required: Environment variables
  cwd?: string; // Optional: Working directory
  httpPath: string; // Required: HTTP path for proxy
}
```

---

## 💡 Usage Examples

### Basic Configuration Loading

```typescript
import { loadConfig } from '@promethean/mcp/config/load-config.js';

// Load configuration with automatic resolution
const config = loadConfig(process.env);

console.log(`Transport: ${config.transport}`);
console.log(`Available tools: ${config.tools.join(', ')}`);
console.log(`Endpoints: ${Object.keys(config.endpoints).join(', ')}`);
```

### Configuration with Source Tracking

```typescript
import { loadConfigWithSource } from '@promethean/mcp/config/load-config.js';

const { config, source } = loadConfigWithSource(process.env);

switch (source.type) {
  case 'file':
    console.log(`Configuration loaded from: ${source.path}`);
    break;
  case 'env':
    console.log('Configuration loaded from MCP_CONFIG_JSON environment variable');
    break;
  case 'default':
    console.log('Using default configuration');
    break;
}
```

### Creating and Saving Configuration

```typescript
import {
  saveConfigFile,
  createDefaultConfig,
  ConfigSchema,
} from '@promethean/mcp/config/load-config.js';

// Create a custom configuration
const customConfig = ConfigSchema.parse({
  transport: 'http',
  tools: ['files_view_file', 'github_request', 'discord_send_message'],
  endpoints: {
    '/api': {
      tools: ['github_request', 'github_graphql'],
      meta: {
        title: 'GitHub API',
        description: 'GitHub integration tools',
      },
    },
    '/discord': {
      tools: ['discord_send_message', 'discord_list_messages'],
      includeHelp: false,
    },
  },
  stdioMeta: {
    title: 'MCP Server',
    workflow: ['mcp_toolset', 'mcp_validate_config'],
  },
  version: '2025-06-18',
  metadata: {
    environment: 'production',
    managed: true,
  },
});

// Save configuration to file
const savedConfig = saveConfigFile('./config/promethean.mcp.json', customConfig);
console.log('Configuration saved successfully');
```

### Configuration Discovery

```typescript
import { findConfigPath, loadConfig } from '@promethean/mcp/config/load-config.js';

// Find configuration file automatically
const configPath = findConfigPath('/home/user/project/subdir');

if (configPath) {
  console.log(`Found configuration at: ${configPath}`);

  // Load from specific path
  const config = loadConfig(process.env, ['node', 'app', '--config', configPath]);
  // ... use configuration
} else {
  console.log('No configuration file found, using defaults');
  const config = loadConfig(process.env);
  // ... use default configuration
}
```

### Secure Path Resolution

```typescript
import { resolveConfigPath, saveConfigFile } from '@promethean/mcp/config/load-config.js';

// Resolve paths safely (prevents directory traversal)
try {
  const safePath = resolveConfigPath('../config.json', '/base/dir');
  console.log(`Safe path resolved: ${safePath}`);

  // This would throw an error for malicious paths
  const maliciousPath = resolveConfigPath('../../../etc/passwd', '/base/dir');
} catch (error) {
  console.error(`Path resolution failed: ${error.message}`);
}

// Allow absolute paths when needed
const absolutePath = resolveConfigPath('/etc/custom-config.json', '/base/dir', {
  allowOutsideBase: true,
});
```

### Working with Multiple Environments

```typescript
import { loadConfigWithSource } from '@promethean/mcp/config/load-config.js';

// Development environment
process.env.NODE_ENV = 'development';
const devConfig = loadConfigWithSource(process.env);

// Production environment with explicit config
process.env.NODE_ENV = 'production';
const prodConfig = loadConfigWithSource(process.env, [
  'node',
  'app',
  '--config',
  '/etc/promethean/prod.mcp.json',
]);

// Compare configurations
console.log(`Dev transport: ${devConfig.config.transport}`);
console.log(`Prod transport: ${prodConfig.config.transport}`);
```

### Configuration Validation

```typescript
import { ConfigSchema, normalizeConfig } from '@promethean/mcp/config/load-config.js';

// Validate raw configuration
const rawConfig = {
  transport: 'http',
  tools: ['files_view_file', 'invalid-tool'], // Some tools might be invalid
  endpoints: {
    '/api': {
      tools: ['github_request'],
    },
  },
};

try {
  const validatedConfig = ConfigSchema.parse(rawConfig);
  console.log('Configuration is valid');
} catch (error) {
  console.error('Configuration validation failed:', error.message);
}

// Normalize configuration (applies defaults)
const normalized = normalizeConfig(rawConfig);
console.log('Normalized config:', normalized);
```

---

## 🔒 Security Considerations

### Path Traversal Protection

The module implements robust protection against directory traversal attacks:

```typescript
// Malicious path attempts
resolveConfigPath('../../../etc/passwd', '/base/dir');
// Throws: "Refusing to access path outside of /base/dir: /etc/passwd"

// Safe relative paths
resolveConfigPath('config/app.json', '/base/dir');
// Returns: "/base/dir/config/app.json"
```

**Security Features:**

- **Real Path Resolution**: Uses `fs.realpathSync()` to resolve symlinks
- **Relative Path Validation**: Ensures resolved paths stay within base directory
- **Explicit Override**: Requires `allowOutsideBase` flag for absolute paths
- **Normalization**: Applies `path.normalize()` to eliminate `.` and `..` sequences

### Configuration Source Validation

The module validates configuration sources to prevent injection attacks:

```typescript
// Environment variable validation
process.env.MCP_CONFIG_JSON = '{"transport":"http","tools":["eval(malicious)"]}';

try {
  const config = loadConfigWithSource(process.env);
} catch (error) {
  console.error('Invalid environment configuration:', error.message);
}
```

### File System Security

**Safe File Operations:**

- **Synchronous Reading**: Uses `fs.readFileSync` to prevent race conditions
- **JSON Parsing**: Validates JSON structure before processing
- **Directory Creation**: Ensures parent directories exist before writing
- **Path Sanitization**: Normalizes all file paths before operations

### Environment Variable Handling

**Secure Environment Processing:**

```typescript
// Only processes specific, expected environment variables
const allowedEnvVars = ['MCP_CONFIG_JSON', 'NODE_ENV', 'GITHUB_TOKEN'];

// Validates JSON structure from environment
if (env.MCP_CONFIG_JSON) {
  try {
    const parsed = JSON.parse(env.MCP_CONFIG_JSON);
    // Additional validation applied here
  } catch (error) {
    throw new Error('Invalid MCP_CONFIG_JSON: ' + error.message);
  }
}
```

### Configuration Exposure Prevention

**Sensitive Data Protection:**

- **No Logging**: Configuration values are not logged by default
- **Secure Defaults**: Default configuration minimizes exposed attack surface
- **Validation**: All configuration passes through Zod schema validation
- **Type Safety**: TypeScript prevents type-related security issues

### Best Practices

1. **Use Absolute Paths for Production**:

   ```typescript
   const config = loadConfig(process.env, [
     'node',
     'app',
     '--config',
     '/etc/promethean/config.json',
   ]);
   ```

2. **Restrict File Permissions**:

   ```bash
   chmod 600 /etc/promethean/promethean.mcp.json
   chown promethean:promethean /etc/promethean/promethean.mcp.json
   ```

3. **Validate Configuration Early**:

   ```typescript
   try {
     const config = loadConfig(process.env);
     // Validate critical settings
     if (config.transport === 'http' && !config.endpoints) {
       throw new Error('HTTP transport requires endpoints configuration');
     }
   } catch (error) {
     console.error('Configuration error:', error.message);
     process.exit(1);
   }
   ```

4. **Use Environment Variables for Secrets**:
   ```typescript
   // In configuration file
   {
     "stdioProxies": [
       {
         "name": "github-proxy",
         "command": "./bin/github.sh",
         "env": {
           "GITHUB_TOKEN": "${GITHUB_TOKEN}" // From environment
         }
       }
     ]
   }
   ```

---

## 🔄 Configuration Resolution

### Resolution Precedence

The configuration loader follows a strict precedence order to determine which configuration source to use:

```
1. CLI Flag (--config / -c) → Highest Priority
   ↓
2. Auto-detected File (promethean.mcp.json)
   ↓
3. Environment Variable (MCP_CONFIG_JSON)
   ↓
4. Default Configuration → Lowest Priority
```

### Detailed Resolution Process

#### 1. CLI Flag Resolution

```bash
# Explicit configuration file
node app.js --config /path/to/custom.json
node app.js -c ./relative/config.json

# With equals syntax
node app.js --config=/absolute/path.json
```

**Implementation:**

```typescript
const explicitRaw = getArgValue(argv, '--config', '-c');
const explicit = explicitRaw?.replace(/^['"]|['"]$/g, '');
if (explicit) {
  return fromFile(explicit);
}
```

#### 2. Auto-detection

```bash
# Searches up directory tree
/home/user/project/subdir/app.js
# Looks for:
# /home/user/project/subdir/promethean.mcp.json → Not found
# /home/user/project/promethean.mcp.json → Found!
```

**Implementation:**

```typescript
const findUpSync = (start: string, fileName: string): string | null => {
  let dir = path.resolve(start);
  const root = path.parse(dir).root;

  for (let i = 0; i < 100; i++) {
    const candidate = path.join(dir, fileName);
    try {
      const st = fs.statSync(candidate);
      if (st.isFile()) return candidate;
    } catch {
      /* ignore */
    }
    if (dir === root) break;
    dir = path.dirname(dir);
  }
  return null;
};
```

#### 3. Environment Variable

```bash
# Set configuration via environment
export MCP_CONFIG_JSON='{"transport":"http","tools":["files_view_file"]}'
node app.js
```

**Implementation:**

```typescript
if (env.MCP_CONFIG_JSON) {
  try {
    const raw = JSON.parse(env.MCP_CONFIG_JSON);
    return {
      config: normalizeConfig(raw),
      source: { type: 'env' },
    };
  } catch (e) {
    throw new Error('Invalid MCP_CONFIG_JSON: ' + (e as Error).message);
  }
}
```

#### 4. Default Configuration

```typescript
// When no other sources are found
return {
  config: createDefaultConfig(),
  source: { type: 'default' },
};
```

### Configuration Merging

The module does **not** merge configurations from multiple sources. Instead, it uses a **winner-takes-all** approach based on precedence:

```typescript
// WRONG: No merging occurs
// CLI flag → File → Environment → Default

// CORRECT: First valid source wins
if (cliFlag) return cliConfig;
else if (autoFile) return autoFileConfig;
else if (envVar) return envConfig;
else return defaultConfig;
```

### Source Tracking

The `loadConfigWithSource` function provides detailed source information:

```typescript
interface LoadedConfig {
  config: AppConfig;
  source: ConfigSource;
}

type ConfigSource =
  | { type: 'file'; path: string } // File path included
  | { type: 'env' } // Environment variable
  | { type: 'default' }; // Default configuration
```

**Usage Example:**

```typescript
const { config, source } = loadConfigWithSource(process.env);

// Log configuration source for debugging
switch (source.type) {
  case 'file':
    console.log(`Loaded from file: ${source.path}`);
    break;
  case 'env':
    console.log('Loaded from MCP_CONFIG_JSON environment variable');
    break;
  case 'default':
    console.log('Using built-in default configuration');
    break;
}

// Include source in application logs
console.log(`Application started with config from: ${source.type}`);
```

### Configuration Normalization

All configurations pass through normalization to ensure consistency:

```typescript
const normalizeConfig = (input: unknown): AppConfig => Config.parse(input ?? {});
```

**Normalization Effects:**

- **Default Values**: Applies schema defaults for missing fields
- **Type Coercion**: Converts values to correct types when possible
- **Validation**: Ensures all required fields are present
- **Structure**: Enforces consistent object structure

**Example:**

```typescript
const input = {
  transport: 'http',
  // Missing tools, endpoints, etc.
};

const normalized = normalizeConfig(input);
// Result:
// {
//   transport: 'http',
//   tools: [],           // Default applied
//   endpoints: {},       // Default applied
//   includeHelp: true,   // Default applied
//   // ... other defaults
// }
```

---

## ⚠️ Error Handling

### Error Types

#### Configuration File Errors

**File Not Found:**

```typescript
try {
  const config = loadConfig(process.env, ['node', 'app', '--config', 'nonexistent.json']);
} catch (error) {
  console.error('Configuration file not found:', error.message);
}
```

**Invalid JSON:**

```typescript
// File contains invalid JSON
// promethean.mcp.json: {"transport": "http", "tools": ["tool1",}

try {
  const config = loadConfig(process.env);
} catch (error) {
  console.error('Invalid JSON in configuration file:', error.message);
  // Output: "Invalid JSON in configuration file: Unexpected end of JSON input"
}
```

#### Schema Validation Errors

**Invalid Transport:**

```typescript
// Configuration: {"transport": "invalid", "tools": []}

try {
  const config = loadConfig(process.env);
} catch (error) {
  console.error('Schema validation failed:', error.message);
  // Output: "Schema validation failed: transport must be 'stdio' or 'http'"
}
```

**Missing Required Fields:**

```typescript
// Configuration: {"endpoints": {}}  // Missing transport

try {
  const config = loadConfig(process.env);
} catch (error) {
  console.error('Schema validation failed:', error.message);
}
```

#### Path Resolution Errors

**Directory Traversal:**

```typescript
try {
  const path = resolveConfigPath('../../../etc/passwd', '/base/dir');
} catch (error) {
  console.error('Path resolution failed:', error.message);
  // Output: "Path resolution failed: Refusing to access path outside of /base/dir: /etc/passwd"
}
```

**Invalid Base Directory:**

```typescript
try {
  const path = resolveConfigPath('config.json', '/nonexistent/base');
} catch (error) {
  console.error('Base directory error:', error.message);
}
```

#### Environment Variable Errors

**Invalid JSON in Environment:**

```typescript
process.env.MCP_CONFIG_JSON = '{"transport": "http", "tools": ["tool1",}';

try {
  const config = loadConfig(process.env);
} catch (error) {
  console.error('Environment configuration error:', error.message);
  // Output: "Environment configuration error: Invalid MCP_CONFIG_JSON: Unexpected end of JSON input"
}
```

### Error Handling Strategies

#### Graceful Degradation

```typescript
import { loadConfigWithSource, createDefaultConfig } from '@promethean/mcp/config/load-config.js';

function loadConfigWithFallback(env: NodeJS.ProcessEnv): AppConfig {
  try {
    const { config, source } = loadConfigWithSource(env);
    console.log(`Configuration loaded from: ${source.type}`);
    return config;
  } catch (error) {
    console.warn('Configuration loading failed, using defaults:', error.message);
    return createDefaultConfig();
  }
}

const config = loadConfigWithFallback(process.env);
```

#### Configuration Validation

```typescript
function validateConfiguration(config: AppConfig): void {
  const errors: string[] = [];

  // Validate transport-specific requirements
  if (config.transport === 'http' && Object.keys(config.endpoints).length === 0) {
    errors.push('HTTP transport requires at least one endpoint');
  }

  // Validate tool configurations
  if (config.tools.length === 0 && Object.keys(config.endpoints).length === 0) {
    errors.push('Configuration must specify tools or endpoints');
  }

  // Validate proxy configurations
  if (config.stdioProxyConfig && !fs.existsSync(config.stdioProxyConfig)) {
    errors.push(`Proxy config file not found: ${config.stdioProxyConfig}`);
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
  }
}

try {
  const config = loadConfig(process.env);
  validateConfiguration(config);
  // Configuration is valid
} catch (error) {
  console.error('Configuration error:', error.message);
  process.exit(1);
}
```

#### Retry Mechanisms

```typescript
import { loadConfigWithSource } from '@promethean/mcp/config/load-config.js';

async function loadConfigWithRetry(
  env: NodeJS.ProcessEnv,
  maxRetries: number = 3,
  delayMs: number = 1000,
): Promise<AppConfig> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const { config } = loadConfigWithSource(env);
      return config;
    } catch (error) {
      if (attempt === maxRetries) {
        throw new Error(
          `Failed to load configuration after ${maxRetries} attempts: ${error.message}`,
        );
      }

      console.warn(`Configuration load attempt ${attempt} failed, retrying in ${delayMs}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw new Error('Unexpected error in retry logic');
}
```

#### Logging and Monitoring

```typescript
import { loadConfigWithSource } from '@promethean/mcp/config/load-config.js';

interface ConfigLoadMetrics {
  source: string;
  loadTime: number;
  validationTime: number;
  success: boolean;
  error?: string;
}

function loadConfigWithMetrics(env: NodeJS.ProcessEnv): ConfigLoadMetrics {
  const startTime = Date.now();
  const metrics: ConfigLoadMetrics = {
    source: 'unknown',
    loadTime: 0,
    validationTime: 0,
    success: false,
  };

  try {
    const { config, source } = loadConfigWithSource(env);
    metrics.source = source.type;
    metrics.loadTime = Date.now() - startTime;

    // Additional validation
    const validationStart = Date.now();
    validateConfiguration(config);
    metrics.validationTime = Date.now() - validationStart;

    metrics.success = true;
    return metrics;
  } catch (error) {
    metrics.success = false;
    metrics.error = error instanceof Error ? error.message : String(error);
    return metrics;
  }
}

// Usage
const metrics = loadConfigWithMetrics(process.env);
console.log('Configuration load metrics:', metrics);

// Send to monitoring system
if (!metrics.success) {
  alertMonitoringSystem('CONFIG_LOAD_FAILED', metrics);
}
```

### Debugging Configuration Issues

#### Debug Logging

```typescript
import { loadConfigWithSource } from '@promethean/mcp/config/load-config.js';

function debugConfigLoading(env: NodeJS.ProcessEnv): void {
  console.log('=== Configuration Loading Debug ===');
  console.log(
    'Environment variables:',
    Object.keys(env).filter((k) => k.startsWith('MCP_')),
  );
  console.log('Process arguments:', process.argv);
  console.log('Current working directory:', process.cwd());

  try {
    const { config, source } = loadConfigWithSource(env);
    console.log('Configuration source:', source);
    console.log('Configuration:', JSON.stringify(config, null, 2));
  } catch (error) {
    console.error('Configuration loading failed:', error);

    // Additional debugging
    if (env.MCP_CONFIG_JSON) {
      console.log('MCP_CONFIG_JSON content:', env.MCP_CONFIG_JSON);
    }

    const configPath = findConfigPath();
    if (configPath) {
      console.log('Found config file:', configPath);
      try {
        const content = fs.readFileSync(configPath, 'utf8');
        console.log('Config file content:', content);
      } catch (readError) {
        console.error('Could not read config file:', readError);
      }
    } else {
      console.log('No config file found');
    }
  }
}

// Enable debug mode
if (process.env.DEBUG_CONFIG) {
  debugConfigLoading(process.env);
}
```

#### Configuration Health Check

```typescript
import { loadConfig } from '@promethean/mcp/config/load-config.js';

function checkConfigurationHealth(): { healthy: boolean; issues: string[] } {
  const issues: string[] = [];

  try {
    const config = loadConfig(process.env);

    // Check for common issues
    if (config.tools.length === 0 && Object.keys(config.endpoints).length === 0) {
      issues.push('No tools or endpoints configured');
    }

    if (config.transport === 'http' && config.tools.length > 0) {
      issues.push('HTTP transport with top-level tools may not work as expected');
    }

    if (config.stdioProxyConfig && !fs.existsSync(config.stdioProxyConfig)) {
      issues.push(`Proxy config file missing: ${config.stdioProxyConfig}`);
    }

    return {
      healthy: issues.length === 0,
      issues,
    };
  } catch (error) {
    return {
      healthy: false,
      issues: [
        `Configuration loading failed: ${error instanceof Error ? error.message : String(error)}`,
      ],
    };
  }
}

// Usage in health check endpoint
const health = checkConfigurationHealth();
if (!health.healthy) {
  console.warn('Configuration health issues:', health.issues);
}
```

---

## 📖 Cross-References

### Related Documentation

- [[MCP_AUTHORIZATION_ARCHITECTURE.md]] - Security and authorization design
- [[packages/mcp/README.md]] - MCP package overview and usage
- [[docs/agile/mcp-reference.md]] - MCP development reference
- [[docs/agile/kanban-cli-reference.md]] - CLI tooling reference

### Related Modules

- `@promethean/mcp/core/authentication.ts` - Authentication integration
- `@promethean/mcp/core/authorization.ts` - Authorization framework
- `@promethean/mcp/core/transports/` - Transport layer implementations
- `@promethean/mcp/proxy/` - Proxy configuration and management

### Configuration Examples

- `packages/mcp/examples/mcp_servers.edn` - EDN proxy configuration
- `packages/mcp/minimal-mcp.json` - Minimal configuration example
- `packages/mcp/test-minimal-config.json` - Test configuration

### Testing Resources

- `packages/mcp/src/tests/config.test.ts` - Configuration resolution tests
- `packages/mcp/src/tests/config-write.test.ts` - Configuration persistence tests
- `packages/mcp/src/tests/validate-config.test.ts` - Schema validation tests

---

## 🚀 Best Practices

### Development Environment

1. **Use Auto-detection for Development**:

   ```typescript
   // Let the system find promethean.mcp.json automatically
   const config = loadConfig(process.env);
   ```

2. **Include Comprehensive Metadata**:

   ```json
   {
     "stdioMeta": {
       "title": "Development MCP Server",
       "description": "Local development environment",
       "workflow": ["mcp_toolset", "mcp_validate_config"],
       "expectations": {
         "usage": ["Start with mcp_toolset"],
         "pitfalls": ["Avoid production data"],
         "prerequisites": ["Local development setup"]
       }
     }
   }
   ```

3. **Version Control Configuration**:
   ```json
   {
     "version": "2025-06-18-dev",
     "metadata": {
       "environment": "development",
       "managed": false,
       "lastModified": "2025-06-18T10:00:00Z"
     }
   }
   ```

### Production Environment

1. **Use Explicit Configuration Paths**:

   ```typescript
   const config = loadConfig(process.env, [
     'node',
     'app',
     '--config',
     '/etc/promethean/production.json',
   ]);
   ```

2. **Secure Configuration Files**:

   ```bash
   # Set appropriate permissions
   sudo chown promethean:promethean /etc/promethean/promethean.mcp.json
   sudo chmod 600 /etc/promethean/promethean.mcp.json
   ```

3. **Environment Variable Overrides**:

   ```bash
   # Use environment for sensitive data
   export GITHUB_TOKEN="your-token-here"
   export DISCORD_WEBHOOK="your-webhook-url"
   ```

4. **Minimal Production Configuration**:
   ```json
   {
     "transport": "http",
     "tools": [],
     "endpoints": {
       "/api": {
         "tools": ["github_request", "files_view_file"],
         "includeHelp": false
       }
     },
     "version": "2025-06-18-prod",
     "metadata": {
       "environment": "production",
       "managed": true
     }
   }
   ```

### Configuration Management

1. **Use Configuration Templates**:

   ```typescript
   // templates/base-config.json
   {
     "transport": "http",
     "tools": [],
     "endpoints": {},
     "includeHelp": true,
     "version": "{{VERSION}}",
     "metadata": {
       "environment": "{{ENVIRONMENT}}",
       "managed": true
     }
   }
   ```

2. **Environment-Specific Configurations**:

   ```bash
   # Directory structure
   /etc/promethean/
   ├── base.json
   ├── development.json
   ├── staging.json
   └── production.json
   ```

3. **Configuration Validation Pipeline**:
   ```typescript
   async function validateAndDeploy(config: AppConfig): Promise<void> {
     // 1. Schema validation
     const validated = ConfigSchema.parse(config);

     // 2. Business logic validation
     validateConfiguration(validated);

     // 3. Security validation
     validateSecuritySettings(validated);

     // 4. Save with backup
     await backupExistingConfig();
     saveConfigFile('/etc/promethean/production.json', validated);
   }
   ```

### Monitoring and Observability

1. **Configuration Change Tracking**:

   ```typescript
   interface ConfigChangeEvent {
     timestamp: Date;
     source: ConfigSource;
     changes: string[];
     version: string;
   }

   function trackConfigChanges(oldConfig: AppConfig, newConfig: AppConfig): ConfigChangeEvent {
     // Detect and log configuration changes
   }
   ```

2. **Performance Monitoring**:

   ```typescript
   interface ConfigLoadMetrics {
     loadTime: number;
     validationTime: number;
     source: string;
     success: boolean;
   }

   function monitorConfigLoading(): ConfigLoadMetrics {
     const start = Date.now();
     // ... load configuration
     return {
       loadTime: Date.now() - start,
       validationTime: 0,
       source: 'file',
       success: true,
     };
   }
   ```

3. **Health Checks**:
   ```typescript
   function configurationHealthCheck(): { healthy: boolean; details: string[] } {
     const details: string[] = [];
     let healthy = true;

     try {
       const config = loadConfig(process.env);

       if (config.tools.length === 0) {
         details.push('No tools configured');
         healthy = false;
       }

       // Additional health checks...
     } catch (error) {
       details.push(`Configuration loading failed: ${error}`);
       healthy = false;
     }

     return { healthy, details };
   }
   ```

---

## 📝 Summary

The MCP Configuration Loader module provides a comprehensive, secure, and flexible foundation for managing configuration in the Promethean MCP framework. With its robust validation, security features, and multi-source resolution capabilities, it ensures that configuration management remains reliable and maintainable across different environments and use cases.

Key strengths include:

- **Type Safety**: Full TypeScript integration with Zod schema validation
- **Security**: Comprehensive protection against common vulnerabilities
- **Flexibility**: Multiple configuration sources with clear precedence
- **Observability**: Detailed source tracking and error handling
- **Maintainability**: Well-documented API with comprehensive examples

This module serves as the bedrock for MCP server operations, enabling developers to focus on building powerful AI tools while ensuring configuration remains secure, validated, and easily manageable.
