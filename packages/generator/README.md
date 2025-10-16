# @promethean/generator

Package generator for the Promethean Framework. Eliminates boilerplate duplication and ensures consistent package structure across the monorepo.

## Features

- 🚀 **Interactive CLI** - Guided package creation with prompts
- 📦 **Multiple Package Types** - Support for different package architectures
- 🎯 **Template System** - Handlebars-based templates with variable substitution
- ✅ **Validation** - Built-in validation for generated packages
- 🔧 **Configurable** - Customizable templates and settings

## Package Types

### TypeScript Library (`typescript-library`)

Standard TypeScript library package with:

- ES modules + CommonJS exports
- TypeScript configuration
- AVA testing setup
- ESLint + Prettier
- Nx integration

### Frontend Package (`frontend-package`)

Frontend package with React/ClojureScript support:

- React + TypeScript
- Shadow-CLJS configuration
- Concurrent development mode
- Frontend-specific dependencies

### CLI Package (`cli-package`)

Command-line interface package:

- Commander.js integration
- CLI-specific structure
- Binary executable setup
- Colored output support

### JavaScript Package (`javascript-package`)

Simple JavaScript package:

- Minimal configuration
- Basic testing setup
- Lightweight dependencies

### Manager Package (`manager-package`)

Complex package with adapters:

- Adapter pattern architecture
- CLI interface
- Configuration management
- Sync engine structure

## Installation

```bash
pnpm add -D @promethean/generator
```

## Usage

### Interactive Mode

```bash
npx pkg-gen create my-package --interactive
```

### Direct Mode

```bash
npx pkg-gen create my-package -t typescript-library -d "My awesome package"
```

### List Available Types

```bash
npx pkg-gen list
```

## CLI Options

```bash
pkg-gen create [name] [options]

Options:
  -t, --type <type>        Package type
  -d, --description <desc> Package description
  --interactive           Interactive mode
  -h, --help             Display help
```

## Template Variables

Templates support these Handlebars variables:

- `{{name}}` - Package name
- `{{description}}` - Package description
- `{{author}}` - Package author
- `{{license}}` - Package license
- `{{repository}}` - Repository URL
- `{{keywords}}` - Package keywords array
- `{{kebabCase name}}` - kebab-case version of name
- `{{camelCase name}}` - camelCase version of name
- `{{pascalCase name}}` - PascalCase version of name
- `{{year}}` - Current year
- `{{date}}` - Current date (YYYY-MM-DD)
- `{{timestamp}}` - ISO timestamp

## Configuration

Create a `.pkg-gen.json` file in your project root:

```json
{
  "templatesDir": "./templates",
  "outputDir": "./packages",
  "defaultAuthor": "Your Name",
  "defaultLicense": "MIT",
  "defaultRepository": "https://github.com/your-org/your-repo"
}
```

## Custom Templates

You can create custom templates by adding them to the templates directory:

```
templates/
├── my-custom-type/
│   ├── package.json.hbs
│   ├── tsconfig.json.hbs
│   └── src/
│       └── index.ts.hbs
```

## API Usage

```typescript
import { PackageGenerator } from '@promethean/generator';

const generator = new PackageGenerator({
  templatesDir: './templates',
  outputDir: './packages',
  defaultAuthor: 'Your Name',
  defaultLicense: 'MIT',
  defaultRepository: 'https://github.com/your-org/your-repo',
});

await generator.generatePackage({
  name: 'my-package',
  type: 'typescript-library',
  description: 'My awesome package',
});
```

## Validation

The generator includes built-in validation:

```typescript
import { PackageValidator } from '@promethean/generator';

const validator = new PackageValidator(config);
const result = await validator.validateGeneratedPackage('my-package');

if (!result.valid) {
  console.error('Validation errors:', result.errors);
}
```

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Test
pnpm test

# Lint
pnpm lint

# Format
pnpm format
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT
