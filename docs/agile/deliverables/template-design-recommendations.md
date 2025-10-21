# Template Design Recommendations

## Executive Summary

This document provides comprehensive implementation guidance for the Agent Instruction Generator template system based on the pattern analysis and template specification. It covers system architecture, technology choices, implementation strategy, and best practices for creating a maintainable and scalable template generation system.

## System Architecture Recommendations

### 1. Template Engine Selection

#### Recommended: Handlebars.js with Custom Helpers

**Rationale:**

- **Mature and Stable**: Well-established with extensive documentation
- **Flexible**: Supports complex logic through custom helpers
- **Performance**: Efficient compilation and caching
- **Ecosystem**: Rich plugin ecosystem and community support
- **Compatibility**: Works well with Node.js and TypeScript

**Alternative Options:**

- **Mustache**: Simpler syntax but less powerful for complex logic
- **Liquid**: Shopify's engine, good for security but more complex
- **Custom Template Engine**: Maximum control but significant development overhead

#### Implementation Architecture

```typescript
interface TemplateEngine {
  compile(template: string): CompiledTemplate;
  render(template: CompiledTemplate, data: TemplateData): string;
  registerHelper(name: string, helper: HelperFunction): void;
  registerPartial(name: string, partial: string): void;
}

interface TemplateData {
  project: ProjectData;
  agent?: AgentData;
  variables: Record<string, any>;
  environment: EnvironmentData;
}
```

### 2. Data Layer Design

#### Configuration Management

```typescript
interface ConfigurationManager {
  loadProjectConfig(): Promise<ProjectConfig>;
  loadAgentConfig(agentName: string): Promise<AgentConfig>;
  loadTemplateVariables(): Promise<TemplateVariables>;
  watchForChanges(callback: (changes: ConfigChange[]) => void): void;
}

interface ProjectConfig {
  name: string;
  root: string;
  version: string;
  description: string;
  paths: PathConfig;
  tools: ToolConfig;
  features: FeatureFlags;
}

interface AgentConfig {
  name: string;
  role: string;
  model: string;
  tools: string[];
  permissions: AccessLevel;
  description: string;
  capabilities: string[];
}
```

#### Data Sources

1. **Static Configuration Files**

   - `project.config.json` - Project-wide settings
   - `agents.config.json` - Agent definitions
   - `templates.config.json` - Template configurations

2. **Dynamic Data**

   - File system scanning for template discovery
   - Environment variable injection
   - Git metadata (timestamps, authors)

3. **Computed Data**
   - Cross-reference resolution
   - Dependency graph generation
   - Validation results

### 3. Template Organization Strategy

#### Directory Structure

```
packages/instruction-generator/
├── src/
│   ├── core/
│   │   ├── TemplateEngine.ts
│   │   ├── ConfigurationManager.ts
│   │   ├── DataProcessor.ts
│   │   └── Validator.ts
│   ├── templates/
│   │   ├── base/
│   │   ├── partials/
│   │   └── data/
│   ├── helpers/
│   │   ├── formatting.ts
│   │   ├── validation.ts
│   │   └── custom.ts
│   ├── generators/
│   │   ├── DocumentGenerator.ts
│   │   ├── AgentGenerator.ts
│   │   └── NavigationGenerator.ts
│   └── cli/
│       ├── commands/
│       └── index.ts
├── templates/
│   ├── base/
│   │   ├── document.hbs
│   │   ├── agent-config.hbs
│   │   ├── navigation.hbs
│   │   └── command-reference.hbs
│   ├── partials/
│   │   ├── header.hbs
│   │   ├── footer.hbs
│   │   ├── navigation.hbs
│   │   ├── command-block.hbs
│   │   └── code-example.hbs
│   └── data/
│       ├── project.json
│       ├── agents.json
│       ├── tools.json
│       └── paths.json
└── config/
    ├── default.json
    ├── development.json
    └── production.json
```

## Implementation Strategy

### Phase 1: Core Infrastructure (Week 1-2)

#### 1.1 Template Engine Setup

```typescript
// src/core/TemplateEngine.ts
import Handlebars from 'handlebars';
import { registerCustomHelpers } from '../helpers';

export class TemplateEngine {
  private handlebars: typeof Handlebars;

  constructor() {
    this.handlebars = Handlebars.create();
    this.registerHelpers();
    this.loadPartials();
  }

  private registerHelpers(): void {
    registerCustomHelpers(this.handlebars);
  }

  private loadPartials(): void {
    // Load partial templates from filesystem
  }

  compile(template: string): HandlebarsTemplateDelegate {
    return this.handlebars.compile(template);
  }

  render(template: HandlebarsTemplateDelegate, data: any): string {
    return template(data);
  }
}
```

#### 1.2 Configuration Management

```typescript
// src/core/ConfigurationManager.ts
import { readFileSync, watch } from 'fs';
import { join } from 'path';

export class ConfigurationManager {
  private config: ProjectConfig;
  private watchers: FSWatcher[] = [];

  async loadConfig(): Promise<ProjectConfig> {
    const configPath = this.getConfigPath();
    const configData = readFileSync(configPath, 'utf-8');
    this.config = JSON.parse(configData);
    return this.config;
  }

  watchConfig(callback: (config: ProjectConfig) => void): void {
    const watcher = watch(this.getConfigPath(), (eventType) => {
      if (eventType === 'change') {
        this.loadConfig().then(callback);
      }
    });
    this.watchers.push(watcher);
  }
}
```

#### 1.3 Basic Template Generation

```typescript
// src/generators/DocumentGenerator.ts
export class DocumentGenerator {
  constructor(
    private templateEngine: TemplateEngine,
    private configManager: ConfigurationManager,
  ) {}

  async generateDocument(templateName: string, data: any): Promise<string> {
    const template = await this.loadTemplate(templateName);
    const compiledTemplate = this.templateEngine.compile(template);
    const enrichedData = await this.enrichData(data);
    return this.templateEngine.render(compiledTemplate, enrichedData);
  }

  private async enrichData(data: any): Promise<any> {
    const config = await this.configManager.loadConfig();
    return {
      ...data,
      project: config,
      generated: {
        timestamp: new Date().toISOString(),
        version: config.version,
      },
    };
  }
}
```

### Phase 2: Advanced Features (Week 3-4)

#### 2.1 Custom Helper Functions

```typescript
// src/helpers/formatting.ts
export function registerFormattingHelpers(handlebars: typeof Handlebars): void {
  // Uppercase helper
  handlebars.registerHelper('uppercase', (str: string) => {
    return str ? str.toUpperCase() : '';
  });

  // Truncate helper
  handlebars.registerHelper('truncate', (str: string, length: number) => {
    if (!str) return '';
    return str.length > length ? str.substring(0, length) + '...' : str;
  });

  // Date formatting helper
  handlebars.registerHelper('formatDate', (date: string, format: string) => {
    const d = new Date(date);
    // Implement date formatting logic
    return d.toISOString().split('T')[0]; // Simple YYYY-MM-DD format
  });

  // JSON formatting helper
  handlebars.registerHelper('json', (obj: any) => {
    return JSON.stringify(obj, null, 2);
  });

  // Conditional equality helper
  handlebars.registerHelper('eq', (a: any, b: any) => {
    return a === b;
  });
}
```

#### 2.2 Validation Framework

```typescript
// src/core/Validator.ts
export class TemplateValidator {
  validateTemplate(template: string): ValidationResult {
    const errors: string[] = [];

    // Check for unmatched tags
    this.checkTagMatching(template, errors);

    // Check variable naming
    this.checkVariableNaming(template, errors);

    // Check reference integrity
    this.checkReferences(template, errors);

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private checkTagMatching(template: string, errors: string[]): void {
    const openTags = (template.match(/\{\{#[^}]+\}\}/g) || []).length;
    const closeTags = (template.match(/\{\{\/[^}]+\}\}/g) || []).length;

    if (openTags !== closeTags) {
      errors.push(`Mismatched tags: ${openTags} opening, ${closeTags} closing`);
    }
  }

  private checkVariableNaming(template: string, errors: string[]): void {
    const variables = template.match(/\{\{([^}]+)\}\}/g) || [];

    variables.forEach((variable) => {
      const name = variable.replace(/[{}]/g, '').trim();
      if (!this.isValidVariableName(name)) {
        errors.push(`Invalid variable name: ${name}`);
      }
    });
  }

  private isValidVariableName(name: string): boolean {
    // Check if follows UPPER_SNAKE_CASE convention
    return /^[A-Z][A-Z0-9_]*$/.test(name);
  }
}
```

#### 2.3 Cross-Reference Management

```typescript
// src/core/ReferenceManager.ts
export class ReferenceManager {
  private referenceMap: Map<string, string> = new Map();

  async buildReferenceMap(docsRoot: string): Promise<void> {
    // Scan all documents to build reference map
    const documents = await this.scanDocuments(docsRoot);

    documents.forEach((doc) => {
      const references = this.extractReferences(doc.content);
      references.forEach((ref) => {
        this.referenceMap.set(ref, doc.path);
      });
    });
  }

  validateReferences(template: string): ValidationResult {
    const errors: string[] = [];
    const references = this.extractReferences(template);

    references.forEach((ref) => {
      if (!this.referenceMap.has(ref)) {
        errors.push(`Broken reference: ${ref}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private extractReferences(content: string): string[] {
    const regex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
    const references: string[] = [];
    let match;

    while ((match = regex.exec(content)) !== null) {
      references.push(match[1]);
    }

    return references;
  }
}
```

### Phase 3: CLI Integration (Week 5-6)

#### 3.1 Command Line Interface

```typescript
// src/cli/commands/generate.ts
import { Command } from 'commander';
import { DocumentGenerator } from '../generators/DocumentGenerator';

export const generateCommand = new Command('generate')
  .description('Generate instruction files from templates')
  .option('-t, --template <name>', 'Template name to use')
  .option('-o, --output <path>', 'Output file path')
  .option('-d, --data <path>', 'Data file path')
  .option('--watch', 'Watch for changes and regenerate')
  .action(async (options) => {
    const generator = new DocumentGenerator();

    if (options.watch) {
      await generator.watchAndGenerate(options);
    } else {
      await generator.generateOnce(options);
    }
  });
```

#### 3.2 Watch Mode Implementation

```typescript
// src/core/WatchManager.ts
export class WatchManager {
  private watchers: FSWatcher[] = [];

  async watchTemplates(
    templatePath: string,
    dataPath: string,
    outputPath: string,
    generator: DocumentGenerator,
  ): Promise<void> {
    // Watch template changes
    const templateWatcher = watch(templatePath, async (eventType, filename) => {
      if (eventType === 'change' && filename) {
        console.log(`Template changed: ${filename}`);
        await generator.regenerate(outputPath);
      }
    });

    // Watch data changes
    const dataWatcher = watch(dataPath, async (eventType, filename) => {
      if (eventType === 'change' && filename) {
        console.log(`Data changed: ${filename}`);
        await generator.regenerate(outputPath);
      }
    });

    this.watchers.push(templateWatcher, dataWatcher);
  }

  stop(): void {
    this.watchers.forEach((watcher) => watcher.close());
    this.watchers = [];
  }
}
```

## Variable Naming Conventions

### 1. Hierarchy and Scope

```typescript
// Global project variables
{
  {
    PROJECT_NAME;
  }
}
{
  {
    PROJECT_ROOT;
  }
}
{
  {
    PROJECT_VERSION;
  }
}

// Path variables
{
  {
    DOCS_ROOT;
  }
}
{
  {
    TASKS_DIR;
  }
}
{
  {
    BOARDS_DIR;
  }
}

// Agent-specific variables
{
  {
    AGENT_NAME;
  }
}
{
  {
    AGENT_ROLE;
  }
}
{
  {
    AGENT_TOOLS;
  }
}

// Content variables
{
  {
    SECTION_TITLE;
  }
}
{
  {
    COMMAND_LIST;
  }
}
{
  {
    EXAMPLE_CODE;
  }
}

// Metadata variables
{
  {
    CREATED_DATE;
  }
}
{
  {
    UPDATED_DATE;
  }
}
{
  {
    AUTHOR;
  }
}
```

### 2. Type Safety

```typescript
interface VariableDefinitions {
  // String variables
  PROJECT_NAME: string;
  DOCUMENT_TITLE: string;
  AGENT_DESCRIPTION: string;

  // Array variables
  AGENT_TOOLS: string[];
  COMMAND_LIST: string[];
  REFERENCE_LINKS: ReferenceLink[];

  // Object variables
  PROJECT_CONFIG: ProjectConfig;
  AGENT_CONFIG: AgentConfig;

  // Boolean variables
  FEATURE_KANBAN: boolean;
  AUDIT_REQUIRED: boolean;
}
```

### 3. Validation Rules

```typescript
export class VariableValidator {
  validateVariables(data: any): ValidationResult {
    const errors: string[] = [];

    // Check required variables
    this.checkRequiredVariables(data, errors);

    // Check variable types
    this.checkVariableTypes(data, errors);

    // Check variable formats
    this.checkVariableFormats(data, errors);

    return { isValid: errors.length === 0, errors };
  }

  private checkRequiredVariables(data: any, errors: string[]): void {
    const required = ['PROJECT_NAME', 'DOCUMENT_TITLE', 'CREATED_DATE'];

    required.forEach((variable) => {
      if (!data[variable]) {
        errors.push(`Required variable missing: ${variable}`);
      }
    });
  }
}
```

## Content Organization Strategy

### 1. Template Hierarchy

```
Base Templates
├── Document Template (root level)
├── Agent Configuration Template
├── Navigation Hub Template
└── Command Reference Template

Partial Templates
├── Header Section
├── Footer Section
├── Navigation Block
├── Command Block
├── Code Example Block
└── Reference Link Block

Data Templates
├── Project Data
├── Agent Data
├── Tool Data
└── Path Data
```

### 2. Content Categorization

```typescript
interface ContentCategory {
  static: {
    structure: string[]; // Section headers, organization
    process: string[]; // Workflows, methodologies
    standards: string[]; // Style guides, conventions
  };
  dynamic: {
    configuration: string[]; // Version numbers, paths
    project: string[]; // Project-specific info
    agent: string[]; // Agent-specific content
  };
  conditional: {
    environment: string[]; // Dev/prod differences
    features: string[]; // Feature-dependent content
    roles: string[]; // Role-based content
  };
}
```

### 3. Modular Content Strategy

```typescript
export class ContentModule {
  constructor(
    private name: string,
    private template: string,
    private dependencies: string[],
    private conditions: string[],
  ) {}

  canRender(context: TemplateContext): boolean {
    return this.conditions.every((condition) => this.evaluateCondition(condition, context));
  }

  async render(context: TemplateContext): Promise<string> {
    if (!this.canRender(context)) {
      return '';
    }

    // Resolve dependencies
    await this.resolveDependencies(context);

    // Render template
    return this.templateEngine.render(this.template, context);
  }
}
```

## Performance Optimization

### 1. Template Caching

```typescript
export class TemplateCache {
  private cache: Map<string, CompiledTemplate> = new Map();
  private maxSize: number = 100;

  get(key: string): CompiledTemplate | undefined {
    const template = this.cache.get(key);
    if (template) {
      // Move to end (LRU)
      this.cache.delete(key);
      this.cache.set(key, template);
    }
    return template;
  }

  set(key: string, template: CompiledTemplate): void {
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, template);
  }
}
```

### 2. Lazy Loading

```typescript
export class LazyTemplateLoader {
  private loadedTemplates: Set<string> = new Set();

  async loadTemplate(name: string): Promise<string> {
    if (!this.loadedTemplates.has(name)) {
      const template = await this.loadFromFile(name);
      this.loadedTemplates.add(name);
      return template;
    }

    return this.getCachedTemplate(name);
  }

  private async loadFromFile(name: string): Promise<string> {
    const path = join(this.templateDir, `${name}.hbs`);
    return readFile(path, 'utf-8');
  }
}
```

### 3. Incremental Generation

```typescript
export class IncrementalGenerator {
  private dependencyGraph: DependencyGraph;

  async generateIncremental(changedFile: string, outputPath: string): Promise<void> {
    // Find dependent templates
    const dependents = this.dependencyGraph.getDependents(changedFile);

    // Regenerate only affected files
    for (const dependent of dependents) {
      await this.generateSingle(dependent, outputPath);
    }
  }
}
```

## Testing Strategy

### 1. Unit Tests

```typescript
describe('TemplateEngine', () => {
  let engine: TemplateEngine;

  beforeEach(() => {
    engine = new TemplateEngine();
  });

  test('should render simple template', () => {
    const template = 'Hello {{NAME}}!';
    const result = engine.render(template, { NAME: 'World' });
    expect(result).toBe('Hello World!');
  });

  test('should handle conditional blocks', () => {
    const template = '{{#if SHOW}}Visible{{/if}}';
    expect(engine.render(template, { SHOW: true })).toBe('Visible');
    expect(engine.render(template, { SHOW: false })).toBe('');
  });
});
```

### 2. Integration Tests

```typescript
describe('DocumentGenerator Integration', () => {
  test('should generate complete document', async () => {
    const generator = new DocumentGenerator();
    const result = await generator.generateDocument('agent-config', {
      agent: {
        name: 'test-agent',
        role: 'Testing',
        tools: ['read', 'write'],
      },
    });

    expect(result).toContain('test-agent');
    expect(result).toContain('Testing');
    expect(result).toContain('read, write');
  });
});
```

### 3. End-to-End Tests

```typescript
describe('CLI Integration', () => {
  test('should generate file via CLI', async () => {
    const outputPath = tempFile();

    await execAsync(`npm run generate -- -t agent-config -o ${outputPath}`);

    expect(existsSync(outputPath)).toBe(true);
    const content = readFile(outputPath, 'utf-8');
    expect(content).toContain('name:');
  });
});
```

## Deployment and Maintenance

### 1. Package Structure

```json
{
  "name": "@promethean/instruction-generator",
  "version": "1.0.0",
  "main": "dist/index.js",
  "bin": {
    "instruction-gen": "dist/cli/index.js"
  },
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "lint": "eslint src/**/*.ts",
    "generate": "node dist/cli/index.js generate"
  }
}
```

### 2. Configuration Management

```typescript
// config/default.json
{
  "templates": {
    "directory": "templates",
    "cacheSize": 100,
    "watchInterval": 1000
  },
  "validation": {
    "strictMode": true,
    "checkReferences": true,
    "enforceNaming": true
  },
  "output": {
    "directory": "generated",
    "backupOriginal": true,
    "validateOutput": true
  }
}
```

### 3. Monitoring and Logging

```typescript
export class GeneratorLogger {
  private logger: Logger;

  logGeneration(template: string, output: string, duration: number): void {
    this.logger.info({
      event: 'template_generated',
      template,
      output,
      duration,
      timestamp: new Date().toISOString(),
    });
  }

  logError(error: Error, context: any): void {
    this.logger.error({
      event: 'generation_error',
      error: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
    });
  }
}
```

## Conclusion

This implementation plan provides a comprehensive roadmap for building the Agent Instruction Generator template system. The phased approach ensures manageable development while delivering value incrementally. The architecture emphasizes maintainability, performance, and extensibility to support the evolving needs of the Promethean project.

Key success factors:

1. **Start Simple**: Begin with core functionality and add complexity gradually
2. **Test Thoroughly**: Comprehensive testing at each phase ensures reliability
3. **Monitor Performance**: Caching and optimization strategies for scalability
4. **Document Everything**: Clear documentation for maintainability and onboarding

The template system will significantly reduce manual maintenance overhead while ensuring consistency across all instruction files in the project.
