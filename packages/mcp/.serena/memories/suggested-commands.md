# Essential Commands for MCP Package Development

## Development Workflow
```bash
# Install dependencies
pnpm install

# Build the project
pnpm build

# Run tests
pnpm test

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Development server
pnpm dev

# Proxy server
pnpm proxy
```

## Testing Commands
```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm coverage

# Run specific test file
pnpm test src/tests/oauth-security.test.ts

# Run compiled tests
pnpm test-compiled
```

## Build Commands
```bash
# Clean build artifacts
pnpm clean

# Build TypeScript
pnpm build

# Type check only
pnpm typecheck
```

## Environment Setup
```bash
# Copy environment template
cp ../../.env.example .env.local

# Edit environment variables
nano .env.local
```

## Required Environment Variables for OAuth
```bash
# GitHub OAuth (required for ChatGPT integration)
MCP_OAUTH_GITHUB_CLIENT_ID=your_github_client_id
MCP_OAUTH_GITHUB_CLIENT_SECRET=your_github_client_secret

# JWT Configuration
MCP_OAUTH_JWT_SECRET=your_very_long_and_secure_jwt_secret_at_least_32_chars

# OAuth Configuration
MCP_OAUTH_REDIRECT_URI=http://localhost:3210/auth/oauth/callback
```

## Git Commands
```bash
# Check status
git status

# Add changes
git add .

# Commit (auto-handled by system)
# Manual commit for reference:
git commit -m "fix: implement OAuth security improvements"

# Push changes
git push
```

## Debugging Commands
```bash
# Run with debug logging
DEBUG=* pnpm dev

# Run specific test with debugging
DEBUG=oauth* pnpm test src/tests/oauth-security.test.ts
```