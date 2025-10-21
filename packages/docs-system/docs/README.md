# Promethean Documentation System

A comprehensive fullstack documentation management system built with TypeScript, React, and Node.js, designed to provide intelligent document organization, querying, and AI-powered analysis capabilities.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- MongoDB 5.0+
- Ollama (for AI features)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd promethean/packages/docs-system

# Install dependencies
pnpm install

# Start development environment
pnpm dev

# Or use Docker for complete setup
docker-compose up -d
```

### Configuration

Create a `.env` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/docs-system
MONGODB_DB_NAME=promethean_docs

# Server
PORT=3001
NODE_ENV=development

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Ollama Integration
OLLAMA_BASE_URL=http://localhost:11434

# CORS
FRONTEND_URL=http://localhost:3000
```

## 🏗️ Architecture Overview

The Promethean Documentation System follows a modern fullstack architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (React)       │◄──►│   (Express)     │◄──►│   (MongoDB)     │
│                 │    │                 │    │                 │
│ • Dashboard     │    │ • REST API      │    │ • Users         │
│ • Document UI   │    │ • Auth          │    │ • Documents     │
│ • Query Builder │    │ • WebSocket     │    │ • Metadata      │
│ • Settings      │    │ • Ollama Proxy  │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Ollama AI     │
                    │   Integration   │
                    │                 │
                    │ • Chat API      │
                    │ • Embeddings    │
                    │ • Generation    │
                    └─────────────────┘
```

## 📁 Project Structure

```
packages/docs-system/
├── src/
│   ├── server/                 # Backend application
│   │   ├── routes/            # API route handlers
│   │   │   ├── auth.ts        # Authentication endpoints
│   │   │   ├── documents.ts   # Document management
│   │   │   ├── queries.ts     # Query operations
│   │   │   ├── ollama.ts      # AI integration
│   │   │   └── users.ts       # User management
│   │   ├── middleware/        # Express middleware
│   │   ├── models/           # Database models
│   │   ├── utils/            # Utility functions
│   │   └── server.ts         # Server entry point
│   ├── frontend/              # React frontend
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API service layer
│   │   ├── types/           # Frontend type definitions
│   │   └── App.tsx          # Main application
│   └── types/               # Shared TypeScript types
├── docs/                    # Documentation (this directory)
├── docker-compose.yml       # Development environment
├── Dockerfile              # Production container
└── package.json            # Dependencies and scripts
```

## 🎯 Core Features

### 📚 Document Management

- **Smart Organization**: Automatic categorization and tagging
- **Version Control**: Track document changes and history
- **Search & Filter**: Advanced full-text search capabilities
- **Metadata Management**: Rich metadata extraction and storage

### 🤖 AI-Powered Features

- **Intelligent Querying**: Natural language document queries
- **Content Analysis**: Automated document summarization
- **Smart Recommendations**: AI-powered content suggestions
- **Chat Interface**: Interactive document exploration

### 👥 User Management

- **Secure Authentication**: JWT-based authentication system
- **Role-Based Access**: Granular permission control
- **User Profiles**: Personalized experience and preferences
- **Activity Tracking**: Comprehensive audit logs

### 🔄 Real-Time Updates

- **Live Sync**: Real-time document updates across clients
- **Collaborative Editing**: Multi-user document editing
- **Notifications**: Instant updates for relevant changes
- **Status Indicators**: Live system status monitoring

## 🛠️ Development Workflow

### Local Development

```bash
# Start backend server
pnpm dev:server

# Start frontend development server
pnpm dev:frontend

# Start both concurrently
pnpm dev

# Run tests
pnpm test

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Build for production
pnpm build
```

### Docker Development

```bash
# Start complete development stack
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild with changes
docker-compose up --build
```

## 📚 Documentation

- **[API Reference](./api/README.md)** - Complete API documentation
- **[Developer Guide](./guides/developer-guide.md)** - Development setup and workflows
- **[Architecture](./architecture/README.md)** - System design and architecture
- **[Deployment Guide](./deployment/README.md)** - Production deployment instructions
- **[User Guide](./user-guide/README.md)** - End-user documentation
- **[Troubleshooting](./troubleshooting/README.md)** - Common issues and solutions

## 🔧 Configuration

### Environment Variables

| Variable          | Description               | Default                                 | Required |
| ----------------- | ------------------------- | --------------------------------------- | -------- |
| `MONGODB_URI`     | MongoDB connection string | `mongodb://localhost:27017/docs-system` | Yes      |
| `MONGODB_DB_NAME` | Database name             | `promethean_docs`                       | No       |
| `PORT`            | Server port               | `3001`                                  | No       |
| `NODE_ENV`        | Environment               | `development`                           | No       |
| `JWT_SECRET`      | JWT signing secret        | -                                       | Yes      |
| `JWT_EXPIRES_IN`  | JWT expiration            | `7d`                                    | No       |
| `OLLAMA_BASE_URL` | Ollama API URL            | `http://localhost:11434`                | No       |
| `FRONTEND_URL`    | Frontend origin           | `http://localhost:3000`                 | No       |

### Database Setup

```javascript
// MongoDB collections
users: {
  _id: ObjectId,
  username: String,
  email: String,
  password: String, // hashed
  role: String,
  createdAt: Date,
  updatedAt: Date
}

documents: {
  _id: ObjectId,
  title: String,
  content: String,
  metadata: Object,
  tags: [String],
  authorId: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Deployment

### Production Build

```bash
# Build application
pnpm build

# Start production server
pnpm start

# Or use Docker
docker build -t promethean-docs-system .
docker run -p 3001:3001 promethean-docs-system
```

### Docker Compose Production

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - '3001:3001'
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/docs-system
    depends_on:
      - mongo

  mongo:
    image: mongo:5.0
    volumes:
      - mongo_data:/data/db
    ports:
      - '27017:27017'

volumes:
  mongo_data:
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test auth.test.ts

# Watch mode
pnpm test:watch
```

## 📊 Monitoring & Logging

### Application Metrics

- Request/response times
- Error rates and types
- Database query performance
- Memory and CPU usage

### Logging

- Structured JSON logging
- Multiple log levels (error, warn, info, debug)
- Request tracing and correlation IDs
- Security event logging

## 🔒 Security

### Authentication & Authorization

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Session management

### API Security

- Rate limiting
- CORS configuration
- Input validation and sanitization
- SQL injection prevention
- XSS protection

### Data Protection

- Encryption at rest (MongoDB)
- HTTPS enforcement in production
- Secure cookie handling
- Environment variable protection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation for API changes
- Use conventional commit messages
- Ensure code passes linting and type checking

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE.txt) file for details.

## 🆘 Support

- **Documentation**: [docs/](./)
- **Issues**: [GitHub Issues](https://github.com/your-org/promethean/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/promethean/discussions)
- **Email**: support@promethean.dev

## 🗺️ Roadmap

### v1.0.0 (Current)

- ✅ Basic document management
- ✅ User authentication
- ✅ AI integration via Ollama
- ✅ Real-time updates

### v1.1.0 (Planned)

- 🔄 Advanced search with embeddings
- 🔄 Document collaboration features
- 🔄 Advanced analytics dashboard
- 🔄 Mobile responsive design

### v2.0.0 (Future)

- 📋 Multi-tenant support
- 📋 Plugin system
- 📋 Advanced workflow automation
- 📋 GraphQL API

---

**Built with ❤️ by the Promethean team**
