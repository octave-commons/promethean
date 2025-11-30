# Promethean Documentation System

A comprehensive fullstack documentation system for the Promethean Framework with asynchronous Ollama access, featuring AI-powered search, real-time updates, and modern web interface.

## 🚀 Features

### Core Functionality
- **Document Management**: Create, edit, and organize documentation with metadata
- **AI-Powered Search**: Advanced search with semantic understanding and filtering
- **Ollama Integration**: Asynchronous job queue for AI model processing
- **Real-time Updates**: WebSocket-powered live updates and notifications
- **User Management**: Authentication, authorization, and role-based access control

### Technical Features
- **TypeScript Fullstack**: End-to-end type safety
- **Modern React Frontend**: Ant Design components with React Query
- **Express.js Backend**: RESTful API with comprehensive middleware
- **MongoDB Integration**: Document storage with advanced indexing
- **WebSocket Support**: Real-time communication via Socket.IO
- **Docker Ready**: Containerized deployment with docker-compose

## 📋 Prerequisites

- Node.js 22+ (managed via Volta)
- pnpm 9.0.0+
- MongoDB 7.0+
- Ollama (for AI features)
- Docker & Docker Compose (optional, for containerized deployment)

## 🛠️ Installation

### Local Development

1. **Clone and navigate to the package**:
   ```bash
   cd packages/docs-system
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB and Ollama**:
   ```bash
   # Using Docker Compose (recommended)
   docker-compose up -d mongodb ollama
   
   # Or start services manually
   mongod
   ollama serve
   ollama pull llama2  # Pull default model
   ```

5. **Build and run the application**:
   ```bash
   # Build TypeScript
   pnpm run build
   
   # Start development server
   pnpm run dev:server
   
   # In another terminal, start frontend (if using separate dev server)
   pnpm run dev:frontend
   ```

### Docker Deployment

1. **Using Docker Compose (full stack)**:
   ```bash
   docker-compose up -d
   ```

2. **Build and run container manually**:
   ```bash
   docker build -t promethean-docs-system .
   docker run -p 3001:3001 -p 3000:3000 promethean-docs-system
   ```

## 🌐 Access Points

Once running, access the application at:

- **Frontend**: http://localhost:3000
- **API Server**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api-docs
- **Health Check**: http://localhost:3001/health

## 📁 Project Structure

```
packages/docs-system/
├── src/
│   ├── server/              # Backend Express.js application
│   │   ├── database/        # MongoDB connection and models
│   │   ├── middleware/      # Express middleware (auth, rate limiting, etc.)
│   │   ├── routes/          # API route handlers
│   │   ├── websocket/       # Socket.IO WebSocket server
│   │   └── index.ts         # Server entry point
│   ├── frontend/            # React TypeScript application
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Page components
│   │   ├── styles/          # CSS and styling
│   │   ├── index.tsx        # React app entry point
│   │   └── App.tsx          # Main app component
│   ├── shared/              # Shared utilities and types
│   │   └── index.ts         # Common functions and helpers
│   └── types/               # TypeScript type definitions
│       └── index.ts         # Core system types
├── dist/                    # Compiled JavaScript output
├── docker-compose.yml       # Development environment
├── Dockerfile              # Production container
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Frontend build configuration
```

## 🔧 Configuration

### Environment Variables

Key configuration options in `.env`:

```bash
# Server
NODE_ENV=development
PORT=3001
HOST=localhost

# Database
DATABASE_URL=mongodb://localhost:27017
DATABASE_NAME=promethean_docs

# Ollama AI
OLLAMA_ENDPOINT=http://localhost:11434
OLLAMA_DEFAULT_MODEL=llama2

# Security
JWT_SECRET=your-secret-key
BCRYPT_ROUNDS=12

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
```

### System Settings

The application includes a comprehensive settings interface accessible via the web UI at `/settings`. Configure:

- **General**: Site name, description, language, timezone
- **Search**: Fuzzy search, semantic search, result limits
- **AI**: Ollama models, token limits, caching
- **Security**: Rate limiting, audit logging, session timeout
- **Performance**: Caching, compression, upload limits

## 🔌 API Documentation

### Authentication

All API endpoints (except `/health` and `/api-docs`) require JWT authentication:

```bash
# Login
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "password"
}

# Use token in subsequent requests
Authorization: Bearer <jwt-token>
```

### Key Endpoints

- **Documents**: `/api/v1/documents` - CRUD operations for documentation
- **Queries**: `/api/v1/queries` - AI-powered search and analysis
- **Ollama Jobs**: `/api/v1/ollama` - Manage AI processing jobs
- **Users**: `/api/v1/users` - User management and profiles

### WebSocket Events

Connect to WebSocket for real-time updates:

```javascript
const socket = io('ws://localhost:3001', {
  auth: { token: 'your-jwt-token' }
});

// Subscribe to job updates
socket.emit('subscribe:jobs');

// Listen for updates
socket.on('job:update', (data) => {
  console.log('Job updated:', data);
});
```

## 🧪 Development

### Available Scripts

```bash
# Build
pnpm run build              # Build TypeScript
pnpm run build:frontend     # Build frontend only

# Development
pnpm run dev                # Start both frontend and backend
pnpm run dev:server         # Start backend only
pnpm run dev:frontend       # Start frontend only

# Testing
pnpm run test               # Run tests
pnpm run test:watch         # Watch mode
pnpm run test:coverage      # With coverage

# Code Quality
pnpm run lint               # ESLint
pnpm run lint:fix           # Auto-fix linting
pnpm run typecheck          # TypeScript check

# Docker
pnpm run docker:build       # Build container
pnpm run docker:run         # Run container
```

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Configured for best practices
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks (if configured)

## 🚀 Deployment

### Production Deployment

1. **Environment Setup**:
   ```bash
   export NODE_ENV=production
   export JWT_SECRET=your-production-secret
   # Set other production variables
   ```

2. **Database Setup**:
   ```bash
   # Ensure MongoDB is running with proper security
   # Create indexes for performance
   ```

3. **Build and Deploy**:
   ```bash
   pnpm run build
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Monitoring

- **Health Checks**: `/health` endpoint
- **Logs**: Structured JSON logging
- **Metrics**: Built-in performance monitoring
- **Error Tracking**: Comprehensive error handling

## 🔒 Security

### Implemented Features

- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: Configurable request limits
- **Input Validation**: Zod schema validation
- **CORS Protection**: Configurable origin policies
- **Helmet.js**: Security headers
- **Password Hashing**: bcrypt with configurable rounds

### Best Practices

- Use HTTPS in production
- Rotate JWT secrets regularly
- Implement proper database security
- Monitor and audit access logs
- Keep dependencies updated

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is part of the Promethean Framework and is licensed under the GPL-3.0 license.

## 🆘 Support

- **Documentation**: Check this README and inline code documentation
- **API Docs**: Visit `/api-docs` when running
- **Issues**: Report via GitHub issues
- **Community**: Join the Promethean Framework community

## 🔮 Roadmap

- [ ] Advanced AI model management
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Plugin system for extensions
- [ ] Mobile app companion
- [ ] Advanced collaboration features
- [ ] Enterprise SSO integration
- [ ] Advanced search algorithms

<!-- READMEFLOW:BEGIN -->
# @promethean-os/docs-system

Comprehensive fullstack documentation system for Promethean Framework with asynchronous Ollama access

[TOC]


## Install

```bash
pnpm -w add -D @promethean-os/docs-system
```

## Quickstart

```ts
// usage example
```

## Commands

- `dev`
- `dev:backend`
- `dev:frontend`
- `build`
- `build:backend`
- `build:frontend`
- `start`
- `test`
- `test:watch`
- `test:coverage`
- `lint`
- `lint:fix`
- `typecheck`
- `clean`
- `docker:build`
- `docker:run`


### Package graph

### Pantheon dependency graph
See [Pantheon Graph Pattern](../pantheon/docs/graph-pattern.md) for the maintained dependency view.



## Promethean Packages (Remote READMEs)

- Back to [riatzukiza/promethean](https://github.com/riatzukiza/promethean#readme)

<!-- BEGIN: PROMETHEAN-PACKAGES-READMES -->
- [riatzukiza/agent-os-protocol](https://github.com/riatzukiza/agent-os-protocol#readme)
- [riatzukiza/ai-learning](https://github.com/riatzukiza/ai-learning#readme)
- [riatzukiza/apply-patch](https://github.com/riatzukiza/apply-patch#readme)
- [riatzukiza/auth-service](https://github.com/riatzukiza/auth-service#readme)
- [riatzukiza/autocommit](https://github.com/riatzukiza/autocommit#readme)
- [riatzukiza/build-monitoring](https://github.com/riatzukiza/build-monitoring#readme)
- [riatzukiza/cli](https://github.com/riatzukiza/cli#readme)
- [riatzukiza/clj-hacks-tools](https://github.com/riatzukiza/clj-hacks-tools#readme)
- [riatzukiza/compliance-monitor](https://github.com/riatzukiza/compliance-monitor#readme)
- [riatzukiza/dlq](https://github.com/riatzukiza/dlq#readme)
- [riatzukiza/ds](https://github.com/riatzukiza/ds#readme)
- [riatzukiza/eidolon-field](https://github.com/riatzukiza/eidolon-field#readme)
- [riatzukiza/enso-agent-communication](https://github.com/riatzukiza/enso-agent-communication#readme)
- [riatzukiza/http](https://github.com/riatzukiza/http#readme)
- [riatzukiza/kanban](https://github.com/riatzukiza/kanban#readme)
- [riatzukiza/logger](https://github.com/riatzukiza/logger#readme)
- [riatzukiza/math-utils](https://github.com/riatzukiza/math-utils#readme)
- [riatzukiza/mcp](https://github.com/riatzukiza/mcp#readme)
- [riatzukiza/mcp-dev-ui-frontend](https://github.com/riatzukiza/mcp-dev-ui-frontend#readme)
- [riatzukiza/migrations](https://github.com/riatzukiza/migrations#readme)
- [riatzukiza/naming](https://github.com/riatzukiza/naming#readme)
- [riatzukiza/obsidian-export](https://github.com/riatzukiza/obsidian-export#readme)
- [riatzukiza/omni-tools](https://github.com/riatzukiza/omni-tools#readme)
- [riatzukiza/opencode-hub](https://github.com/riatzukiza/opencode-hub#readme)
- [riatzukiza/persistence](https://github.com/riatzukiza/persistence#readme)
- [riatzukiza/platform](https://github.com/riatzukiza/platform#readme)
- [riatzukiza/plugin-hooks](https://github.com/riatzukiza/plugin-hooks#readme)
- [riatzukiza/report-forge](https://github.com/riatzukiza/report-forge#readme)
- [riatzukiza/security](https://github.com/riatzukiza/security#readme)
- [riatzukiza/shadow-conf](https://github.com/riatzukiza/shadow-conf#readme)
- [riatzukiza/snapshots](https://github.com/riatzukiza/snapshots#readme)
- [riatzukiza/test-classifier](https://github.com/riatzukiza/test-classifier#readme)
- [riatzukiza/test-utils](https://github.com/riatzukiza/test-utils#readme)
- [riatzukiza/utils](https://github.com/riatzukiza/utils#readme)
- [riatzukiza/worker](https://github.com/riatzukiza/worker#readme)
<!-- END: PROMETHEAN-PACKAGES-READMES -->


<!-- READMEFLOW:END -->
