# Suggested Commands for @promethean/opencode-client Development

## Essential Development Commands

### Build and Compilation
```bash
# Build the project
pnpm build

# Development mode with watch
pnpm dev

# Type checking only
npx tsc --noEmit
```

### Testing Commands
```bash
# Run all tests
pnpm test

# Run unit tests only
pnpm test:unit

# Run tests with coverage
pnpm test:coverage

# Watch mode for development
pnpm test:watch

# Run specific test file
pnpm test src/tests/unified-agent-manager.test.ts
```

### Code Quality
```bash
# Run ESLint (if configured)
pnpm eslint

# Run ESLint on specific file
npx eslint src/api/AgentTaskManager.ts

# Fix ESLint issues automatically
npx eslint --fix src/api/AgentTaskManager.ts

# Type checking with detailed errors
npx tsc --noEmit --strict
```

### CLI Testing
```bash
# Test the CLI help
pnpm start -- --help

# Test specific CLI commands
pnpm start -- ollama models
pnpm start -- sessions list
```

### Package Management
```bash
# Install dependencies
pnpm install

# Add new dependency
pnpm add <package-name>

# Add dev dependency
pnpm add -D <package-name>

# Update dependencies
pnpm update
```

### Development Utilities
```bash
# Check TypeScript compilation status
npx tsc --noEmit

# Check for unused imports
npx ts-unused-exports tsconfig.json

# Generate documentation (if configured)
pnpm docs:generate

# Clean build artifacts
pnpm run clean (if available)
rm -rf dist/
```

### Debug Commands
```bash
# Build with verbose output
pnpm build --verbose

# Run tests with debug output
DEBUG=* pnpm test

# Check environment variables
env | grep OPENCODE

# Test specific functionality
node -e "import('./dist/index.js').then(m => console.log(m))"
```

### Git and Version Control
```bash
# Check git status
git status

# Add changes to staging
git add .

# Commit with conventional message
git commit -m "fix: resolve type safety issues in AgentTaskManager"

# Push changes
git push

# Check current branch
git branch --show-current
```

### File System Operations
```bash
# List project structure
find src -type f -name "*.ts" | head -20

# Search for specific patterns
grep -r "DualStoreManager" src/

# Check file sizes
du -sh src/

# Find recently modified files
find src -name "*.ts" -mtime -1
```

### Integration Testing
```bash
# Test with local dependencies
pnpm --filter @promethean/opencode-client test

# Test integration with other packages
pnpm --filter @promethean/persistence build
pnpm --filter @promethean/ollama-queue build
pnpm test

# End-to-end testing
pnpm test:e2e (if available)
```

### Performance Analysis
```bash
# Build performance
time pnpm build

# Bundle analysis (if configured)
pnpm analyze

# Memory usage during tests
node --inspect-brk node_modules/.bin/ava src/tests/**/*.test.ts
```

## Troubleshooting Commands

### TypeScript Issues
```bash
# Check TypeScript version
npx tsc --version

# Verify tsconfig.json
npx tsc --showConfig

# Check for circular dependencies
npx madge --circular src/
```

### Dependency Issues
```bash
# Check for outdated dependencies
pnpm outdated

# Audit dependencies
pnpm audit

# Clean node_modules and reinstall
rm -rf node_modules package-lock.json
pnpm install
```

### Runtime Issues
```bash
# Check Node.js version
node --version

# Check pnpm version
pnpm --version

# Test environment setup
node -e "console.log('Node.js is working')"
```

## Workflow Commands

### Before Starting Work
```bash
# Pull latest changes
git pull origin main

# Install dependencies
pnpm install

# Build project
pnpm build

# Run tests to ensure clean state
pnpm test
```

### During Development
```bash
# Start development mode
pnpm dev

# In another terminal, run tests
pnpm test:watch

# Check types frequently
npx tsc --noEmit
```

### Before Committing
```bash
# Build project
pnpm build

# Run all tests
pnpm test

# Run linting
pnpm eslint

# Check for any issues
git status
```

### After Major Changes
```bash
# Full test suite
pnpm test:coverage

# Integration tests
pnpm test:integration (if available)

# Performance tests
pnpm test:performance (if available)
```