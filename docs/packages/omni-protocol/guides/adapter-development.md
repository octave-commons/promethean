# Adapter Development Guide

This guide walks through creating adapters that implement the Omni protocol for external services and systems.

## Overview

Adapters act as bridges between external systems and the Promethean ecosystem, translating external messages to and from the Omni protocol format.

## Adapter Architecture

```
External System ↔ Adapter ↔ Omni Protocol ↔ Promethean Services
```

## Creating a Basic Adapter

### 1. Setup the Adapter Class

```typescript
import {
  OmniMessage,
  OmniRequest,
  OmniResponse,
  OmniEvent,
  validateOmniMessage,
  createRequestId,
  createCorrelationId
} from "@promethean/omni-protocol";

export abstract class BaseAdapter {
  protected serviceName: string;
  protected version: string;

  constructor(serviceName: string, version = "1.0.0") {
    this.serviceName = serviceName;
    this.version = version;
  }

  abstract async handleRequest(request: OmniRequest): Promise<OmniResponse>;
  abstract async handleEvent(event: OmniEvent): Promise<void>;

  // Main message entry point
  async handleMessage(rawMessage: unknown): Promise<OmniResponse | void> {
    const validated = validateOmniMessage(rawMessage);
    if (!validated.success) {
      return this.createErrorResponse(null, "INVALID_REQUEST", validated.error.message);
    }

    const message = validated.data;

    switch (message.type) {
      case "request":
        return this.handleRequest(message);
      case "event":
        return this.handleEvent(message);
      default:
        return this.createErrorResponse(
          message.correlationId,
          "UNKNOWN_MESSAGE_TYPE",
          `Unsupported message type: ${message.type}`
        );
    }
  }

  protected createResponse(
    correlationId: string,
    data?: unknown,
    success = true
  ): OmniResponse {
    return {
      id: createRequestId(),
      type: "response",
      payload: {
        success,
        data
      },
      timestamp: new Date().toISOString(),
      source: this.serviceName,
      correlationId
    };
  }

  protected createErrorResponse(
    correlationId: string | null,
    code: string,
    message: string,
    details?: Record<string, unknown>
  ): OmniResponse {
    return {
      id: createRequestId(),
      type: "response",
      payload: {
        success: false,
        error: {
          code,
          message,
          details
        }
      },
      timestamp: new Date().toISOString(),
      source: this.serviceName,
      correlationId: correlationId || createCorrelationId()
    };
  }

  protected createEvent(
    eventName: string,
    data?: unknown
  ): OmniEvent {
    return {
      id: createRequestId(),
      type: "event",
      payload: {
        event: eventName,
        data
      },
      timestamp: new Date().toISOString(),
      source: this.serviceName
    };
  }
}
```

### 2. Implement a Specific Adapter

```typescript
import { BaseAdapter } from "./base-adapter.js";
import { OmniRequest, OmniResponse, OmniEvent } from "@promethean/omni-protocol";

interface UserData {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

// Mock external user service
class ExternalUserService {
  async getUser(userId: string): Promise<UserData> {
    // Simulate external API call
    return {
      id: userId,
      name: "John Doe",
      email: "john@example.com",
      createdAt: new Date().toISOString()
    };
  }

  async createUser(userData: Partial<UserData>): Promise<UserData> {
    // Simulate external API call
    const newUser: UserData = {
      id: Math.random().toString(36).substr(2, 9),
      name: userData.name || "Unknown",
      email: userData.email || "",
      createdAt: new Date().toISOString()
    };
    return newUser;
  }

  async updateUser(userId: string, updates: Partial<UserData>): Promise<UserData> {
    // Simulate external API call
    const existing = await this.getUser(userId);
    return { ...existing, ...updates };
  }

  async deleteUser(userId: string): Promise<void> {
    // Simulate external API call
    console.log(`User ${userId} deleted`);
  }
}

export class UserServiceAdapter extends BaseAdapter {
  private userService: ExternalUserService;

  constructor() {
    super("user-service-adapter");
    this.userService = new ExternalUserService();
  }

  async handleRequest(request: OmniRequest): Promise<OmniResponse> {
    const { action, params } = request.payload;

    try {
      switch (action) {
        case "getUser":
          return this.handleGetUser(params);
        case "createUser":
          return this.handleCreateUser(params);
        case "updateUser":
          return this.handleUpdateUser(params);
        case "deleteUser":
          return this.handleDeleteUser(params);
        case "listUsers":
          return this.handleListUsers(params);
        default:
          return this.createErrorResponse(
            request.id,
            "UNKNOWN_ACTION",
            `Unknown action: ${action}`
          );
      }
    } catch (error) {
      return this.createErrorResponse(
        request.id,
        "INTERNAL_ERROR",
        error.message
      );
    }
  }

  async handleEvent(event: OmniEvent): Promise<void> {
    const { event: eventName, data } = event.payload;

    switch (eventName) {
      case "user.welcome":
        await this.handleWelcomeUser(data);
        break;
      case "user.cleanup":
        await this.handleUserCleanup(data);
        break;
      default:
        console.log(`Unhandled event: ${eventName}`);
    }
  }

  private async handleGetUser(params: any): Promise<OmniResponse> {
    if (!params?.userId) {
      return this.createErrorResponse(
        null,
        "INVALID_PARAMS",
        "Missing required parameter: userId"
      );
    }

    const user = await this.userService.getUser(params.userId);
    return this.createResponse(params.correlationId, user);
  }

  private async handleCreateUser(params: any): Promise<OmniResponse> {
    if (!params?.userData) {
      return this.createErrorResponse(
        null,
        "INVALID_PARAMS",
        "Missing required parameter: userData"
      );
    }

    const newUser = await this.userService.createUser(params.userData);

    // Emit user created event
    const createdEvent = this.createEvent("user.created", {
      userId: newUser.id,
      userData: newUser
    });

    // In a real implementation, you would publish this event
    console.log("Event published:", createdEvent);

    return this.createResponse(params.correlationId, newUser);
  }

  private async handleUpdateUser(params: any): Promise<OmniResponse> {
    if (!params?.userId || !params?.updates) {
      return this.createErrorResponse(
        null,
        "INVALID_PARAMS",
        "Missing required parameters: userId, updates"
      );
    }

    const updatedUser = await this.userService.updateUser(
      params.userId,
      params.updates
    );

    // Emit user updated event
    const updatedEvent = this.createEvent("user.updated", {
      userId: updatedUser.id,
      updates: params.updates,
      userData: updatedUser
    });

    console.log("Event published:", updatedEvent);

    return this.createResponse(params.correlationId, updatedUser);
  }

  private async handleDeleteUser(params: any): Promise<OmniResponse> {
    if (!params?.userId) {
      return this.createErrorResponse(
        null,
        "INVALID_PARAMS",
        "Missing required parameter: userId"
      );
    }

    await this.userService.deleteUser(params.userId);

    // Emit user deleted event
    const deletedEvent = this.createEvent("user.deleted", {
      userId: params.userId
    });

    console.log("Event published:", deletedEvent);

    return this.createResponse(params.correlationId, { success: true });
  }

  private async handleListUsers(params: any): Promise<OmniResponse> {
    // Mock implementation - in reality this would call the external service
    const users = [
      await this.userService.getUser("user1"),
      await this.userService.getUser("user2")
    ];

    return this.createResponse(params.correlationId, { users });
  }

  private async handleWelcomeUser(data: any): Promise<void> {
    console.log(`Welcome user: ${data.userId}`);
    // Implementation for welcoming users (send welcome email, etc.)
  }

  private async handleUserCleanup(data: any): Promise<void> {
    console.log(`Cleanup user: ${data.userId}`);
    // Implementation for user cleanup tasks
  }
}
```

## HTTP Adapter Integration

### HTTP Server Adapter

```typescript
import { BaseAdapter } from "./base-adapter.js";
import { createServer, IncomingMessage, ServerResponse } from "http";

export class HttpAdapter extends BaseAdapter {
  private server: any;
  private port: number;

  constructor(port = 3000) {
    super("http-adapter");
    this.port = port;
  }

  async start(): Promise<void> {
    this.server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
      try {
        await this.handleHttpRequest(req, res);
      } catch (error) {
        console.error("HTTP request error:", error);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Internal server error" }));
      }
    });

    return new Promise((resolve) => {
      this.server.listen(this.port, () => {
        console.log(`HTTP adapter listening on port ${this.port}`);
        resolve();
      });
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve) => {
      this.server.close(() => {
        console.log("HTTP adapter stopped");
        resolve();
      });
    });
  }

  private async handleHttpRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    if (req.method !== "POST") {
      res.writeHead(405, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Method not allowed" }));
      return;
    }

    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      try {
        const message = JSON.parse(body);
        const response = await this.handleMessage(message);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(response));
      } catch (error) {
        console.error("Error processing HTTP request:", error);
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          error: "Invalid request format",
          details: error.message
        }));
      }
    });
  }
}

// Usage
const httpAdapter = new HttpAdapter(3000);
await httpAdapter.start();
```

## WebSocket Adapter Integration

### WebSocket Adapter

```typescript
import { WebSocketServer, WebSocket } from "ws";
import { BaseAdapter } from "./base-adapter.js";

export class WebSocketAdapter extends BaseAdapter {
  private wss: WebSocketServer;
  private clients: Map<string, WebSocket> = new Map();

  constructor(port = 8080) {
    super("websocket-adapter");
    this.wss = new WebSocketServer({ port });
    this.setupWebSocketServer();
  }

  private setupWebSocketServer(): void {
    this.wss.on("connection", (ws: WebSocket, req) => {
      const clientId = this.generateClientId();
      this.clients.set(clientId, ws);

      console.log(`WebSocket client connected: ${clientId}`);

      ws.on("message", async (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          const response = await this.handleMessage(message);

          if (response) {
            ws.send(JSON.stringify(response));
          }
        } catch (error) {
          console.error("Error processing WebSocket message:", error);
          ws.send(JSON.stringify({
            type: "response",
            payload: {
              success: false,
              error: {
                code: "INVALID_MESSAGE",
                message: "Invalid message format"
              }
            }
          }));
        }
      });

      ws.on("close", () => {
        console.log(`WebSocket client disconnected: ${clientId}`);
        this.clients.delete(clientId);
      });

      ws.on("error", (error) => {
        console.error(`WebSocket client error (${clientId}):`, error);
        this.clients.delete(clientId);
      });

      // Send welcome message
      ws.send(JSON.stringify({
        type: "event",
        payload: {
          event: "connection.established",
          data: { clientId, timestamp: new Date().toISOString() }
        },
        timestamp: new Date().toISOString(),
        source: this.serviceName,
        id: this.generateClientId()
      }));
    });

    console.log(`WebSocket adapter listening on port ${this.wss.options.port}`);
  }

  // Broadcast events to all connected clients
  async broadcastEvent(event: OmniEvent): Promise<void> {
    const message = JSON.stringify(event);

    for (const [clientId, ws] of this.clients) {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(message);
        } catch (error) {
          console.error(`Failed to send to client ${clientId}:`, error);
          this.clients.delete(clientId);
        }
      }
    }
  }

  private generateClientId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  async stop(): Promise<void> {
    return new Promise((resolve) => {
      this.wss.close(() => {
        console.log("WebSocket adapter stopped");
        resolve();
      });
    });
  }
}
```

## Testing Your Adapter

### Unit Tests

```typescript
import test from "ava";
import { UserServiceAdapter } from "../src/user-service-adapter.js";
import { OmniRequest } from "@promethean/omni-protocol";

test("UserServiceAdapter handles getUser request", async (t) => {
  const adapter = new UserServiceAdapter();

  const request: OmniRequest = {
    id: "req-123",
    type: "request",
    payload: {
      action: "getUser",
      params: { userId: "user-456" }
    },
    timestamp: new Date().toISOString(),
    source: "test-client"
  };

  const response = await adapter.handleRequest(request);

  t.is(response.type, "response");
  t.true(response.payload.success);
  t.truthy(response.payload.data);
  t.is(response.payload.data.id, "user-456");
});

test("UserServiceAdapter handles invalid request", async (t) => {
  const adapter = new UserServiceAdapter();

  const request: OmniRequest = {
    id: "req-456",
    type: "request",
    payload: {
      action: "getUser",
      params: {} // Missing userId
    },
    timestamp: new Date().toISOString(),
    source: "test-client"
  };

  const response = await adapter.handleRequest(request);

  t.is(response.type, "response");
  t.false(response.payload.success);
  t.is(response.payload.error.code, "INVALID_PARAMS");
});
```

### Integration Tests

```typescript
import test from "ava";
import { HttpAdapter } from "../src/http-adapter.js";

test.serial("HttpAdapter integration", async (t) => {
  const adapter = new HttpAdapter(3001);
  await adapter.start();

  try {
    const response = await fetch("http://localhost:3001", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: "req-789",
        type: "request",
        payload: {
          action: "test",
          params: {}
        },
        timestamp: new Date().toISOString(),
        source: "test-client"
      })
    });

    const data = await response.json();

    t.is(response.status, 200);
    t.is(data.type, "response");
    t.false(data.payload.success);
    t.is(data.payload.error.code, "UNKNOWN_ACTION");
  } finally {
    await adapter.stop();
  }
});
```

## Error Handling Best Practices

### 1. Validate All Inputs

```typescript
async handleRequest(request: OmniRequest): Promise<OmniResponse> {
  // Validate action
  if (!request.payload.action) {
    return this.createErrorResponse(
      request.id,
      "MISSING_ACTION",
      "Request payload must include an action"
    );
  }

  // Validate required parameters
  if (!this.validateParams(request.payload.action, request.payload.params)) {
    return this.createErrorResponse(
      request.id,
      "INVALID_PARAMS",
      "Invalid or missing parameters for action"
    );
  }

  // ... rest of implementation
}
```

### 2. Use Standardized Error Codes

```typescript
enum ErrorCodes {
  // Client errors
  INVALID_REQUEST = "INVALID_REQUEST",
  MISSING_ACTION = "MISSING_ACTION",
  INVALID_PARAMS = "INVALID_PARAMS",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",

  // Server errors
  INTERNAL_ERROR = "INTERNAL_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
  TIMEOUT = "TIMEOUT",
  VALIDATION_ERROR = "VALIDATION_ERROR",

  // Protocol errors
  UNKNOWN_MESSAGE_TYPE = "UNKNOWN_MESSAGE_TYPE",
  MALFORMED_MESSAGE = "MALFORMED_MESSAGE",
  VERSION_MISMATCH = "VERSION_MISMATCH"
}
```

### 3. Include Correlation IDs

```typescript
async handleRequest(request: OmniRequest): Promise<OmniResponse> {
  const correlationId = request.id;

  try {
    // Process request
    return this.createResponse(correlationId, result);
  } catch (error) {
    return this.createErrorResponse(
      correlationId,
      "INTERNAL_ERROR",
      error.message,
      { stack: error.stack }
    );
  }
}
```

## Performance Considerations

### 1. Implement Caching

```typescript
export class CachedAdapter extends BaseAdapter {
  private cache = new Map<string, { data: any; expiry: number }>();
  private cacheTimeout = 60000; // 1 minute

  protected async getCachedData<T>(key: string): Promise<T | null> {
    const cached = this.cache.get(key);
    if (cached && Date.now() < cached.expiry) {
      return cached.data;
    }
    return null;
  }

  protected setCachedData<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + this.cacheTimeout
    });
  }
}
```

### 2. Use Connection Pooling

```typescript
export class DatabaseAdapter extends BaseAdapter {
  private connectionPool: any;

  constructor() {
    super("database-adapter");
    this.connectionPool = createConnectionPool({
      min: 2,
      max: 10,
      idleTimeoutMillis: 30000
    });
  }

  protected async query(sql: string, params: any[]): Promise<any> {
    const connection = await this.connectionPool.acquire();
    try {
      return await connection.query(sql, params);
    } finally {
      this.connectionPool.release(connection);
    }
  }
}
```

## Security Considerations

### 1. Input Sanitization

```typescript
export class SecureAdapter extends BaseAdapter {
  async handleRequest(request: OmniRequest): Promise<OmniResponse> {
    // Sanitize inputs
    const sanitized = this.sanitizeRequest(request);

    // Validate authentication
    if (!this.isAuthenticated(sanitized)) {
      return this.createErrorResponse(
        request.id,
        "UNAUTHORIZED",
        "Missing or invalid authentication"
      );
    }

    // Validate authorization
    if (!this.isAuthorized(sanitized)) {
      return this.createErrorResponse(
        request.id,
        "FORBIDDEN",
        "Insufficient permissions"
      );
    }

    return super.handleRequest(sanitized);
  }

  private sanitizeRequest(request: OmniRequest): OmniRequest {
    return {
      ...request,
      payload: this.sanitizePayload(request.payload)
    };
  }

  private sanitizePayload(payload: any): any {
    // Implement sanitization logic
    return payload;
  }

  private isAuthenticated(request: OmniRequest): boolean {
    // Implement authentication logic
    return true;
  }

  private isAuthorized(request: OmniRequest): boolean {
    // Implement authorization logic
    return true;
  }
}
```

### 2. Rate Limiting

```typescript
export class RateLimitedAdapter extends BaseAdapter {
  private rateLimiter = new Map<string, { count: number; resetTime: number }>();
  private maxRequests = 100;
  private windowMs = 60000; // 1 minute

  protected checkRateLimit(clientId: string): boolean {
    const now = Date.now();
    const client = this.rateLimiter.get(clientId);

    if (!client || now > client.resetTime) {
      this.rateLimiter.set(clientId, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return true;
    }

    if (client.count >= this.maxRequests) {
      return false;
    }

    client.count++;
    return true;
  }

  async handleRequest(request: OmniRequest): Promise<OmniResponse> {
    const clientId = request.headers?.["x-client-id"] || "anonymous";

    if (!this.checkRateLimit(clientId)) {
      return this.createErrorResponse(
        request.id,
        "RATE_LIMIT_EXCEEDED",
        "Too many requests"
      );
    }

    return super.handleRequest(request);
  }
}
```

This comprehensive adapter development guide provides the foundation for building robust, secure, and performant adapters that integrate external systems with the Promethean ecosystem using the Omni protocol.