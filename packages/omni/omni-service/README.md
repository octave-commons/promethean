# @promethean/omni-service

Unified service host for REST, GraphQL, WebSocket, and MCP adapters with shared authentication and context management.

## 🚀 Features

- **Multi-Protocol Support**: REST, GraphQL, WebSocket, and Model Context Protocol (MCP)
- **Shared Authentication**: JWT-based auth with role-based access control (RBAC)
- **Unified Configuration**: Environment-based configuration with validation
- **Health Monitoring**: Built-in health checks and monitoring endpoints
- **API Documentation**: Auto-generated Swagger/OpenAPI documentation
- **Rate Limiting**: Configurable rate limiting and CORS support
- **Graceful Shutdown**: Clean shutdown handling with proper resource cleanup
- **TypeScript**: Full TypeScript support with type safety

## 📦 Installation

```bash
pnpm add @promethean/omni-service
```

## 🔧 Quick Start

### Development Mode

```bash
pnpm --filter @promethean/omni-service start:dev
```

### Production Mode

```bash
pnpm --filter @promethean/omni-service build
pnpm --filter @promethean/omni-service start
```

## ⚙️ Configuration

The service uses environment variables for configuration. See `examples/.env.example` for all available options.

### Basic Configuration

```bash
# Server Configuration
PORT=3000
HOST=0.0.0.0
NODE_ENV=development
LOG_LEVEL=info

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES=1h
```

### Adapter Configuration

```bash
# REST API
REST_ADAPTER_ENABLED=true
REST_ADAPTER_PREFIX=/api
REST_ADAPTER_VERSION=v1

# GraphQL
GRAPHQL_ADAPTER_ENABLED=true
GRAPHQL_ENDPOINT=/graphql
GRAPHQL_PLAYGROUND=true

# WebSocket
WEBSOCKET_ADAPTER_ENABLED=true
WEBSOCKET_PATH=/ws

# MCP (Model Context Protocol)
MCP_ADAPTER_ENABLED=true
MCP_ADAPTER_PREFIX=/mcp
```

## 📚 API Endpoints

| Endpoint | Description | Method |
|----------|-------------|--------|
| `/` | Service information | GET |
| `/health` | Health check | GET |
| `/docs` | Swagger documentation | GET |
| `/graphql` | GraphQL endpoint | POST |
| `/api/v1/*` | REST API | varies |
| `/ws` | WebSocket connection | WS |
| `/mcp/*` | MCP endpoints | POST |

## 🔐 Authentication

The service supports JWT-based authentication with role-based access control:

### Default Roles

- **admin**: Full access to all endpoints
- **user**: Limited access to specified resources
- **readonly**: Read-only access to most endpoints

### Usage

```typescript
// Include JWT token in Authorization header
const headers = {
  'Authorization': 'Bearer <jwt-token>'
};
```

## 🧪 Testing

```bash
# Run all tests
pnpm --filter @promethean/omni-service test

# Run tests in watch mode
pnpm --filter @promethean/omni-service test:watch

# Run with coverage
pnpm --filter @promethean/omni-service coverage
```

## 🔧 Development

### Project Structure

```
packages/omni-service/
├── src/
│   ├── app.ts          # Fastify app factory
│   ├── config.ts       # Configuration management
│   ├── index.ts        # Main entrypoint
│   └── tests/          # Test files
├── examples/
│   └── .env.example    # Environment variables example
├── static/             # Static files to serve
├── dist/               # Compiled JavaScript
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
└── README.md           # This file
```

### Scripts

| Script | Description |
|--------|-------------|
| `build` | Compile TypeScript to JavaScript |
| `start` | Start the production server |
| `start:dev` | Start in development mode with hot reload |
| `test` | Run all tests |
| `test:watch` | Run tests in watch mode |
| `lint` | Run ESLint |
| `format` | Format code with Prettier |
| `clean` | Clean build artifacts |
| `typecheck` | Type check without compilation |

## 🔗 Dependencies

- **Fastify**: Fast and low-overhead web framework
- **@promethean/omni-protocol**: Shared protocol definitions
- **@promethean/security**: Security utilities and JWT handling
- **@promethean/legacy**: Legacy utilities and helpers
- **JWT**: JSON Web Token implementation
- **Zod**: Runtime type validation and schema parsing

## 📝 Architecture

The Omni Service follows a modular architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    Omni Service Host                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │ REST Adapter │  │ GraphQL API │  │ WebSocket  │  │ MCP     │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘ │
├─────────────────────────────────────────────────────────────┤
│                    Shared Layer                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │ Authentication │  │ Rate Limiting│  │ CORS        │  │ Logging │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘ │
├─────────────────────────────────────────────────────────────┤
│                    Fastify Core                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │   Routes     │  │ Middleware  │  │ Plugins     │  │  Hooks  │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Roadmap

- [ ] **Authentication & RBAC** - Complete JWT-based auth system
- [ ] **REST Adapter** - Full REST API implementation
- [ ] **GraphQL Adapter** - GraphQL server with schema stitching
- [ ] **WebSocket Adapter** - Real-time communication support
- [ ] **MCP Adapter** - Model Context Protocol implementation
- [ ] **Monitoring** - Enhanced metrics and observability
- [ ] **Caching** - Response caching and performance optimization

## 📄 License

GPL-3.0

## 🤝 Contributing

Please follow the Promethean contributing guidelines when submitting pull requests.

---

**Part of the Promethean Framework** - Unified Agent Architecture