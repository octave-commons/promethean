# Developer Guide

This guide provides comprehensive information for developers working on the Promethean Documentation System, including setup instructions, development workflows, and best practices.

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ (recommended: use [nvm](https://github.com/nvm-sh/nvm) for version management)
- **pnpm** 8+ (package manager)
- **Docker** & **Docker Compose** (for containerized development)
- **MongoDB** 5.0+ (local installation or via Docker)
- **Ollama** (for AI features)
- **Git** (version control)

### Environment Setup

1. **Clone the Repository**

   ```bash
   git clone <repository-url>
   cd promethean
   ```

2. **Install Dependencies**

   ```bash
   # Install root dependencies
   pnpm install

   # Install docs-system specific dependencies
   cd packages/docs-system
   pnpm install
   ```

3. **Environment Configuration**

   ```bash
   # Copy environment template
   cp .env.example .env

   # Edit environment variables
   nano .env
   ```

   **Required Environment Variables:**

   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/docs-system
   MONGODB_DB_NAME=promethean_docs

   # Server
   PORT=3001
   NODE_ENV=development

   # Authentication
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d

   # Ollama Integration
   OLLAMA_BASE_URL=http://localhost:11434

   # CORS
   FRONTEND_URL=http://localhost:3000
   ```

4. **Database Setup**

   ```bash
   # Option 1: Local MongoDB
   # Ensure MongoDB is running on localhost:27017

   # Option 2: Docker MongoDB
   docker run -d \
     --name promethean-mongo \
     -p 27017:27017 \
     -e MONGO_INITDB_ROOT_USERNAME=admin \
     -e MONGO_INITDB_ROOT_PASSWORD=password \
     mongo:5.0

   # Option 3: Use docker-compose
   docker-compose up -d mongo
   ```

5. **Ollama Setup**

   ```bash
   # Install Ollama (if not already installed)
   curl -fsSL https://ollama.ai/install.sh | sh

   # Start Ollama service
   ollama serve

   # Pull a model for testing
   ollama pull llama2
   ollama pull codellama
   ```

## 🛠️ Development Workflow

### Starting Development Servers

1. **Start Backend Server**

   ```bash
   cd packages/docs-system
   pnpm dev:server
   ```

   The backend will start on `http://localhost:3001`

2. **Start Frontend Development Server**

   ```bash
   # In a new terminal
   cd packages/docs-system
   pnpm dev:frontend
   ```

   The frontend will start on `http://localhost:3000`

3. **Start Both Concurrently**
   ```bash
   cd packages/docs-system
   pnpm dev
   ```

### Using Docker for Development

1. **Development Environment**

   ```bash
   cd packages/docs-system
   docker-compose up -d
   ```

   This starts:

   - Backend API server (port 3001)
   - Frontend development server (port 3000)
   - MongoDB database (port 27017)
   - Ollama service (port 11434)

2. **View Logs**

   ```bash
   docker-compose logs -f
   ```

3. **Stop Services**
   ```bash
   docker-compose down
   ```

### Code Quality Tools

1. **Type Checking**

   ```bash
   pnpm typecheck
   ```

2. **Linting**

   ```bash
   pnpm lint
   pnpm lint:fix
   ```

3. **Testing**

   ```bash
   # Run all tests
   pnpm test

   # Run tests with coverage
   pnpm test:coverage

   # Watch mode
   pnpm test:watch

   # Run specific test file
   pnpm test auth.test.ts
   ```

4. **Building**

   ```bash
   # Development build
   pnpm build:dev

   # Production build
   pnpm build

   # Build specific packages
   pnpm build:server
   pnpm build:frontend
   ```

## 🏗️ Project Structure

### Backend Architecture

```
src/server/
├── routes/           # API route handlers
│   ├── auth.ts      # Authentication endpoints
│   ├── documents.ts # Document management
│   ├── queries.ts   # Query operations
│   ├── ollama.ts    # AI integration
│   └── users.ts     # User management
├── middleware/       # Express middleware
│   ├── auth.ts      # Authentication middleware
│   ├── errorHandler.ts # Error handling
│   └── rateLimit.ts # Rate limiting
├── models/          # Database models
├── utils/           # Utility functions
├── websocket/       # WebSocket handlers
└── server.ts        # Server entry point
```

### Frontend Architecture

```
src/frontend/
├── components/      # Reusable UI components
│   ├── common/      # Generic components
│   ├── forms/       # Form components
│   └── layout/      # Layout components
├── pages/          # Page components
│   ├── Dashboard.tsx
│   ├── Documents.tsx
│   ├── Queries.tsx
│   ├── OllamaJobs.tsx
│   └── Settings.tsx
├── hooks/          # Custom React hooks
├── services/       # API service layer
├── types/          # Frontend type definitions
├── utils/          # Frontend utilities
└── App.tsx         # Main application
```

### Shared Types

```
src/types/
├── index.ts        # Main type definitions
├── api.ts          # API response types
├── auth.ts         # Authentication types
├── document.ts     # Document types
├── query.ts        # Query types
└── user.ts         # User types
```

## 🔧 Development Guidelines

### Code Style

We use ESLint and Prettier for consistent code formatting:

```bash
# Check linting
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code
pnpm format
```

**Key Style Rules:**

- Use TypeScript for all new code
- Follow functional programming principles
- Use immutable data structures
- Prefer explicit return types
- Use descriptive variable and function names

### Git Workflow

1. **Branch Naming**

   ```bash
   feature/add-document-search
   bugfix/fix-auth-validation
   refactor/improve-query-performance
   docs/update-api-documentation
   ```

2. **Commit Messages**

   ```bash
   # Format: type(scope): description
   feat(auth): add JWT refresh token support
   fix(documents): resolve pagination bug
   refactor(api): improve error handling
   docs(readme): update installation instructions
   ```

3. **Pull Request Process**
   - Create feature branch from `main`
   - Make changes with small, logical commits
   - Ensure all tests pass
   - Update documentation if needed
   - Submit PR with clear description
   - Request code review

### Testing Guidelines

1. **Unit Tests**

   ```typescript
   // Example: auth.test.ts
   import { describe, it, expect, beforeEach } from '@jest/globals';
   import { AuthService } from '../services/AuthService';

   describe('AuthService', () => {
     let authService: AuthService;

     beforeEach(() => {
       authService = new AuthService();
     });

     it('should generate valid JWT token', async () => {
       const user = { id: '123', email: 'test@example.com' };
       const token = await authService.generateToken(user);

       expect(token).toBeDefined();
       expect(typeof token).toBe('string');
     });
   });
   ```

2. **Integration Tests**

   ```typescript
   // Example: documents.integration.test.ts
   import request from 'supertest';
   import { app } from '../server';

   describe('Documents API', () => {
     it('should create a new document', async () => {
       const response = await request(app)
         .post('/api/documents')
         .set('Authorization', 'Bearer valid-token')
         .send({
           title: 'Test Document',
           content: 'Test content',
           tags: ['test'],
         });

       expect(response.status).toBe(201);
       expect(response.body.success).toBe(true);
     });
   });
   ```

3. **Frontend Tests**

   ```typescript
   // Example: DocumentList.test.tsx
   import { render, screen } from '@testing-library/react';
   import { DocumentList } from './DocumentList';

   describe('DocumentList', () => {
     it('should render documents correctly', () => {
       const documents = [
         { id: '1', title: 'Doc 1', content: 'Content 1' }
       ];

       render(<DocumentList documents={documents} />);

       expect(screen.getByText('Doc 1')).toBeInTheDocument();
     });
   });
   ```

## 🔄 API Development

### Creating New Endpoints

1. **Define Types**

   ```typescript
   // src/types/api.ts
   export interface CreateDocumentRequest {
     title: string;
     content: string;
     tags?: string[];
     metadata?: Record<string, any>;
   }

   export interface DocumentResponse {
     id: string;
     title: string;
     content: string;
     tags: string[];
     metadata: Record<string, any>;
     authorId: string;
     createdAt: Date;
     updatedAt: Date;
   }
   ```

2. **Create Route Handler**

   ```typescript
   // src/server/routes/documents.ts
   import { Router } from 'express';
   import { authenticateToken } from '../middleware/auth';
   import { DocumentService } from '../services/DocumentService';

   const router = Router();
   const documentService = new DocumentService();

   router.post('/', authenticateToken, async (req, res) => {
     try {
       const { title, content, tags, metadata } = req.body;
       const authorId = req.user.id;

       const document = await documentService.create({
         title,
         content,
         tags,
         metadata,
         authorId,
       });

       res.status(201).json({
         success: true,
         data: { document },
         message: 'Document created successfully',
       });
     } catch (error) {
       res.status(500).json({
         success: false,
         error: {
           code: 'INTERNAL_ERROR',
           message: error.message,
         },
       });
     }
   });

   export default router;
   ```

3. **Add Service Layer**

   ```typescript
   // src/server/services/DocumentService.ts
   import { Document } from '../models/Document';

   export class DocumentService {
     async create(data: CreateDocumentRequest): Promise<DocumentResponse> {
       const document = new Document(data);
       await document.save();
       return document.toObject();
     }

     async findById(id: string): Promise<DocumentResponse | null> {
       const document = await Document.findById(id);
       return document ? document.toObject() : null;
     }

     // ... other methods
   }
   ```

4. **Update Route Index**

   ```typescript
   // src/server/routes/index.ts
   import documentRoutes from './documents';

   router.use('/documents', documentRoutes);
   ```

### Error Handling

Use consistent error handling across all endpoints:

```typescript
// src/server/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    });
  }

  // Handle unexpected errors
  console.error('Unexpected error:', error);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    },
  });
};
```

## 🎨 Frontend Development

### Component Development

1. **Component Structure**

   ```typescript
   // src/frontend/components/DocumentCard.tsx
   import React from 'react';
   import { Card, Tag, Button } from 'antd';
   import { Document } from '../types/document';

   interface DocumentCardProps {
     document: Document;
     onEdit?: (document: Document) => void;
     onDelete?: (documentId: string) => void;
   }

   export const DocumentCard: React.FC<DocumentCardProps> = ({
     document,
     onEdit,
     onDelete
   }) => {
     return (
       <Card
         title={document.title}
         extra={
           <div className="flex gap-2">
             {onEdit && (
               <Button size="small" onClick={() => onEdit(document)}>
                 Edit
               </Button>
             )}
             {onDelete && (
               <Button
                 size="small"
                 danger
                 onClick={() => onDelete(document.id)}
               >
                 Delete
               </Button>
             )}
           </div>
         }
       >
         <p>{document.content.substring(0, 200)}...</p>
         <div className="flex gap-1 mt-2">
           {document.tags.map(tag => (
             <Tag key={tag}>{tag}</Tag>
           ))}
         </div>
       </Card>
     );
   };
   ```

2. **Custom Hooks**

   ```typescript
   // src/frontend/hooks/useDocuments.ts
   import { useState, useEffect } from 'react';
   import { Document } from '../types/document';
   import { documentService } from '../services/documentService';

   export const useDocuments = () => {
     const [documents, setDocuments] = useState<Document[]>([]);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState<string | null>(null);

     const fetchDocuments = async () => {
       setLoading(true);
       setError(null);

       try {
         const response = await documentService.getDocuments();
         setDocuments(response.data.documents);
       } catch (err) {
         setError(err.message);
       } finally {
         setLoading(false);
       }
     };

     useEffect(() => {
       fetchDocuments();
     }, []);

     return {
       documents,
       loading,
       error,
       refetch: fetchDocuments,
     };
   };
   ```

3. **API Service Layer**

   ```typescript
   // src/frontend/services/documentService.ts
   import { apiClient } from './apiClient';
   import { Document, CreateDocumentRequest } from '../types/document';

   export const documentService = {
     async getDocuments(params?: { page?: number; limit?: number; search?: string }) {
       const response = await apiClient.get('/documents', { params });
       return response.data;
     },

     async getDocument(id: string) {
       const response = await apiClient.get(`/documents/${id}`);
       return response.data;
     },

     async createDocument(data: CreateDocumentRequest) {
       const response = await apiClient.post('/documents', data);
       return response.data;
     },

     async updateDocument(id: string, data: Partial<CreateDocumentRequest>) {
       const response = await apiClient.put(`/documents/${id}`, data);
       return response.data;
     },

     async deleteDocument(id: string) {
       const response = await apiClient.delete(`/documents/${id}`);
       return response.data;
     },
   };
   ```

## 🗄️ Database Development

### MongoDB Models

1. **User Model**

   ```typescript
   // src/server/models/User.ts
   import mongoose, { Schema, Document as MongoDocument } from 'mongoose';
   import bcrypt from 'bcryptjs';

   export interface IUser extends MongoDocument {
     username: string;
     email: string;
     password: string;
     role: 'user' | 'admin';
     profile?: {
       firstName?: string;
       lastName?: string;
       bio?: string;
       avatar?: string;
     };
     createdAt: Date;
     updatedAt: Date;
     comparePassword(candidatePassword: string): Promise<boolean>;
   }

   const UserSchema = new Schema<IUser>(
     {
       username: { type: String, required: true, unique: true },
       email: { type: String, required: true, unique: true },
       password: { type: String, required: true },
       role: { type: String, enum: ['user', 'admin'], default: 'user' },
       profile: {
         firstName: String,
         lastName: String,
         bio: String,
         avatar: String,
       },
     },
     {
       timestamps: true,
     },
   );

   // Password hashing middleware
   UserSchema.pre('save', async function (next) {
     if (!this.isModified('password')) return next();

     const salt = await bcrypt.genSalt(12);
     this.password = await bcrypt.hash(this.password, salt);
     next();
   });

   // Password comparison method
   UserSchema.methods.comparePassword = async function (candidatePassword: string) {
     return bcrypt.compare(candidatePassword, this.password);
   };

   export const User = mongoose.model<IUser>('User', UserSchema);
   ```

2. **Document Model**

   ```typescript
   // src/server/models/Document.ts
   import mongoose, { Schema, Document as MongoDocument } from 'mongoose';

   export interface IDocument extends MongoDocument {
     title: string;
     content: string;
     metadata: {
       wordCount?: number;
       readingTime?: string;
       category?: string;
       difficulty?: string;
     };
     tags: string[];
     authorId: mongoose.Types.ObjectId;
     createdAt: Date;
     updatedAt: Date;
   }

   const DocumentSchema = new Schema<IDocument>(
     {
       title: { type: String, required: true },
       content: { type: String, required: true },
       metadata: {
         wordCount: Number,
         readingTime: String,
         category: String,
         difficulty: String,
       },
       tags: [{ type: String }],
       authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
     },
     {
       timestamps: true,
     },
   );

   // Indexes for better search performance
   DocumentSchema.index({ title: 'text', content: 'text' });
   DocumentSchema.index({ tags: 1 });
   DocumentSchema.index({ authorId: 1 });
   DocumentSchema.index({ createdAt: -1 });

   export const Document = mongoose.model<IDocument>('Document', DocumentSchema);
   ```

### Database Operations

1. **Repository Pattern**

   ```typescript
   // src/server/repositories/DocumentRepository.ts
   import { Document, IDocument } from '../models/Document';

   export class DocumentRepository {
     async create(data: Partial<IDocument>): Promise<IDocument> {
       const document = new Document(data);
       return await document.save();
     }

     async findById(id: string): Promise<IDocument | null> {
       return await Document.findById(id).populate('authorId', 'username email');
     }

     async findMany(filter: any = {}, options: any = {}): Promise<IDocument[]> {
       return await Document.find(filter)
         .populate('authorId', 'username email')
         .sort(options.sort || { createdAt: -1 })
         .limit(options.limit || 10)
         .skip(options.skip || 0);
     }

     async search(query: string, options: any = {}): Promise<IDocument[]> {
       return await Document.find({ $text: { $search: query } }, { score: { $meta: 'textScore' } })
         .populate('authorId', 'username email')
         .sort({ score: { $meta: 'textScore' } })
         .limit(options.limit || 10);
     }

     async update(id: string, data: Partial<IDocument>): Promise<IDocument | null> {
       return await Document.findByIdAndUpdate(id, data, { new: true });
     }

     async delete(id: string): Promise<boolean> {
       const result = await Document.findByIdAndDelete(id);
       return !!result;
     }
   }
   ```

## 🔌 WebSocket Development

### Socket Events

1. **Server-side Events**

   ```typescript
   // src/server/websocket/documentEvents.ts
   import { Server as SocketIOServer } from 'socket.io';
   import { authenticateSocket } from './middleware/auth';

   export const setupDocumentEvents = (io: SocketIOServer) => {
     io.use(authenticateSocket);

     io.on('connection', (socket) => {
       console.log(`User ${socket.user.id} connected`);

       // Join document room
       socket.on('join-document', (data) => {
         const { documentId } = data;
         socket.join(`document-${documentId}`);

         socket.to(`document-${documentId}`).emit('user-joined', {
           userId: socket.user.id,
           username: socket.user.username,
         });
       });

       // Leave document room
       socket.on('leave-document', (data) => {
         const { documentId } = data;
         socket.leave(`document-${documentId}`);

         socket.to(`document-${documentId}`).emit('user-left', {
           userId: socket.user.id,
         });
       });

       // Document update
       socket.on('document-update', (data) => {
         const { documentId, changes } = data;

         // Broadcast to other users in the room
         socket.to(`document-${documentId}`).emit('document-updated', {
           documentId,
           changes,
           updatedBy: {
             id: socket.user.id,
             username: socket.user.username,
           },
           timestamp: new Date(),
         });
       });

       socket.on('disconnect', () => {
         console.log(`User ${socket.user.id} disconnected`);
       });
     });
   };
   ```

2. **Client-side Integration**

   ```typescript
   // src/frontend/hooks/useSocket.ts
   import { useEffect, useRef } from 'react';
   import { io, Socket } from 'socket.io-client';
   import { useAuth } from './useAuth';

   export const useSocket = () => {
     const { token } = useAuth();
     const socketRef = useRef<Socket | null>(null);

     useEffect(() => {
       if (token) {
         socketRef.current = io(process.env.REACT_APP_WS_URL!, {
           auth: { token },
         });

         socketRef.current.on('connect', () => {
           console.log('Connected to WebSocket');
         });

         socketRef.current.on('disconnect', () => {
           console.log('Disconnected from WebSocket');
         });

         return () => {
           socketRef.current?.disconnect();
         };
       }
     }, [token]);

     const joinDocument = (documentId: string) => {
       socketRef.current?.emit('join-document', { documentId });
     };

     const leaveDocument = (documentId: string) => {
       socketRef.current?.emit('leave-document', { documentId });
     };

     const onDocumentUpdated = (callback: (data: any) => void) => {
       socketRef.current?.on('document-updated', callback);
     };

     return {
       socket: socketRef.current,
       joinDocument,
       leaveDocument,
       onDocumentUpdated,
     };
   };
   ```

## 🧪 Testing Strategies

### Backend Testing

1. **Unit Tests with Jest**

   ```bash
   # Install testing dependencies
   pnpm add -D jest @types/jest supertest @types/supertest ts-jest
   ```

2. **Test Configuration**
   ```javascript
   // jest.config.js
   module.exports = {
     preset: 'ts-jest',
     testEnvironment: 'node',
     roots: ['<rootDir>/src'],
     testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
     collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/server.ts'],
   };
   ```

### Frontend Testing

1. **React Testing Library**

   ```bash
   # Install testing dependencies
   pnpm add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
   ```

2. **Component Testing**

   ```typescript
   // src/frontend/components/__tests__/DocumentCard.test.tsx
   import { render, screen, fireEvent } from '@testing-library/react';
   import { DocumentCard } from '../DocumentCard';

   const mockDocument = {
     id: '1',
     title: 'Test Document',
     content: 'Test content',
     tags: ['test'],
     authorId: 'user1',
     createdAt: new Date(),
     updatedAt: new Date()
   };

   describe('DocumentCard', () => {
     it('renders document information correctly', () => {
       render(<DocumentCard document={mockDocument} />);

       expect(screen.getByText('Test Document')).toBeInTheDocument();
       expect(screen.getByText('Test content...')).toBeInTheDocument();
       expect(screen.getByText('test')).toBeInTheDocument();
     });

     it('calls onEdit when edit button is clicked', () => {
       const onEdit = jest.fn();
       render(<DocumentCard document={mockDocument} onEdit={onEdit} />);

       fireEvent.click(screen.getByText('Edit'));
       expect(onEdit).toHaveBeenCalledWith(mockDocument);
     });
   });
   ```

## 🚀 Deployment

### Production Build

1. **Build Application**

   ```bash
   # Build for production
   pnpm build

   # The build artifacts will be in:
   # - dist/server/ (backend)
   # - dist/frontend/ (frontend)
   ```

2. **Docker Production**

   ```dockerfile
   # Dockerfile
   FROM node:18-alpine AS builder

   WORKDIR /app
   COPY package*.json ./
   COPY pnpm-lock.yaml ./

   RUN npm install -g pnpm
   RUN pnpm install --frozen-lockfile

   COPY . .
   RUN pnpm build

   FROM node:18-alpine AS production

   WORKDIR /app
   COPY --from=builder /app/dist ./dist
   COPY --from=builder /app/node_modules ./node_modules
   COPY --from=builder /app/package.json ./package.json

   EXPOSE 3001

   CMD ["node", "dist/server/index.js"]
   ```

3. **Environment Configuration**

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
         - JWT_SECRET=${JWT_SECRET}
       depends_on:
         - mongo
         - ollama

     mongo:
       image: mongo:5.0
       volumes:
         - mongo_data:/data/db
       environment:
         - MONGO_INITDB_ROOT_USERNAME=${MONGO_ROOT_USERNAME}
         - MONGO_INITDB_ROOT_PASSWORD=${MONGO_ROOT_PASSWORD}

     ollama:
       image: ollama/ollama
       volumes:
         - ollama_data:/root/.ollama

   volumes:
     mongo_data:
     ollama_data:
   ```

## 🔍 Debugging

### Backend Debugging

1. **VS Code Debug Configuration**

   ```json
   // .vscode/launch.json
   {
     "version": "0.2.0",
     "configurations": [
       {
         "name": "Debug Server",
         "type": "node",
         "request": "launch",
         "program": "${workspaceFolder}/src/server/index.ts",
         "outFiles": ["${workspaceFolder}/dist/**/*.js"],
         "runtimeArgs": ["-r", "ts-node/register"],
         "env": {
           "NODE_ENV": "development"
         },
         "console": "integratedTerminal",
         "internalConsoleOptions": "neverOpen"
       }
     ]
   }
   ```

2. **Logging**

   ```typescript
   // src/server/utils/logger.ts
   import winston from 'winston';

   export const logger = winston.createLogger({
     level: process.env.LOG_LEVEL || 'info',
     format: winston.format.combine(
       winston.format.timestamp(),
       winston.format.errors({ stack: true }),
       winston.format.json(),
     ),
     transports: [
       new winston.transports.Console({
         format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
       }),
       new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
       new winston.transports.File({ filename: 'logs/combined.log' }),
     ],
   });
   ```

### Frontend Debugging

1. **React DevTools**

   - Install React Developer Tools browser extension
   - Use React DevTools Profiler for performance analysis

2. **Network Debugging**

   ```typescript
   // src/frontend/services/apiClient.ts
   import axios from 'axios';

   const apiClient = axios.create({
     baseURL: process.env.REACT_APP_API_URL,
     timeout: 10000,
   });

   // Request interceptor for debugging
   apiClient.interceptors.request.use(
     (config) => {
       console.log('API Request:', config.method?.toUpperCase(), config.url, config.data);
       return config;
     },
     (error) => {
       console.error('API Request Error:', error);
       return Promise.reject(error);
     },
   );

   // Response interceptor for debugging
   apiClient.interceptors.response.use(
     (response) => {
       console.log('API Response:', response.status, response.data);
       return response;
     },
     (error) => {
       console.error('API Response Error:', error.response?.data || error.message);
       return Promise.reject(error);
     },
   );
   ```

## 📈 Performance Optimization

### Backend Optimization

1. **Database Indexing**

   ```typescript
   // Add indexes to improve query performance
   DocumentSchema.index({ title: 'text', content: 'text' });
   DocumentSchema.index({ tags: 1 });
   DocumentSchema.index({ authorId: 1, createdAt: -1 });
   ```

2. **Caching Strategy**

   ```typescript
   // src/server/middleware/cache.ts
   import Redis from 'ioredis';

   const redis = new Redis(process.env.REDIS_URL);

   export const cacheMiddleware = (ttl: number = 300) => {
     return async (req: Request, res: Response, next: NextFunction) => {
       const key = `cache:${req.originalUrl}`;

       try {
         const cached = await redis.get(key);
         if (cached) {
           return res.json(JSON.parse(cached));
         }

         // Override res.json to cache response
         const originalJson = res.json;
         res.json = function (data) {
           redis.setex(key, ttl, JSON.stringify(data));
           return originalJson.call(this, data);
         };

         next();
       } catch (error) {
         next();
       }
     };
   };
   ```

### Frontend Optimization

1. **Code Splitting**

   ```typescript
   // src/frontend/App.tsx
   import { lazy, Suspense } from 'react';
   import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
   import { Layout, Spin } from 'antd';

   const Dashboard = lazy(() => import('./pages/Dashboard'));
   const Documents = lazy(() => import('./pages/Documents'));
   const Queries = lazy(() => import('./pages/Queries'));

   export const App = () => {
     return (
       <Router>
         <Layout>
           <Suspense fallback={<Spin size="large" />}>
             <Routes>
               <Route path="/" element={<Dashboard />} />
               <Route path="/documents" element={<Documents />} />
               <Route path="/queries" element={<Queries />} />
             </Routes>
           </Suspense>
         </Layout>
       </Router>
     );
   };
   ```

2. **Virtual Scrolling**

   ```typescript
   // src/frontend/components/VirtualDocumentList.tsx
   import { FixedSizeList as List } from 'react-window';
   import { Document } from '../types/document';

   interface VirtualDocumentListProps {
     documents: Document[];
     onDocumentClick: (document: Document) => void;
   }

   export const VirtualDocumentList: React.FC<VirtualDocumentListProps> = ({
     documents,
     onDocumentClick
   }) => {
     const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
       <div style={style}>
         <DocumentCard
           document={documents[index]}
           onClick={() => onDocumentClick(documents[index])}
         />
       </div>
     );

     return (
       <List
         height={600}
         itemCount={documents.length}
         itemSize={120}
         width="100%"
       >
         {Row}
       </List>
     );
   };
   ```

## 🛡️ Security Best Practices

### Authentication & Authorization

1. **JWT Security**

   ```typescript
   // src/server/middleware/auth.ts
   import jwt from 'jsonwebtoken';
   import { Request, Response, NextFunction } from 'express';

   export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
     const authHeader = req.headers['authorization'];
     const token = authHeader && authHeader.split(' ')[1];

     if (!token) {
       return res.status(401).json({
         success: false,
         error: {
           code: 'UNAUTHORIZED',
           message: 'Access token required',
         },
       });
     }

     jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
       if (err) {
         return res.status(403).json({
           success: false,
           error: {
             code: 'FORBIDDEN',
             message: 'Invalid or expired token',
           },
         });
       }

       req.user = user;
       next();
     });
   };
   ```

2. **Input Validation**

   ```typescript
   // src/server/middleware/validation.ts
   import { body, validationResult } from 'express-validator';

   export const validateDocument = [
     body('title').isLength({ min: 1, max: 200 }).withMessage('Title must be 1-200 characters'),
     body('content').isLength({ min: 1 }).withMessage('Content is required'),
     body('tags').optional().isArray().withMessage('Tags must be an array'),

     (req: Request, res: Response, next: NextFunction) => {
       const errors = validationResult(req);
       if (!errors.isEmpty()) {
         return res.status(400).json({
           success: false,
           error: {
             code: 'VALIDATION_ERROR',
             message: 'Invalid input data',
             details: errors.array(),
           },
         });
       }
       next();
     },
   ];
   ```

## 📚 Resources

### Documentation

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/)
- [React Documentation](https://react.dev/)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [Ant Design Components](https://ant.design/components/)

### Tools & Libraries

- [pnpm](https://pnpm.io/) - Fast, disk space efficient package manager
- [Jest](https://jestjs.io/) - Testing framework
- [ESLint](https://eslint.org/) - JavaScript linter
- [Prettier](https://prettier.io/) - Code formatter
- [Docker](https://www.docker.com/) - Container platform

### Community

- [GitHub Repository](https://github.com/your-org/promethean)
- [Discord Community](https://discord.gg/promethean)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/promethean)

---

For additional help or questions, reach out to the development team or create an issue in the repository.
