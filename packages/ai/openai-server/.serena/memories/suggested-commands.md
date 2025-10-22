# Essential Commands for @promethean/openai-server Development

## Build & Development
```bash
# Build the project
pnpm run build

# Clean build artifacts
pnpm run clean

# Type checking only
pnpm run typecheck

# Run linting
pnpm run lint

# Run all tests
pnpm run test
```

## Package-Specific Commands
```bash
# Execute commands in this package context
pnpm --filter @promethean/openai-server <command>

# Example: Run tests for this package only
pnpm --filter @promethean/openai-server test

# Example: Build this package only
pnpm --filter @promethean/openai-server build
```

## Development Workflow
```bash
# 1. Make code changes
# 2. Type check
pnpm run typecheck

# 3. Lint code
pnpm run lint

# 4. Run tests
pnpm run test

# 5. Build to ensure everything compiles
pnpm run build
```

## Testing Commands
```bash
# Run specific test file
pnpm exec ava src/tests/specific-test.test.ts

# Run tests with watch mode
pnpm exec ava --watch

# Run tests with coverage
pnpm exec ava --coverage
```

## Security Implementation Commands
```bash
# After implementing security features:
pnpm run typecheck  # Ensure new types are correct
pnpm run lint       # Check code style
pnpm run test       # Verify security tests pass
pnpm run build      # Ensure everything compiles
```

## Git Commands
```bash
# Check git status
git status

# Add changes
git add .

# Commit with conventional message
git commit -m "feat: implement authentication middleware"

# Push changes
git push
```

## File System Commands
```bash
# List directory structure
find src -type f -name "*.ts" | sort

# Search for specific patterns
grep -r "pattern" src/

# Check file sizes
du -sh src/
```