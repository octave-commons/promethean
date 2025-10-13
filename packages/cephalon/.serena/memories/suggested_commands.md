# Cephalon Development Commands

## Core Development Commands
```bash
# Build the project
pnpm build

# Start in development mode (TypeScript execution)
pnpm start:dev

# Start in production mode (compiled JavaScript)
pnpm start

# Run tests
pnpm test

# Run tests with coverage
pnpm coverage

# Type checking without compilation
pnpm build:check

# Lint code (ESLint)
pnpm lint

# Format code (Prettier)
pnpm format

# Deploy to production
pnpm deploy
```

## Environment Setup
```bash
# Required environment variables
DISCORD_TOKEN=your_discord_bot_token
DISCORD_CLIENT_USER_ID=your_bot_application_id
BROKER_URL=ws://localhost:7000
BROKER_WS_URL=ws://localhost:7000

# Optional environment variables
ENSO_WS_URL=ws://localhost:7770
ENSO_CHAT_ROOM=duck:chat
ENSO_CHAT_ENABLE=1
DUCK_PRIVACY_PROFILE=pseudonymous
DESKTOP_CAPTURE_CHANNEL_ID=your_channel_id
VISION_HOST=http://localhost:8080/vision
NO_SCREENSHOT=1
DISABLE_AUDIO=1
DISABLE_BROKER=1
CEPHALON_MODE=ecs|classic
```

## Testing Commands
```bash
# Run specific test file
pnpm test src/tests/bot.test.ts

# Run tests with network tests disabled
SKIP_NETWORK_TESTS=1 pnpm test

# Run security-focused tests
pnpm test src/tests/security-integration.test.ts
pnpm test src/tests/llm-prompt-injection.test.ts
```

## Development Workflow
```bash
# 1. Make changes to source code
# 2. Run type checking
pnpm build:check

# 3. Run linting
pnpm lint

# 4. Run tests
pnpm test

# 5. Format code
pnpm format

# 6. Build for production
pnpm build
```

## Debugging
```bash
# Start with debug logging
DEBUG=* pnpm start:dev

# Run specific test in verbose mode
npx ava src/tests/bot.test.ts --verbose

# Check TypeScript compilation
tsc --noEmit --incremental false
```

## System Utilities
```bash
# Git operations
git status
git add .
git commit -m "feat: add new feature"
git push

# File operations
ls -la src/
find src/ -name "*.ts" | head -10
grep -r "TODO" src/

# Process management
ps aux | grep node
kill -9 <process_id>
```