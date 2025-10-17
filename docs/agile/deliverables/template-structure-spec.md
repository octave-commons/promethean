# Template Structure Specification

## Overview

This document defines the template structure requirements for the Agent Instruction Generator system. It specifies the syntax, variable substitution rules, and conditional rendering needs based on the pattern analysis conducted in the previous phase.

## Template Syntax Requirements

### 1. Variable Substitution

#### Basic Variable Syntax

```
{{VARIABLE_NAME}}
```

**Rules:**

- Variables use UPPER_SNAKE_CASE
- Curly braces indicate substitution points
- No spaces within variable names
- Variables are case-sensitive

#### Object Property Access

```
{{OBJECT.PROPERTY}}
{{NESTED.OBJECT.PROPERTY}}
```

**Rules:**

- Dot notation for nested properties
- Supports unlimited nesting depth
- Property names follow camelCase convention

#### Array Access

```
{{ARRAY[index]}}
{{ARRAY[index].PROPERTY}}
```

**Rules:**

- Zero-based indexing
- Supports property access on array elements
- Index can be variable: `{{ARRAY[{{INDEX_VAR}}]}}`

### 2. Conditional Rendering

#### Simple Conditional

```
{{#if CONDITION}}
Content to render when condition is true
{{/if}}
```

#### If-Else Conditional

```
{{#if CONDITION}}
Content when true
{{else}}
Content when false
{{/if}}
```

#### Multi-Condition Conditional

```
{{#if CONDITION1}}
Content for condition 1
{{elseif CONDITION2}}
Content for condition 2
{{else}}
Default content
{{/if}}
```

#### Existence Check

```
{{#if VARIABLE}}
Content when variable exists and is truthy
{{/if}}

{{#unless VARIABLE}}
Content when variable doesn't exist or is falsy
{{/unless}}
```

### 3. Iteration

#### Array Iteration

```
{{#each ARRAY}}
{{this}} - Current item
{{@index}} - Current index (0-based)
{{@first}} - True if first item
{{@last}} - True if last item
{{/each}}
```

#### Object Iteration

```
{{#each OBJECT}}
{{key}} - Current key
{{value}} - Current value
{{@key}} - Alternative syntax for key
{{/each}}
```

#### Iteration with Custom Variable Name

```
{{#each ARRAY as ITEM}}
{{ITEM.property}}
{{/each}}
```

### 4. Partials and Includes

#### Include Partial

```
{{> partial-name}}
{{> partial-name VARIABLE=value}}
```

#### Inline Partial Definition

```
{{#*inline "partial-name"}}
Partial content with {{variables}}
{{/inline}}
```

### 5. Helper Functions

#### Built-in Helpers

```
{{#uppercase VARIABLE}} - Convert to uppercase
{{#lowercase VARIABLE}} - Convert to lowercase
{{#capitalize VARIABLE}} - Capitalize first letter
{{#truncate VARIABLE length}} - Truncate text
{{#formatDate VARIABLE format}} - Format dates
{{#json VARIABLE}} - Convert to JSON string
{{#length ARRAY}} - Get array length
{{#join ARRAY separator}} - Join array elements
```

#### Custom Helper Registration

```
{{#customHelper param1 param2}}
Content
{{/customHelper}}
```

## Variable Naming Conventions

### 1. Project Variables

```
{{PROJECT_NAME}} - Project identifier
{{PROJECT_ROOT}} - Root directory path
{{PROJECT_DESCRIPTION}} - Project description
{{PROJECT_VERSION}} - Current version
```

### 2. Configuration Variables

```
{{PACKAGE_MANAGER}} - npm, pnpm, yarn
{{NODE_VERSION}} - Required Node.js version
{{BUILD_TOOL}} - Nx, webpack, vite
{{TEST_RUNNER}} - jest, ava, mocha
{{LINTER}} - eslint, tslint
```

### 3. Path Variables

```
{{DOCS_ROOT}} - Documentation root directory
{{SRC_ROOT}} - Source code root directory
{{TASKS_DIR}} - Tasks directory path
{{BOARDS_DIR}} - Kanban boards directory
{{TEMPLATES_DIR}} - Templates directory
{{CONFIG_DIR}} - Configuration directory
```

### 4. Agent Variables

```
{{AGENT_NAME}} - Agent identifier
{{AGENT_ROLE}} - Agent role description
{{AGENT_MODEL}} - AI model used
{{AGENT_TOOLS}} - List of available tools
{{AGENT_PERMISSIONS}} - Access level
{{AGENT_DESCRIPTION}} - Usage description
```

### 5. Content Variables

```
{{SECTION_TITLE}} - Section header text
{{COMMAND_LIST}} - List of commands
{{EXAMPLE_CODE}} - Code examples
{{REFERENCE_LINKS}} - Cross-references
{{NOTES}} - Additional notes
```

### 6. Metadata Variables

```
{{CREATED_DATE}} - Creation timestamp
{{UPDATED_DATE}} - Last modification
{{AUTHOR}} - Content author
{{VERSION}} - Document version
{{STATUS}} - Current status
{{PRIORITY}} - Priority level
```

## Template Structure Patterns

### 1. Document Template Structure

```markdown
---
{ { FRONTMATTER } }
---

# {{DOCUMENT_TITLE}}

{{#if DESCRIPTION}}
{{DESCRIPTION}}
{{/if}}

{{#each SECTIONS}}

## {{title}}

{{content}}

{{#if subsections}}
{{#each subsections}}

### {{title}}

{{content}}
{{/each}}
{{/if}}

{{/each}}
```

### 2. Agent Configuration Template

```markdown
---
name: {{AGENT_NAME}}
description: {{AGENT_DESCRIPTION}}
model: {{AGENT_MODEL}}
{{#if AGENT_COLOR}}color: {{AGENT_COLOR}}{{/if}}
tools: [{{#each AGENT_TOOLS}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}]
{{#if SECURITY_CATEGORY}}security_category: {{SECURITY_CATEGORY}}{{/if}}
{{#if ACCESS_LEVEL}}access_level: {{ACCESS_LEVEL}}{{/if}}
{{#if AUDIT_REQUIRED}}audit_required: {{AUDIT_REQUIRED}}{{/if}}
---

{{AGENT_INTRO_TEXT}}

## Core Responsibilities

{{#each RESPONSIBILITIES}}

- {{this}}
  {{/each}}

{{#if TOOLS_SECTION}}

## Available Tools

{{TOOLS_SECTION}}
{{/if}}

{{#if PROCESS_SECTION}}

## Process Framework

{{PROCESS_SECTION}}
{{/if}}
```

### 3. Navigation Hub Template

```markdown
# {{NAVIGATION_TITLE}}

## 🚀 Quick Start

{{#each QUICK_START_LINKS}}

- **{{title}}**: [[{{link}}|{{display_text}}]
  {{/each}}

---

## 📋 Core Workflows

{{#each WORKFLOW_CATEGORIES}}

### {{category_name}}

{{#each items}}

- [[{{link}}|{{description}}] - {{notes}}
  {{/each}}

{{/each}}

---

{{#each ADDITIONAL_SECTIONS}}

## {{section_title}}

{{section_content}}

{{/each}}
```

### 4. Command Reference Template

````markdown
## {{SECTION_TITLE}}

```bash
{{#each COMMANDS}}
{{command}}
{{/each}}
```
````

{{#if DESCRIPTIONS}}
{{#each DESCRIPTIONS}}
{{description}}
{{/each}}
{{/if}}

````

## Conditional Rendering Rules

### 1. Environment-Based Conditions
```handlebars
{{#if (eq ENVIRONMENT "development")}}
Development-specific instructions
{{elseif (eq ENVIRONMENT "production")}}
Production-specific instructions
{{/if}}
````

### 2. Feature Flag Conditions

```handlebars
{{#if FEATURE_KANBAN}}
  ## Kanban Integration

  {{KANBAN_INSTRUCTIONS}}
{{/if}}

{{#if FEATURE_MCP}}
  ## MCP Tools

  {{MCP_INSTRUCTIONS}}
{{/if}}
```

### 3. Role-Based Conditions

```handlebars
{{#if (eq AGENT_ROLE 'security-specialist')}}
  ## Security Focus

  {{SECURITY_SPECIFIC_CONTENT}}
{{/if}}

{{#if (eq AGENT_ROLE 'ux-specialist')}}
  ## UX Focus

  {{UX_SPECIFIC_CONTENT}}
{{/if}}
```

### 4. Platform-Specific Conditions

```handlebars
{{#if (eq PLATFORM 'opencode')}}
  ## Opencode Integration

  {{OPencode_SPECIFIC_CONTENT}}
{{/if}}

{{#if (eq PLATFORM 'claude')}}
  ## Claude Integration

  {{CLAUDE_SPECIFIC_CONTENT}}
{{/if}}
```

## Data Sources and Context

### 1. Project Configuration

```json
{
  "project": {
    "name": "Promethean",
    "root": "/home/err/devel/promethean",
    "version": "1.0.0",
    "description": "AI agent orchestration platform"
  },
  "paths": {
    "docs": "docs/",
    "tasks": "docs/agile/tasks/",
    "boards": "docs/agile/boards/",
    "templates": "templates/",
    "config": "config/"
  },
  "tools": {
    "packageManager": "pnpm",
    "nodeVersion": "20.19.4",
    "buildTool": "Nx",
    "testRunner": "AVA",
    "linter": "ESLint"
  }
}
```

### 2. Agent Configuration

```json
{
  "agent": {
    "name": "security-specialist",
    "role": "Security analysis and vulnerability assessment",
    "model": "sonnet",
    "tools": ["read", "write", "bash", "webfetch"],
    "permissions": "balanced_access",
    "description": "Use for security analysis and vulnerability assessment"
  }
}
```

### 3. Template Variables

```json
{
  "variables": {
    "DOCUMENT_TITLE": "Security Specialist Agent",
    "CREATED_DATE": "2025-10-16",
    "STATUS": "active",
    "PRIORITY": "high"
  }
}
```

## Template Validation Rules

### 1. Required Variables

- `{{DOCUMENT_TITLE}}` - Must be present in all document templates
- `{{PROJECT_NAME}}` - Must be available for context
- `{{CREATED_DATE}}` - Must be generated for all templates

### 2. Variable Type Validation

- **String variables**: Must resolve to string values
- **Array variables**: Must be iterable for `{{#each}}` blocks
- **Boolean variables**: Must be truthy/falsy for conditionals
- **Object variables**: Must have valid property access

### 3. Reference Integrity

- All `[[wikilinks]]` must resolve to existing documents
- Cross-references must be validated
- Circular references must be detected and prevented

### 4. Syntax Validation

- All opening tags must have corresponding closing tags
- Nested blocks must be properly structured
- Variable names must follow naming conventions

## Template Organization

### 1. Template Directory Structure

```
templates/
├── base/
│   ├── document.hbs
│   ├── agent-config.hbs
│   ├── navigation.hbs
│   └── command-reference.hbs
├── partials/
│   ├── header.hbs
│   ├── footer.hbs
│   ├── navigation.hbs
│   ├── command-block.hbs
│   └── code-example.hbs
├── data/
│   ├── project.json
│   ├── agents.json
│   ├── tools.json
│   └── paths.json
└── helpers/
    ├── formatting.js
    ├── validation.js
    └── custom-functions.js
```

### 2. Template Naming Conventions

- **Base templates**: `{type}.hbs` (e.g., `document.hbs`)
- **Partials**: `{component}.hbs` (e.g., `header.hbs`)
- **Data files**: `{category}.json` (e.g., `project.json`)
- **Helper files**: `{purpose}.js` (e.g., `formatting.js`)

### 3. Template Inheritance

```handlebars
{{> base/document}}

{{#content}}
{{> partials/header}}

{{#if INTRODUCTION}}
{{INTRODUCTION}}
{{/if}}

{{> partials/navigation}}

{{> partials/footer}}
{{/content}}
```

## Performance Considerations

### 1. Template Caching

- Compiled templates should be cached in memory
- Template modification detection for cache invalidation
- Partial templates cached separately

### 2. Lazy Loading

- Large templates loaded on demand
- Conditional content rendered only when needed
- Data sources loaded asynchronously

### 3. Optimization

- Minimize template nesting depth
- Use efficient iteration patterns
- Avoid complex conditional logic in templates

## Error Handling

### 1. Missing Variables

- Graceful fallback to default values
- Warning messages for undefined variables
- Optional variable syntax: `{{variable||default}}`

### 2. Type Mismatches

- Automatic type conversion where possible
- Error messages for incompatible types
- Validation before template rendering

### 3. Syntax Errors

- Clear error messages with line numbers
- Template syntax highlighting in editors
- Linting tools for template validation

This specification provides the foundation for implementing a robust template system that can handle the diverse instruction file patterns identified in the analysis phase while maintaining flexibility and performance.
