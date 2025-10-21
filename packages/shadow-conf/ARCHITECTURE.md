# Architecture Documentation

This document provides a comprehensive overview of the @promethean/shadow-conf package architecture, design decisions, and implementation details.

## 🏗 Overview

@promethean/shadow-conf is a configuration transformation tool that converts EDN (Extensible Data Notation) files into PM2 ecosystem configurations. The architecture follows a functional programming paradigm with strong type safety and comprehensive error handling.

## 📋 Core Concepts

### EDN to PM2 Transformation

The package transforms declarative EDN configurations into imperative PM2 JavaScript modules:

```
EDN Configuration → Parser → Normalizer → Aggregator → Generator → PM2 Ecosystem
```

### Key Abstractions

1. **Document**: Parsed EDN file with normalized structure
2. **App Record**: PM2 application configuration
3. **Automation Record**: Trigger, schedule, or action definition
4. **Path Resolution**: Relative path normalization against output directory

## 🎯 Design Principles

### 1. Functional Programming

- **Pure Functions**: All core functions are pure and side-effect free
- **Immutable Data**: Use readonly types and avoid mutation
- **Composability**: Functions are designed to be composed together
- **Predictable Behavior**: Same input always produces same output

### 2. Type Safety

- **Comprehensive Types**: Full TypeScript coverage for all APIs
- **Runtime Validation**: Input validation with clear error messages
- **Generic Constraints**: Proper use of generics for reusable code
- **Null Safety**: Explicit handling of null/undefined values

### 3. Error Handling

- **Descriptive Errors**: Clear error messages with context
- **Error Recovery**: Graceful handling of partial failures
- **Validation**: Early validation with immediate feedback
- **Stack Traces**: Preserved context for debugging

### 4. Performance

- **Lazy Evaluation**: Process files only when needed
- **Memory Efficiency**: Stream processing for large file sets
- **Parallel Processing**: Concurrent file operations where possible
- **Caching**: Avoid redundant operations

## 🏛 System Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CLI Layer     │    │   API Layer     │    │  Core Layer     │
│                 │    │                 │    │                 │
│ • Argument      │    │ • Public API    │    │ • EDN Parsing   │
│   Parsing       │    │ • Type          │    │ • Path          │
│ • Help Text     │    │   Definitions   │    │   Resolution    │
│ • Error         │    │ • Validation    │    │ • Aggregation   │
│   Reporting     │    │                 │    │ • Generation    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Data Layer     │
                    │                 │
                    │ • File System   │
                    │ • EDN Library   │
                    │ • Path Utils    │
                    └─────────────────┘
```

### Module Structure

```
src/
├── ecosystem.ts          # Core generation logic
│   ├── generateEcosystem()    # Main entry point
│   ├── collectEdnFiles()      # File discovery
│   ├── loadDocuments()        # File loading
│   ├── extractApps()          # App extraction
│   ├── normalizeAppPaths()    # Path normalization
│   └── formatOutput()         # Output generation
├── edn.ts               # EDN processing
│   ├── loadEdnFile()          # File loading
│   └── normalize()            # Data normalization
├── index.ts             # Public API
├── bin/
│   └── shadow-conf.ts   # CLI implementation
└── types/
    └── index.ts         # Type definitions
```

## 🔄 Data Flow

### 1. File Discovery Phase

```typescript
// Recursive directory traversal
const ednFiles = await collectEdnFiles(inputDir);

// Example result
[
  "/project/services/api/ecosystem.edn",
  "/project/services/worker/ecosystem.edn",
  "/project/shared/ecosystem.edn"
]
```

### 2. Loading Phase

```typescript
// Parallel file loading
const documents = await loadDocuments(ednFiles);

// Example document structure
{
  file: "/project/services/api/ecosystem.edn",
  document: {
    apps: [{ name: "api-service", script: "./dist/index.js" }],
    triggers: [{ name: "api-ready", event: "api/ready" }],
    schedules: [{ name: "health-check", cron: "*/5 * * * *" }],
    actions: [{ name: "notify", type: "webhook" }]
  }
}
```

### 3. Extraction Phase

```typescript
// Extract and normalize configurations
const apps = documents.flatMap(({ file, document }) => 
  extractApps(document, file)
).map(app => normalizeAppPaths(app, outputDir));
```

### 4. Generation Phase

```typescript
// Generate PM2 ecosystem file
await writeFile(outputPath, formatOutput({
  apps, triggers, schedules, actions
}), 'utf8');
```

## 🧩 Core Algorithms

### File Discovery Algorithm

```typescript
async function collectEdnFiles(rootDir: string): Promise<readonly string[]> {
  const entries = await readdir(rootDir, { withFileTypes: true });
  
  // Process each entry concurrently
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(rootDir, entry.name);
      
      if (entry.isDirectory()) {
        // Recursive call for subdirectories
        return collectEdnFiles(fullPath);
      }
      
      // Filter for .edn files
      return entry.isFile() && entry.name.endsWith('.edn') 
        ? [fullPath] 
        : [];
    })
  );
  
  // Flatten results
  return nested.flat();
}
```

**Key Characteristics:**
- **Recursive**: Traverses directory tree depth-first
- **Concurrent**: Processes directories in parallel
- **Filtered**: Only includes `.edn` files
- **Sorted**: Returns files in deterministic order

### Path Normalization Algorithm

```typescript
function normalizeAppPaths(app: AppRecord, baseDir: string): AppRecord {
  // Process each path field
  const cwd = normalizePath(app.cwd, baseDir);
  const script = normalizePath(app.script, baseDir);
  const watch = normalizePathArray(app.watch, baseDir);
  const env = normalizeEnvPaths(app.env, baseDir);
  
  return { ...app, cwd, script, watch, env };
}

function normalizePath(value: string | undefined, baseDir: string): string | undefined {
  if (!value || !isRelativePath(value)) return value;
  
  const absolutePath = path.resolve(baseDir, value);
  const relativePath = path.relative(baseDir, absolutePath);
  
  return normalizeRelativePath(relativePath);
}
```

**Key Characteristics:**
- **Selective**: Only processes relative paths
- **Preservative**: Keeps absolute paths unchanged
- **Consistent**: Normalizes to POSIX-style paths
- **Array-aware**: Handles both string and array path values

### EDN Normalization Algorithm

```typescript
function normalize(value: unknown): unknown {
  if (Array.isArray(value)) {
    // Recursively process arrays
    return value.map(item => normalize(item));
  }
  
  if (value === null || value === undefined) {
    return null;
  }
  
  if (typeof value !== 'object') {
    return value; // Primitive values
  }
  
  // Process objects, converting EDN keywords to strings
  return Object.entries(value).reduce((acc, [key, val]) => ({
    ...acc,
    [key.startsWith(':') ? key.slice(1) : key]: normalize(val)
  }), {});
}
```

**Key Characteristics:**
- **Recursive**: Processes nested structures
- **Keyword Conversion**: Strips `:` prefix from EDN keywords
- **Type Preservation**: Maintains original data types
- **Null Handling**: Converts undefined to null

## 🔧 Implementation Details

### Error Handling Strategy

#### Validation Errors

```typescript
function extractApps(value: DocumentRecord, source: string): readonly AppRecord[] {
  const appsValue = value.apps;
  if (!Array.isArray(appsValue)) {
    throw new Error(`EDN document ${source} is missing an :apps vector.`);
  }
  
  return appsValue.map((item, index) => {
    if (!isRecord(item)) {
      throw new Error(`App at index ${index} in ${source} is not a map.`);
    }
    return item as AppRecord;
  });
}
```

#### File System Errors

```typescript
try {
  const content = await readFile(filePath, "utf8");
  return normalize(edn.toJS(edn.parse(content)));
} catch (error) {
  if (error.code === 'ENOENT') {
    throw new Error(`EDN file not found: ${filePath}`);
  }
  if (error instanceof edn.ParserError) {
    throw new Error(`Invalid EDN syntax in ${filePath}: ${error.message}`);
  }
  throw error;
}
```

### Memory Management

#### Streaming for Large Files

```typescript
// Process files in batches to manage memory
const BATCH_SIZE = 10;
for (let i = 0; i < files.length; i += BATCH_SIZE) {
  const batch = files.slice(i, i + BATCH_SIZE);
  const batchDocuments = await loadDocuments(batch);
  // Process batch...
}
```

#### Garbage Collection Hints

```typescript
// Clear references when done
function processLargeDataset(data: LargeData): Result {
  const result = transform(data);
  // Help GC by clearing large reference
  data = null!;
  return result;
}
```

### Performance Optimizations

#### Concurrent File Operations

```typescript
// Load files concurrently
const documents = await Promise.all(
  files.map(async (file) => ({
    file,
    document: await loadEdnFile(file)
  }))
);
```

#### Path Caching

```typescript
// Cache resolved paths to avoid recomputation
const pathCache = new Map<string, string>();

function resolveCachedPath(base: string, relative: string): string {
  const key = `${base}:${relative}`;
  if (!pathCache.has(key)) {
    pathCache.set(key, path.resolve(base, relative));
  }
  return pathCache.get(key)!;
}
```

## 🧪 Testing Architecture

### Test Structure

```
tests/
├── unit/                 # Unit tests for individual functions
│   ├── ecosystem.test.ts
│   ├── edn.test.ts
│   └── path-utils.test.ts
├── integration/          # Integration tests for workflows
│   ├── full-generation.test.ts
│   └── cli.test.ts
├── fixtures/            # Test data and fixtures
│   ├── valid-edn/
│   ├── invalid-edn/
│   └── expected-outputs/
└── helpers/             # Test utilities and helpers
    ├── temp-dir.ts
    ├── file-utils.ts
    └── assertions.ts
```

### Test Categories

#### Unit Tests

- **Function-level testing**: Test individual functions in isolation
- **Edge cases**: Boundary conditions and error scenarios
- **Property-based testing**: Verify invariants and properties
- **Mock dependencies**: Isolate functions from external dependencies

#### Integration Tests

- **End-to-end workflows**: Test complete generation process
- **File system integration**: Test with real file operations
- **CLI integration**: Test command-line interface
- **Error propagation**: Test error handling across boundaries

#### Performance Tests

- **Large file sets**: Test with many EDN files
- **Complex configurations**: Test with nested structures
- **Memory usage**: Monitor memory consumption
- **Execution time**: Measure performance characteristics

## 🔮 Future Architecture Considerations

### Scalability

#### Plugin System

```typescript
interface Plugin {
  name: string;
  version: string;
  process(document: DocumentRecord): Promise<DocumentRecord>;
}

class PluginManager {
  private plugins: Plugin[] = [];
  
  async applyPlugins(document: DocumentRecord): Promise<DocumentRecord> {
    return this.plugins.reduce(async (doc, plugin) => {
      const processed = await plugin.process(await doc);
      return processed;
    }, Promise.resolve(document));
  }
}
```

#### Streaming Processing

```typescript
// Stream-based processing for very large file sets
async function* streamEdnFiles(rootDir: string): AsyncGenerator<string> {
  for await (const file of walkDirectory(rootDir)) {
    if (file.endsWith('.edn')) {
      yield file;
    }
  }
}
```

### Extensibility

#### Custom Automation Types

```typescript
interface AutomationType {
  name: string;
  schema: JSONSchema;
  validator: (config: unknown) => boolean;
  transformer: (config: unknown) => AutomationRecord;
}

class AutomationRegistry {
  private types = new Map<string, AutomationType>();
  
  register(type: AutomationType): void {
    this.types.set(type.name, type);
  }
  
  process(config: unknown): AutomationRecord {
    // Process using registered types
  }
}
```

#### Configuration Validation

```typescript
interface ValidationRule {
  field: string;
  required: boolean;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  validator?: (value: unknown) => boolean;
}

class ConfigValidator {
  constructor(private rules: ValidationRule[]) {}
  
  validate(config: unknown): ValidationResult {
    // Validate configuration against rules
  }
}
```

## 📊 Metrics and Monitoring

### Performance Metrics

- **File Processing Time**: Time to process each EDN file
- **Memory Usage**: Peak memory consumption during generation
- **Error Rates**: Frequency of parsing and validation errors
- **Output Size**: Size of generated ecosystem files

### Quality Metrics

- **Test Coverage**: Percentage of code covered by tests
- **Type Coverage**: Percentage of code with explicit types
- **Documentation Coverage**: Percentage of documented APIs
- **Bug Detection Rate**: Issues caught by automated tests

## 🔒 Security Considerations

### Input Validation

- **Path Traversal**: Prevent directory traversal attacks
- **File Size Limits**: Limit maximum file size to prevent DoS
- **EDN Injection**: Validate EDN content against schema
- **Environment Variables**: Sanitize environment variable usage

### Output Security

- **Path Sanitization**: Ensure generated paths are safe
- **Code Injection**: Prevent code injection in generated files
- **Permission Checks**: Validate file system permissions
- **Sensitive Data**: Avoid exposing sensitive information

## 📚 Design Rationale

### Why EDN?

1. **Human-Readable**: EDN is more readable than JSON for configuration
2. **Comments**: EDN supports comments, unlike JSON
3. **Extensible**: EDN has extensible data types and tagged literals
4. **Clojure Ecosystem**: Leverages existing Clojure tooling and knowledge

### Why TypeScript?

1. **Type Safety**: Catch errors at compile time rather than runtime
2. **IDE Support**: Better autocomplete and refactoring support
3. **Documentation**: Types serve as documentation
4. **Ecosystem**: Rich ecosystem of tools and libraries

### Why Functional Programming?

1. **Predictability**: Pure functions are easier to test and reason about
2. **Composability**: Small functions can be composed into complex workflows
3. **Concurrency**: Immutable data is safer for concurrent operations
4. **Maintainability**: Functional code is often easier to maintain

This architecture provides a solid foundation for a reliable, maintainable, and extensible configuration transformation tool.