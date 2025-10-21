# Promethean MCP Package Overview

## Purpose
The @promethean/mcp package provides Model Context Protocol (MCP) server implementations with OAuth authentication, GitHub integration, and various AI tooling capabilities.

## Tech Stack
- **Language**: TypeScript
- **Runtime**: Node.js
- **Framework**: Fastify for HTTP server
- **Authentication**: OAuth 2.1 + PKCE with GitHub and Google providers
- **Database**: MongoDB for user registry (optional)
- **Testing**: AVA test framework
- **Build**: TypeScript compiler

## Code Style & Conventions
- Functional programming approach
- Immutable data structures where possible
- Comprehensive TypeScript typing
- Factory pattern for component creation
- Dependency injection
- Small, focused functions and files
- Clean code principles
- Test-driven development

## Key Commands
- `pnpm build` - Compile TypeScript to JavaScript
- `pnpm test` - Run tests after building
- `pnpm typecheck` - Type checking without emitting files
- `pnpm lint` - ESLint code linting
- `pnpm dev` - Run development server
- `pnpm proxy` - Run proxy server

## Project Structure
```
src/
├── auth/                 # Authentication & OAuth system
│   ├── oauth/           # OAuth 2.1 + PKCE implementation
│   ├── users/           # User registry and management
│   └── config.ts        # Configuration loading
├── core/                # Core MCP server functionality
├── github/              # GitHub-specific integrations
├── tools/               # MCP tool implementations
├── security/            # Security middleware
└── tests/               # Test suites
```

## Critical Security Issues Identified
1. **Hardcoded OAuth credentials** in simple-routes.ts and direct-oauth-fix.js
2. **Improper environment variable loading** for OAuth configuration
3. **Token exchange failures** in ChatGPT OAuth callback
4. **Global state storage vulnerabilities**
5. **Duplicate OAuth implementations** causing conflicts

## Environment Variables Required
- `MCP_OAUTH_GITHUB_CLIENT_ID` - GitHub OAuth client ID
- `MCP_OAUTH_GITHUB_CLIENT_SECRET` - GitHub OAuth client secret
- `MCP_OAUTH_JWT_SECRET` - JWT signing secret (min 32 chars)
- `MCP_OAUTH_REDIRECT_URI` - OAuth callback URL

## Development Guidelines
- Use environment variables for all secrets
- Implement proper error handling and logging
- Follow OAuth 2.1 + PKCE security best practices
- Maintain backward compatibility where possible
- Add comprehensive TypeScript types
- Include proper input validation