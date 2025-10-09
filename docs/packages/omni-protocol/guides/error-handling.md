# Error Handling Guide

This guide covers comprehensive error handling strategies when working with the Omni protocol, including validation errors, runtime errors, and best practices for robust error management.

## Error Types

### 1. Validation Errors

Validation errors occur when messages don't conform to the expected schema:

```typescript
import { validateOmniMessage } from "@promethean/omni-protocol";

const invalidMessage = {
  // Missing required fields
  id: "msg-123",
  // Missing type field
  payload: "invalid payload type"
};

const result = validateOmniMessage(invalidMessage);
if (!result.success) {
  console.error("Validation failed:", result.error);
  // result.error contains detailed validation information
}
```

### 2. Protocol Errors

Protocol errors indicate issues with message structure or protocol compliance:

```typescript
interface ProtocolError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Example protocol errors
const protocolErrors = {
  UNKNOWN_MESSAGE_TYPE: {
    code: "UNKNOWN_MESSAGE_TYPE",
    message: "Unrecognized message type",
    details: { supportedTypes: ["request", "response", "event"] }
  },
  MALFORMED_MESSAGE: {
    code: "MALFORMED_MESSAGE",
    message: "Message structure is invalid",
    details: { missingFields: ["type", "timestamp"] }
  },
  VERSION_MISMATCH: {
    code: "VERSION_MISMATCH",
    message: "Protocol version incompatibility",
    details: { expected: "1.0", received: "2.0" }
  }
};
```

### 3. Business Logic Errors

Business logic errors occur during message processing:

```typescript
interface BusinessError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  context?: {
    action?: string;
    params?: Record<string, unknown>;
    userId?: string;
  };
}

// Example business errors
const businessErrors = {
  USER_NOT_FOUND: {
    code: "USER_NOT_FOUND",
    message: "User not found",
    details: { userId: "user-456" },
    context: { action: "getUser", params: { userId: "user-456" } }
  },
  INSUFFICIENT_PERMISSIONS: {
    code: "INSUFFICIENT_PERMISSIONS",
    message: "User lacks required permissions",
    details: { required: ["admin"], current: ["user"] },
    context: { action: "deleteUser", userId: "user-789" }
  }
};
```

## Error Response Format

All errors in the Omni protocol follow a consistent format:

```typescript
interface ErrorResponse {
  id: string;
  type: "response";
  payload: {
    success: false;
    error: {
      code: string;
      message: string;
      details?: Record<string, unknown>;
    };
  };
  timestamp: string;
  source: string;
  correlationId: string;
}
```

## Error Handling Patterns

### 1. Validation First Pattern

Always validate messages before processing:

```typescript
import { validateOmniMessage, validateOmniRequest } from "@promethean/omni-protocol";

class SafeMessageHandler {
  async handleMessage(rawMessage: unknown): Promise<OmniResponse> {
    // First level validation - basic message structure
    const messageValidation = validateOmniMessage(rawMessage);
    if (!messageValidation.success) {
      return this.createValidationErrorResponse(null, messageValidation.error);
    }

    const message = messageValidation.data;

    // Second level validation - specific message type
    if (message.type === "request") {
      const requestValidation = validateOmniRequest(message);
      if (!requestValidation.success) {
        return this.createValidationErrorResponse(message.correlationId, requestValidation.error);
      }
    }

    // Process valid message
    try {
      return await this.processMessage(message);
    } catch (error) {
      return this.createProcessingErrorResponse(message.correlationId, error);
    }
  }

  private createValidationErrorResponse(
    correlationId: string | null,
    validationError: any
  ): OmniResponse {
    return {
      id: generateId(),
      type: "response",
      payload: {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Message validation failed",
          details: {
            validationErrors: validationError.errors || [validationError.message]
          }
        }
      },
      timestamp: new Date().toISOString(),
      source: "message-handler",
      correlationId: correlationId || generateId()
    };
  }

  private createProcessingErrorResponse(
    correlationId: string,
    error: Error
  ): OmniResponse {
    return {
      id: generateId(),
      type: "response",
      payload: {
        success: false,
        error: {
          code: "PROCESSING_ERROR",
          message: error.message,
          details: {
            stack: error.stack,
            name: error.name
          }
        }
      },
      timestamp: new Date().toISOString(),
      source: "message-handler",
      correlationId
    };
  }
}
```

### 2. Circuit Breaker Pattern

Implement circuit breakers for external service dependencies:

```typescript
interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  state: "CLOSED" | "OPEN" | "HALF_OPEN";
}

class CircuitBreaker {
  private state: CircuitBreakerState = {
    failures: 0,
    lastFailureTime: 0,
    state: "CLOSED"
  };

  constructor(
    private threshold = 5,
    private timeout = 60000, // 1 minute
    private monitorPeriod = 10000 // 10 seconds
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state.state === "OPEN") {
      if (Date.now() - this.state.lastFailureTime > this.timeout) {
        this.state.state = "HALF_OPEN";
      } else {
        throw new Error("Circuit breaker is OPEN");
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.state.failures = 0;
    this.state.state = "CLOSED";
  }

  private onFailure(): void {
    this.state.failures++;
    this.state.lastFailureTime = Date.now();

    if (this.state.failures >= this.threshold) {
      this.state.state = "OPEN";
    }
  }
}

class ResilientService {
  private circuitBreaker = new CircuitBreaker();

  async callExternalService(params: any): Promise<any> {
    return this.circuitBreaker.execute(async () => {
      // Call external service
      const response = await fetch("https://api.example.com/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    });
  }
}
```

### 3. Retry Pattern

Implement exponential backoff for transient errors:

```typescript
class RetryHandler {
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    baseDelay = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        // Don't retry on client errors
        if (this.isClientError(error)) {
          throw error;
        }

        if (attempt === maxRetries) {
          break;
        }

        const delay = baseDelay * Math.pow(2, attempt);
        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  private isClientError(error: any): boolean {
    return error.code === "INVALID_REQUEST" ||
           error.code === "UNAUTHORIZED" ||
           error.code === "FORBIDDEN" ||
           error.code === "NOT_FOUND";
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### 4. Timeout Pattern

Implement timeouts for long-running operations:

```typescript
class TimeoutHandler {
  async executeWithTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return Promise.race([
      operation(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Operation timed out")), timeoutMs)
      )
    ]);
  }
}

// Usage
class TimedService {
  private timeoutHandler = new TimeoutHandler();

  async processRequest(request: OmniRequest): Promise<OmniResponse> {
    try {
      const result = await this.timeoutHandler.executeWithTimeout(
        () => this.doWork(request),
        30000 // 30 second timeout
      );

      return this.createSuccessResponse(request.correlationId, result);
    } catch (error) {
      if (error.message === "Operation timed out") {
        return this.createErrorResponse(
          request.correlationId,
          "TIMEOUT",
          "Request processing timed out"
        );
      }
      throw error;
    }
  }
}
```

## Error Monitoring and Logging

### 1. Structured Error Logging

```typescript
interface ErrorLog {
  timestamp: string;
  errorId: string;
  code: string;
  message: string;
  details?: Record<string, unknown>;
  context?: {
    messageId?: string;
    correlationId?: string;
    action?: string;
    userId?: string;
    service?: string;
  };
  stack?: string;
  severity: "low" | "medium" | "high" | "critical";
}

class ErrorLogger {
  async logError(error: Error, context?: Record<string, unknown>): Promise<void> {
    const errorLog: ErrorLog = {
      timestamp: new Date().toISOString(),
      errorId: this.generateErrorId(),
      code: (error as any).code || "UNKNOWN_ERROR",
      message: error.message,
      stack: error.stack,
      severity: this.determineSeverity(error),
      context
    };

    // Log to console
    console.error("Error occurred:", errorLog);

    // Send to monitoring service
    await this.sendToMonitoring(errorLog);

    // Store in error database
    await this.storeError(errorLog);
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private determineSeverity(error: Error): ErrorLog["severity"] {
    if ((error as any).code === "INTERNAL_ERROR") {
      return "critical";
    }
    if ((error as any).code === "VALIDATION_ERROR") {
      return "low";
    }
    return "medium";
  }

  private async sendToMonitoring(errorLog: ErrorLog): Promise<void> {
    // Send to monitoring service (DataDog, New Relic, etc.)
  }

  private async storeError(errorLog: ErrorLog): Promise<void> {
    // Store in database for analysis
  }
}
```

### 2. Error Metrics

```typescript
interface ErrorMetrics {
  totalErrors: number;
  errorsByCode: Record<string, number>;
  errorsByService: Record<string, number>;
  errorRate: number;
  averageResolutionTime: number;
}

class ErrorMetricsCollector {
  private metrics: ErrorMetrics = {
    totalErrors: 0,
    errorsByCode: {},
    errorsByService: {},
    errorRate: 0,
    averageResolutionTime: 0
  };

  recordError(error: any, context?: Record<string, unknown>): void {
    this.metrics.totalErrors++;

    const code = error.code || "UNKNOWN_ERROR";
    this.metrics.errorsByCode[code] = (this.metrics.errorsByCode[code] || 0) + 1;

    const service = context?.service || "unknown";
    this.metrics.errorsByService[service] = (this.metrics.errorsByService[service] || 0) + 1;

    this.updateErrorRate();
  }

  private updateErrorRate(): void {
    // Calculate error rate based on recent activity
    const timeWindow = 60000; // 1 minute
    const recentErrors = this.getRecentErrors(timeWindow);
    this.metrics.errorRate = recentErrors / timeWindow;
  }

  private getRecentErrors(timeWindow: number): number {
    // Implementation depends on your error storage
    return 0;
  }

  getMetrics(): ErrorMetrics {
    return { ...this.metrics };
  }
}
```

## Standard Error Codes

### Client Errors (4xx)

```typescript
const CLIENT_ERRORS = {
  INVALID_REQUEST: {
    code: "INVALID_REQUEST",
    message: "The request is malformed or invalid",
    httpStatus: 400
  },
  MISSING_ACTION: {
    code: "MISSING_ACTION",
    message: "Request payload must include an action field",
    httpStatus: 400
  },
  INVALID_PARAMS: {
    code: "INVALID_PARAMS",
    message: "Invalid or missing parameters for the specified action",
    httpStatus: 400
  },
  UNAUTHORIZED: {
    code: "UNAUTHORIZED",
    message: "Authentication is required or has failed",
    httpStatus: 401
  },
  FORBIDDEN: {
    code: "FORBIDDEN",
    message: "Insufficient permissions to perform the requested action",
    httpStatus: 403
  },
  NOT_FOUND: {
    code: "NOT_FOUND",
    message: "The requested resource was not found",
    httpStatus: 404
  },
  CONFLICT: {
    code: "CONFLICT",
    message: "The request conflicts with the current state of the resource",
    httpStatus: 409
  },
  RATE_LIMIT_EXCEEDED: {
    code: "RATE_LIMIT_EXCEEDED",
    message: "Too many requests have been made",
    httpStatus: 429
  }
};
```

### Server Errors (5xx)

```typescript
const SERVER_ERRORS = {
  INTERNAL_ERROR: {
    code: "INTERNAL_ERROR",
    message: "An unexpected error occurred on the server",
    httpStatus: 500
  },
  SERVICE_UNAVAILABLE: {
    code: "SERVICE_UNAVAILABLE",
    message: "The service is temporarily unavailable",
    httpStatus: 503
  },
  TIMEOUT: {
    code: "TIMEOUT",
    message: "The request processing timed out",
    httpStatus: 504
  },
  VALIDATION_ERROR: {
    code: "VALIDATION_ERROR",
    message: "Server-side validation failed",
    httpStatus: 500
  },
  DATABASE_ERROR: {
    code: "DATABASE_ERROR",
    message: "Database operation failed",
    httpStatus: 500
  },
  EXTERNAL_SERVICE_ERROR: {
    code: "EXTERNAL_SERVICE_ERROR",
    message: "External service call failed",
    httpStatus: 502
  }
};
```

### Protocol Errors

```typescript
const PROTOCOL_ERRORS = {
  UNKNOWN_MESSAGE_TYPE: {
    code: "UNKNOWN_MESSAGE_TYPE",
    message: "Unrecognized message type",
    httpStatus: 400
  },
  MALFORMED_MESSAGE: {
    code: "MALFORMED_MESSAGE",
    message: "Message structure is invalid",
    httpStatus: 400
  },
  VERSION_MISMATCH: {
    code: "VERSION_MISMATCH",
    message: "Protocol version incompatibility",
    httpStatus: 400
  },
  INVALID_SCHEMA: {
    code: "INVALID_SCHEMA",
    message: "Message does not conform to expected schema",
    httpStatus: 400
  }
};
```

## Error Recovery Strategies

### 1. Graceful Degradation

```typescript
class GracefulDegradationService {
  async getUserData(userId: string): Promise<any> {
    try {
      // Try to get full user data
      return await this.getFullUserData(userId);
    } catch (error) {
      console.warn("Full user data unavailable, falling back to basic data:", error);

      try {
        // Fall back to basic user data
        return await this.getBasicUserData(userId);
      } catch (fallbackError) {
        console.error("Even basic user data unavailable:", fallbackError);

        // Return minimal cached data if available
        return this.getCachedUserData(userId);
      }
    }
  }
}
```

### 2. Data Validation and Sanitization

```typescript
class DataSanitizer {
  sanitizeUserData(data: any): any {
    return {
      id: this.sanitizeString(data.id),
      name: this.sanitizeString(data.name),
      email: this.sanitizeEmail(data.email),
      createdAt: this.sanitizeDate(data.createdAt)
    };
  }

  private sanitizeString(value: any): string {
    if (typeof value !== "string") {
      return "";
    }
    return value.trim().substring(0, 255);
  }

  private sanitizeEmail(value: any): string {
    const email = this.sanitizeString(value);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? email : "";
  }

  private sanitizeDate(value: any): string {
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (typeof value === "string") {
      const date = new Date(value);
      return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
    }
    return new Date().toISOString();
  }
}
```

## Best Practices

### 1. Always Include Context

```typescript
// Good
return {
  code: "USER_NOT_FOUND",
  message: "User not found",
  details: { userId: "user-456" },
  context: { action: "getUser", requestId: "req-123" }
};

// Bad
return {
  code: "USER_NOT_FOUND",
  message: "User not found"
};
```

### 2. Use Specific Error Codes

```typescript
// Good
return {
  code: "INVALID_EMAIL_FORMAT",
  message: "Email address is invalid",
  details: { email: "invalid-email" }
};

// Bad
return {
  code: "INVALID_PARAMS",
  message: "Parameters are invalid"
};
```

### 3. Provide Recovery Information

```typescript
return {
  code: "RATE_LIMIT_EXCEEDED",
  message: "Too many requests",
  details: {
    limit: 100,
    window: "1 hour",
    resetTime: "2023-12-01T12:00:00Z",
    retryAfter: 3600
  }
};
```

### 4. Log Errors Appropriately

```typescript
// Log client errors with lower severity
if (this.isClientError(error)) {
  this.logger.warn("Client error", { error, context });
}

// Log server errors with higher severity
if (this.isServerError(error)) {
  this.logger.error("Server error", { error, context });
}

// Never log sensitive information
const sanitizedContext = {
  ...context,
  password: undefined, // Remove sensitive fields
  token: undefined
};
```

This comprehensive error handling guide ensures robust and reliable error management when working with the Omni protocol, providing clear guidelines for all aspects of error handling from validation to recovery.