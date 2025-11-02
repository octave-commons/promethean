# Code Linking Patterns and Standards

This document defines the standard patterns for linking documentation to source code in Promethean.

## Link Types

### 1. File Links
Link to entire source files from documentation.

**Pattern:**
```markdown
[`src/filename.ts`](../../../packages/package-name/src/filename.ts)
```

**Example:**
```markdown
[`src/index.ts`](../../../packages/llm/src/index.ts)
```

### 2. Line-Specific Links
Link to specific lines in source files.

**Pattern:**
```markdown
[`functionName()`](../../../packages/package-name/src/filename.ts#L{line-number})
```

**Example:**
```markdown
[`generate()`](../../../packages/llm/src/index.ts#L45)
```

### 3. Class/Interface Links
Link to class or interface definitions.

**Pattern:**
```markdown
[`ClassName`](../../../packages/package-name/src/filename.ts#L{line-number})
```

**Example:**
```markdown
[`AILearningSystem`](../../../packages/ai-learning/src/learning-system.ts#L12)
```

### 4. GitHub Links
Link to source files on GitHub.

**Pattern:**
```markdown
[GitHub](https://github.com/promethean-ai/promethean/tree/main/packages/package-name/src)
```

**Example:**
```markdown
[GitHub](https://github.com/promethean-ai/promethean/tree/main/packages/ai-learning/src)
```

### 5. IDE Links
Links that open directly in IDEs.

**VS Code Pattern:**
```markdown
[VS Code](vscode://file/{absolute-path-to-file}:{line-number})
```

**Example:**
```markdown
[VS Code](vscode://file/home/err/devel/promethean/packages/ai-learning/src/learning-system.ts:12)
```

## Documentation Sections

### Implementation Section
Standard section for code links in package documentation.

**Template:**
```markdown
## 📁 Implementation

### Core Files
- **Main Entry**: [`src/index.ts`](../../../packages/package-name/src/index.ts)
- **Core Logic**: [`src/core.ts`](../../../packages/package-name/src/core.ts)
- **Types**: [`src/types.ts`](../../../packages/package-name/src/types.ts)

### Key Classes & Functions
- **MainClass**: [`MainClass`](../../../packages/package-name/src/core.ts#L{line}) - Description
- **keyFunction()**: [`keyFunction()`](../../../packages/package-name/src/core.ts#L{line}) - Description

### View Source
- **GitHub**: [View on GitHub](https://github.com/promethean-ai/promethean/tree/main/packages/package-name/src)
- **VS Code**: [Open in VS Code](vscode://file/packages/package-name/src)
```

### API Reference Section
Detailed API documentation with code links.

**Template:**
```markdown
## 📚 API Reference

### Classes

#### MainClass
**Location**: [`src/core.ts`](../../../packages/package-name/src/core.ts#L{line})

**Description**: Main class for package functionality.

**Methods**:
- [`constructor()`](../../../packages/package-name/src/core.ts#L{line}) - Initialize the class
- [`mainMethod()`](../../../packages/package-name/src/core.ts#L{line}) - Main functionality
- [`helperMethod()`](../../../packages/package-name/src/core.ts#L{line}) - Helper functionality

### Functions

#### utilityFunction()
**Location**: [`src/utils.ts`](../../../packages/package-name/src/utils.ts#L{line})

**Description**: Utility function for specific purpose.

**Parameters**:
- `param1` - Description of parameter 1
- `param2` - Description of parameter 2

**Returns**: Description of return value
```

## Link Validation

### Relative Path Rules
- All relative paths should use `../../../` from `/docs/packages/[package]/README.md`
- Paths should point to actual existing files
- Line numbers should be verified for accuracy

### Link Testing
- Test all links in GitHub web interface
- Test VS Code links in local development
- Validate relative paths work from documentation location

## Automated Generation

### Code Scanning
Automatically identify key code elements:

1. **Main Entry Points**: `src/index.ts` exports
2. **Classes**: Class definitions and their methods
3. **Functions**: Exported functions and their locations
4. **Interfaces**: TypeScript interfaces and types
5. **Constants**: Important constants and configurations

### Template Variables
Use these variables in automated generation:

- `{{package-name}}` - Package name
- `{{main-entry}}` - Main entry file path
- `{{core-files}}` - List of core source files
- `{{classes}}` - List of classes with locations
- `{{functions}}` - List of functions with locations
- `{{github-url}}` - GitHub repository URL
- `{{vscode-path}}` - VS Code compatible path

## Examples

### Complete Package Documentation Example
```markdown
# @promethean-os/example-package

## Overview
Brief description of the package...

## 📁 Implementation

### Core Files
- **Main Entry**: [`src/index.ts`](../../../packages/example-package/src/index.ts)
- **Core Logic**: [`src/core.ts`](../../../packages/example-package/src/core.ts)
- **Types**: [`src/types.ts`](../../../packages/example-package/src/types.ts)

### Key Classes & Functions
- **ExampleClass**: [`ExampleClass`](../../../packages/example-package/src/core.ts#L12) - Main functionality
- **processData()**: [`processData()`](../../../packages/example-package/src/core.ts#L45) - Data processing
- **validateInput()**: [`validateInput()`](../../../packages/example-package/src/utils.ts#L8) - Input validation

### View Source
- **GitHub**: [View on GitHub](https://github.com/promethean-ai/promethean/tree/main/packages/example-package/src)
- **VS Code**: [Open in VS Code](vscode://file/packages/example-package/src)

## 📚 API Reference

### Classes

#### ExampleClass
**Location**: [`src/core.ts`](../../../packages/example-package/src/core.ts#L12)

**Description**: Main class for example package functionality.

**Methods**:
- [`constructor(options)`](../../../packages/example-package/src/core.ts#L15) - Initialize with options
- [`processData(data)`](../../../packages/example-package/src/core.ts#L25) - Process input data
- [`getResult()`](../../../packages/example-package/src/core.ts#L40) - Get processing result

### Functions

#### utilityFunction()
**Location**: [`src/utils.ts`](../../../packages/example-package/src/utils.ts#L8)

**Description**: Utility function for common operations.

**Parameters**:
- `input` - Input data to process
- `options` - Configuration options

**Returns**: Processed result

## Usage
```typescript
import { ExampleClass } from '@promethean-os/example-package';

const example = new ExampleClass({ option: 'value' });
const result = example.processData(data);
```
```

## Best Practices

1. **Consistency**: Use the same patterns across all packages
2. **Accuracy**: Verify all line numbers and paths are correct
3. **Accessibility**: Ensure links work in different environments
4. **Maintenance**: Update links when code changes
5. **Documentation**: Keep documentation and code in sync

## Tools and Utilities

### Link Validation Script
Create a script to validate all documentation links:

```bash
# Validate all code links in documentation
pnpm validate-doc-links
```

### Automatic Link Generation
Create a script to generate code links automatically:

```bash
# Generate code links for a package
pnpm generate-code-links @promethean-os/package-name
```

### Link Update Script
Create a script to update links when code changes:

```bash
# Update links after code changes
pnpm update-doc-links
```

---

*This document should be updated as new linking patterns are established or existing patterns are improved.*