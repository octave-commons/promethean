# API Documentation

The Promethean Documentation System provides a comprehensive REST API for document management, user authentication, queries, and AI integration via Ollama.

## Base URL

```
Development: http://localhost:3001/api
Production: https://your-domain.com/api
```

## Authentication

The API uses JWT (JSON Web Token) authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Authentication Flow

1. **Register** a new user account
2. **Login** to receive a JWT token
3. Include the token in subsequent API calls

## API Endpoints

### 🔐 Authentication (`/api/auth`)

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "user" // optional, defaults to "user"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "username": "john_doe",
      "email": "john@example.com",
      "role": "user",
      "createdAt": "2023-09-01T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User registered successfully"
}
```

#### Login User

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "username": "john_doe",
      "email": "john@example.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

#### Refresh Token

```http
POST /api/auth/refresh
Authorization: Bearer <current-token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Token refreshed successfully"
}
```

#### Logout User

```http
POST /api/auth/logout
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "message": "Logout successful"
}
```

#### Get Current User

```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "username": "john_doe",
      "email": "john@example.com",
      "role": "user",
      "createdAt": "2023-09-01T10:00:00.000Z",
      "updatedAt": "2023-09-01T11:00:00.000Z"
    }
  }
}
```

---

### 📚 Documents (`/api/documents`)

#### Get All Documents

```http
GET /api/documents?page=1&limit=10&search=keyword&tag=technology
Authorization: Bearer <token>
```

**Query Parameters:**

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `search` (string): Search term for title/content
- `tag` (string): Filter by tag
- `author` (string): Filter by author ID

**Response:**

```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "id": "64f1a2b3c4d5e6f7g8h9i0j2",
        "title": "Getting Started with TypeScript",
        "content": "TypeScript is a typed superset of JavaScript...",
        "metadata": {
          "wordCount": 1250,
          "readingTime": "5 min",
          "lastModified": "2023-09-01T10:30:00.000Z"
        },
        "tags": ["typescript", "programming", "tutorial"],
        "authorId": "64f1a2b3c4d5e6f7g8h9i0j1",
        "author": {
          "username": "john_doe",
          "email": "john@example.com"
        },
        "createdAt": "2023-09-01T10:00:00.000Z",
        "updatedAt": "2023-09-01T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "pages": 5
    }
  }
}
```

#### Get Document by ID

```http
GET /api/documents/:id
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "document": {
      "id": "64f1a2b3c4d5e6f7g8h9i0j2",
      "title": "Getting Started with TypeScript",
      "content": "TypeScript is a typed superset of JavaScript...",
      "metadata": {
        "wordCount": 1250,
        "readingTime": "5 min",
        "lastModified": "2023-09-01T10:30:00.000Z"
      },
      "tags": ["typescript", "programming", "tutorial"],
      "authorId": "64f1a2b3c4d5e6f7g8h9i0j1",
      "author": {
        "username": "john_doe",
        "email": "john@example.com"
      },
      "createdAt": "2023-09-01T10:00:00.000Z",
      "updatedAt": "2023-09-01T10:30:00.000Z"
    }
  }
}
```

#### Create Document

```http
POST /api/documents
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Advanced React Patterns",
  "content": "In this comprehensive guide, we'll explore advanced React patterns...",
  "tags": ["react", "javascript", "patterns", "advanced"],
  "metadata": {
    "category": "tutorial",
    "difficulty": "advanced",
    "estimatedTime": "15 min"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "document": {
      "id": "64f1a2b3c4d5e6f7g8h9i0j3",
      "title": "Advanced React Patterns",
      "content": "In this comprehensive guide, we'll explore advanced React patterns...",
      "metadata": {
        "category": "tutorial",
        "difficulty": "advanced",
        "estimatedTime": "15 min",
        "wordCount": 2500,
        "readingTime": "10 min"
      },
      "tags": ["react", "javascript", "patterns", "advanced"],
      "authorId": "64f1a2b3c4d5e6f7g8h9i0j1",
      "createdAt": "2023-09-01T12:00:00.000Z",
      "updatedAt": "2023-09-01T12:00:00.000Z"
    }
  },
  "message": "Document created successfully"
}
```

#### Update Document

```http
PUT /api/documents/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Advanced React Patterns (Updated)",
  "content": "In this comprehensive guide, we'll explore advanced React patterns...",
  "tags": ["react", "javascript", "patterns", "advanced", "updated"],
  "metadata": {
    "category": "tutorial",
    "difficulty": "advanced",
    "estimatedTime": "18 min"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "document": {
      "id": "64f1a2b3c4d5e6f7g8h9i0j3",
      "title": "Advanced React Patterns (Updated)",
      "content": "In this comprehensive guide, we'll explore advanced React patterns...",
      "metadata": {
        "category": "tutorial",
        "difficulty": "advanced",
        "estimatedTime": "18 min",
        "wordCount": 2800,
        "readingTime": "11 min"
      },
      "tags": ["react", "javascript", "patterns", "advanced", "updated"],
      "authorId": "64f1a2b3c4d5e6f7g8h9i0j1",
      "createdAt": "2023-09-01T12:00:00.000Z",
      "updatedAt": "2023-09-01T13:00:00.000Z"
    }
  },
  "message": "Document updated successfully"
}
```

#### Delete Document

```http
DELETE /api/documents/:id
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

---

### 🔍 Queries (`/api/queries`)

#### Execute Query

```http
POST /api/queries/execute
Authorization: Bearer <token>
Content-Type: application/json

{
  "query": "Find all documents about React patterns",
  "filters": {
    "tags": ["react", "patterns"],
    "dateRange": {
      "from": "2023-01-01",
      "to": "2023-12-31"
    },
    "author": "john_doe"
  },
  "options": {
    "limit": 20,
    "sortBy": "relevance",
    "includeContent": true
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "document": {
          "id": "64f1a2b3c4d5e6f7g8h9i0j3",
          "title": "Advanced React Patterns",
          "content": "In this comprehensive guide, we'll explore advanced React patterns...",
          "tags": ["react", "javascript", "patterns", "advanced"],
          "author": {
            "username": "john_doe",
            "email": "john@example.com"
          },
          "createdAt": "2023-09-01T12:00:00.000Z"
        },
        "relevanceScore": 0.95,
        "matchedFields": ["title", "content", "tags"],
        "highlights": [
          "Advanced <mark>React Patterns</mark>",
          "explore advanced <mark>React</mark> <mark>patterns</mark>"
        ]
      }
    ],
    "queryInfo": {
      "originalQuery": "Find all documents about React patterns",
      "processedQuery": "React patterns",
      "totalResults": 15,
      "executionTime": "45ms"
    }
  },
  "message": "Query executed successfully"
}
```

#### Get Query Suggestions

```http
GET /api/queries/suggestions?q=react&limit=5
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "suggestions": [
      "React patterns",
      "React hooks patterns",
      "React component patterns",
      "React performance patterns",
      "React state management patterns"
    ]
  }
}
```

#### Get Query History

```http
GET /api/queries/history?page=1&limit=10
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "queries": [
      {
        "id": "64f1a2b3c4d5e6f7g8h9i0j4",
        "query": "React patterns",
        "resultsCount": 15,
        "executionTime": 45,
        "createdAt": "2023-09-01T14:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "pages": 5
    }
  }
}
```

---

### 🤖 Ollama Integration (`/api/ollama`)

#### List Available Models

```http
GET /api/ollama/models
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "models": [
      {
        "name": "llama2",
        "size": "3.8GB",
        "modified_at": "2023-09-01T10:00:00.000Z",
        "digest": "sha256:abc123...",
        "details": {
          "format": "gguf",
          "family": "llama",
          "families": null,
          "parameter_size": "7B",
          "quantization_level": "q4_0"
        }
      },
      {
        "name": "codellama",
        "size": "3.8GB",
        "modified_at": "2023-09-01T10:00:00.000Z",
        "digest": "sha256:def456...",
        "details": {
          "format": "gguf",
          "family": "llama",
          "families": null,
          "parameter_size": "7B",
          "quantization_level": "q4_0"
        }
      }
    ]
  }
}
```

#### Generate Text

```http
POST /api/ollama/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "model": "llama2",
  "prompt": "Explain the concept of React hooks in simple terms",
  "options": {
    "temperature": 0.7,
    "top_p": 0.9,
    "max_tokens": 500,
    "stream": false
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "response": "React hooks are functions that let you use state and other React features in functional components...",
    "done": true,
    "model": "llama2",
    "created_at": "2023-09-01T14:30:00.000Z",
    "context": [1, 2, 3, 4, 5],
    "total_duration": 1234567890,
    "load_duration": 123456789,
    "prompt_eval_count": 25,
    "prompt_eval_duration": 123456789,
    "eval_count": 150,
    "eval_duration": 987654321
  }
}
```

#### Chat Completion

```http
POST /api/ollama/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "model": "llama2",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant specializing in programming documentation."
    },
    {
      "role": "user",
      "content": "What are the best practices for React component design?"
    }
  ],
  "options": {
    "temperature": 0.7,
    "stream": false
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": {
      "role": "assistant",
      "content": "Here are some best practices for React component design...",
      "images": null
    },
    "done": true,
    "model": "llama2",
    "created_at": "2023-09-01T14:35:00.000Z",
    "total_duration": 2345678901,
    "load_duration": 234567890,
    "prompt_eval_count": 50,
    "prompt_eval_duration": 234567890,
    "eval_count": 200,
    "eval_duration": 1876543210
  }
}
```

#### Generate Embeddings

```http
POST /api/ollama/embeddings
Authorization: Bearer <token>
Content-Type: application/json

{
  "model": "llama2",
  "prompt": "React hooks are a powerful feature in modern React development"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "embedding": [0.1234, -0.5678, 0.9012, ...],
    "model": "llama2",
    "created_at": "2023-09-01T14:40:00.000Z",
    "total_duration": 3456789012,
    "load_duration": 345678901,
    "prompt_eval_count": 15,
    "prompt_eval_duration": 345678901
  }
}
```

---

### 👥 Users (`/api/users`)

#### Get User Profile

```http
GET /api/users/profile
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "username": "john_doe",
      "email": "john@example.com",
      "role": "user",
      "profile": {
        "firstName": "John",
        "lastName": "Doe",
        "bio": "Full-stack developer passionate about React and TypeScript",
        "avatar": "https://example.com/avatars/john.jpg",
        "location": "San Francisco, CA",
        "website": "https://johndoe.dev"
      },
      "stats": {
        "documentsCreated": 25,
        "queriesExecuted": 150,
        "lastLoginAt": "2023-09-01T14:00:00.000Z"
      },
      "createdAt": "2023-09-01T10:00:00.000Z",
      "updatedAt": "2023-09-01T13:00:00.000Z"
    }
  }
}
```

#### Update User Profile

```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "bio": "Full-stack developer passionate about React and TypeScript",
    "avatar": "https://example.com/avatars/john-new.jpg",
    "location": "San Francisco, CA",
    "website": "https://johndoe.dev"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "username": "john_doe",
      "email": "john@example.com",
      "role": "user",
      "profile": {
        "firstName": "John",
        "lastName": "Doe",
        "bio": "Full-stack developer passionate about React and TypeScript",
        "avatar": "https://example.com/avatars/john-new.jpg",
        "location": "San Francisco, CA",
        "website": "https://johndoe.dev"
      },
      "updatedAt": "2023-09-01T15:00:00.000Z"
    }
  },
  "message": "Profile updated successfully"
}
```

#### Change Password

```http
PUT /api/users/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

#### Delete User Account

```http
DELETE /api/users/account
Authorization: Bearer <token>
Content-Type: application/json

{
  "password": "confirmPassword123",
  "confirmation": "DELETE_MY_ACCOUNT"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

---

## WebSocket Events

The API also provides real-time updates via WebSocket connections.

### Connection

```javascript
const socket = io('ws://localhost:3001', {
  auth: {
    token: 'your-jwt-token',
  },
});
```

### Events

#### Client → Server

**Join Document Room**

```javascript
socket.emit('join-document', { documentId: 'doc-id' });
```

**Leave Document Room**

```javascript
socket.emit('leave-document', { documentId: 'doc-id' });
```

**Document Update**

```javascript
socket.emit('document-update', {
  documentId: 'doc-id',
  changes: {
    title: 'New Title',
    content: 'Updated content',
  },
});
```

#### Server → Client

**Document Updated**

```javascript
socket.on('document-updated', (data) => {
  console.log('Document updated:', data.document);
});
```

**User Joined**

```javascript
socket.on('user-joined', (data) => {
  console.log('User joined:', data.user);
});
```

**User Left**

```javascript
socket.on('user-left', (data) => {
  console.log('User left:', data.userId);
});
```

**Query Completed**

```javascript
socket.on('query-completed', (data) => {
  console.log('Query completed:', data.results);
});
```

---

## Error Handling

The API uses standard HTTP status codes and returns consistent error responses:

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  }
}
```

### Common Error Codes

| Status Code | Error Code            | Description                   |
| ----------- | --------------------- | ----------------------------- |
| 400         | VALIDATION_ERROR      | Invalid request data          |
| 401         | UNAUTHORIZED          | No valid authentication token |
| 403         | FORBIDDEN             | Insufficient permissions      |
| 404         | NOT_FOUND             | Resource not found            |
| 409         | CONFLICT              | Resource already exists       |
| 422         | UNPROCESSABLE_ENTITY  | Invalid data format           |
| 429         | RATE_LIMIT_EXCEEDED   | Too many requests             |
| 500         | INTERNAL_SERVER_ERROR | Server error                  |

---

## Rate Limiting

API requests are rate-limited to prevent abuse:

- **Authentication endpoints**: 5 requests per minute
- **Document operations**: 100 requests per minute
- **Query operations**: 50 requests per minute
- **Ollama operations**: 20 requests per minute

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1693526400
```

---

## Pagination

List endpoints support pagination with the following parameters:

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)

**Response includes pagination metadata:**

```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## Search and Filtering

Many endpoints support search and filtering:

### Search Parameters

- `search` (string): Full-text search
- `tag` (string): Filter by tag
- `author` (string): Filter by author
- `dateRange` (object): Date range filter
- `sortBy` (string): Sort field
- `sortOrder` (string): Sort order (asc/desc)

### Example

```http
GET /api/documents?search=react&tag=tutorial&dateRange[from]=2023-01-01&dateRange[to]=2023-12-31&sortBy=createdAt&sortOrder=desc
```

---

## API Versioning

The API is versioned using URL paths:

- Current version: `/api/v1/`
- Legacy version: `/api/` (redirects to v1)

Future versions will be available at `/api/v2/`, `/api/v3/`, etc.

---

## SDKs and Libraries

Official SDKs are available for:

- **JavaScript/TypeScript**: `@promethean/docs-system-client`
- **Python**: `promethean-docs-system`
- **Go**: `github.com/promethean/docs-system-go`

### JavaScript SDK Example

```javascript
import { DocsSystemClient } from '@promethean/docs-system-client';

const client = new DocsSystemClient({
  baseURL: 'http://localhost:3001/api',
  token: 'your-jwt-token',
});

// Get documents
const documents = await client.documents.list({
  search: 'react',
  limit: 20,
});

// Create document
const document = await client.documents.create({
  title: 'New Document',
  content: 'Document content...',
  tags: ['tutorial'],
});
```

---

## OpenAPI/Swagger

Interactive API documentation is available at:

```
http://localhost:3001/api-docs
```

You can also download the OpenAPI specification:

```
http://localhost:3001/api-docs.json
```

---

## Support

For API support and questions:

- **Documentation**: [docs/](../)
- **Issues**: [GitHub Issues](https://github.com/your-org/promethean/issues)
- **Email**: api-support@promethean.dev
- **Discord**: [Promethean Discord](https://discord.gg/promethean)
