# @promethean/omni-protocol

Unified protocol definitions and validation for the Promethean ecosystem.

## Overview

The Omni protocol provides a standardized way for services, agents, and components to communicate within the Promethean framework. It defines:

- **Type-Safe Communication**: Full TypeScript support with comprehensive interfaces
- **Runtime Validation**: Zod-based validation for all message types
- **JSON Schema Support**: Generate JSON schemas for adapter integration
- **Streaming Support**: Built-in support for streaming data protocols
- **Error Handling**: Comprehensive error codes and handling patterns
- **Backward Compatibility**: Versioned protocol with migration support

## Installation

```bash
pnpm add @promethean/omni-protocol
```

## Quick Start

### Basic Message Creation and Validation

```typescript
import { OmniMessage, validateOmniMessage } from "@promethean/omni-protocol";

// Create a request message
const request: OmniMessage = {
  id: "req-123",
  type: "request",
  payload: {
    action: "getUser",
    params: { userId: "user-456" }
  },
  timestamp: new Date().toISOString(),
  source: "user-service"
};

// Validate the message
const validated = validateOmniMessage(request);
if (validated.success) {
  console.log("Valid message:", validated.data);
} else {
  console.error("Invalid message:", validated.error);
}
```

## Features

### Core Message Types

- **OmniMessage**: Base interface for all protocol messages
- **OmniRequest**: Request messages for RPC-style communication
- **OmniResponse**: Response messages for RPC replies
- **OmniEvent**: Event messages for asynchronous notifications

### Validation

- **Runtime Validation**: Zod schemas for all message types
- **Type Guards**: Helper functions for type narrowing
- **Error Details**: Comprehensive validation error information

### Utilities

- **JSON Schema Generation**: Generate schemas for external integrations
- **ID Generation**: Create unique request and correlation IDs
- **Message Transformation**: Convert between different message formats

### Streaming

- **Chunked Messages**: Support for large data transmission
- **Backpressure Handling**: Flow control for data streams
- **Resumable Streams**: Resume interrupted data transfers

## Documentation

For comprehensive documentation and guides, see:

- 📖 [Complete API Reference](../docs/packages/omni-protocol/README.md)
- 🔧 [Adapter Development Guide](../docs/packages/omni-protocol/guides/adapter-development.md)
- 🔄 [Migration from SmartGPT Bridge](../docs/packages/omni-protocol/guides/migration-from-smartgpt-bridge.md)
- ⚠️ [Error Handling Guide](../docs/packages/omni-protocol/guides/error-handling.md)
- 🌊 [Streaming Implementation](../docs/packages/omni-protocol/guides/streaming-implementation.md)

## API Reference

### Validation Functions

```typescript
// Validate any Omni message
const result = validateOmniMessage(message);

// Validate specific message types
const requestResult = validateOmniRequest(message);
const responseResult = validateOmniResponse(message);
const eventResult = validateOmniEvent(message);
```

### Utility Functions

```typescript
// Generate unique identifiers
const requestId = createRequestId();
const correlationId = createCorrelationId();

// Type guards
if (isRequest(message)) { /* handle request */ }
if (isResponse(message)) { /* handle response */ }
if (isEvent(message)) { /* handle event */ }

// JSON schema generation
const schema = getMessageJsonSchema();
```

## Error Codes

Standardized error codes for consistent error handling:

- **Client Errors**: `INVALID_REQUEST`, `MISSING_ACTION`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`
- **Server Errors**: `INTERNAL_ERROR`, `SERVICE_UNAVAILABLE`, `TIMEOUT`, `VALIDATION_ERROR`
- **Protocol Errors**: `UNKNOWN_MESSAGE_TYPE`, `MALFORMED_MESSAGE`, `VERSION_MISMATCH`

## Development

```bash
# Install dependencies
pnpm install

# Build the package
pnpm run build

# Run tests
pnpm run test

# Type checking
pnpm run typecheck

# Linting
pnpm run lint

# Coverage
pnpm run coverage
```

## Examples

### Service Implementation

```typescript
import { OmniRequest, OmniResponse, validateOmniRequest } from "@promethean/omni-protocol";

class UserService {
  async handleRequest(rawMessage: unknown): Promise<OmniResponse> {
    const validated = validateOmniRequest(rawMessage);
    if (!validated.success) {
      return this.createErrorResponse(validated.error.message);
    }

    const request = validated.data;
    const result = await this.processAction(
      request.payload.action,
      request.payload.params
    );

    return {
      id: generateId(),
      type: "response",
      payload: { success: true, data: result },
      timestamp: new Date().toISOString(),
      source: "user-service",
      correlationId: request.id
    };
  }
}
```

### Event Publishing

```typescript
import { OmniEvent } from "@promethean/omni-protocol";

const event: OmniEvent = {
  id: generateId(),
  type: "event",
  payload: {
    event: "user.created",
    data: { userId: "user-456", timestamp: new Date().toISOString() }
  },
  timestamp: new Date().toISOString(),
  source: "user-service"
};
```

## Contributing

1. Follow the existing code patterns and TypeScript conventions
2. Add comprehensive JSDoc comments for new APIs
3. Include unit tests for new functionality
4. Update documentation for any breaking changes
5. Ensure backward compatibility when possible

## License

This package is part of the Promethean project. See the main project LICENSE for details.
