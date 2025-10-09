# Migration Guide: SmartGPT Bridge to Omni Protocol

This guide helps you migrate from the legacy SmartGPT bridge to the new Omni protocol, ensuring minimal disruption and improved functionality.

## Overview

The Omni protocol provides several advantages over the SmartGPT bridge:
- Type safety with TypeScript interfaces
- Runtime validation with Zod schemas
- Standardized error handling
- Better performance and reduced overhead
- Extensive documentation and tooling

## Key Differences

### Message Structure

#### SmartGPT Bridge (Legacy)

```typescript
interface SmartGPTMessage {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  source?: string;
  target?: string;
}

interface SmartGPTRequest extends SmartGPTMessage {
  type: "request";
  method: string;
  params: any;
}

interface SmartGPTResponse extends SmartGPTMessage {
  type: "response";
  success: boolean;
  result?: any;
  error?: string;
}
```

#### Omni Protocol (New)

```typescript
interface OmniMessage {
  id: string;
  type: string;
  payload: OmniPayload;
  headers?: OmniHeaders;
  timestamp: string;        // ISO string instead of number
  source: string;            // Required field
  destination?: string;
  correlationId?: string;    // Better correlation tracking
}

interface OmniRequest extends OmniMessage {
  type: "request";
  payload: {
    action: string;          // More descriptive than "method"
    params?: Record<string, unknown>;
  };
}

interface OmniResponse extends OmniMessage {
  type: "response";
  payload: {
    success: boolean;
    data?: unknown;           // More descriptive than "result"
    error?: {                 // Structured error information
      code: string;
      message: string;
      details?: Record<string, unknown>;
    };
  };
  correlationId: string;    // Required for responses
}
```

## Migration Steps

### Step 1: Update Dependencies

```bash
# Remove old dependency
pnpm remove @promethean/smartgpt-bridge

# Add new dependency
pnpm add @promethean/omni-protocol
```

### Step 2: Update Imports

#### Before

```typescript
import { SmartGPTMessage, SmartGPTRequest } from "@promethean/smartgpt-bridge";
```

#### After

```typescript
import {
  OmniMessage,
  OmniRequest,
  OmniResponse,
  OmniEvent,
  validateOmniMessage
} from "@promethean/omni-protocol";
```

### Step 3: Update Message Creation

#### Request Messages

##### Before

```typescript
const request: SmartGPTRequest = {
  id: "req-123",
  type: "request",
  method: "getUser",
  params: { userId: "user-456" },
  timestamp: Date.now(),
  source: "client"
};
```

##### After

```typescript
const request: OmniRequest = {
  id: "req-123",
  type: "request",
  payload: {
    action: "getUser",
    params: { userId: "user-456" }
  },
  timestamp: new Date().toISOString(),
  source: "client"
};
```

#### Response Messages

##### Before

```typescript
const response: SmartGPTResponse = {
  id: "resp-456",
  type: "response",
  success: true,
  result: { id: "user-456", name: "John" },
  timestamp: Date.now(),
  source: "server"
};
```

##### After

```typescript
const response: OmniResponse = {
  id: "resp-456",
  type: "response",
  payload: {
    success: true,
    data: { id: "user-456", name: "John" }
  },
  timestamp: new Date().toISOString(),
  source: "server",
  correlationId: "req-123"  // Required for responses
};
```

#### Error Responses

##### Before

```typescript
const errorResponse: SmartGPTResponse = {
  id: "resp-789",
  type: "response",
  success: false,
  error: "User not found",
  timestamp: Date.now(),
  source: "server"
};
```

##### After

```typescript
const errorResponse: OmniResponse = {
  id: "resp-789",
  type: "response",
  payload: {
    success: false,
    error: {
      code: "NOT_FOUND",
      message: "User not found",
      details: { userId: "user-456" }
    }
  },
  timestamp: new Date().toISOString(),
  source: "server",
  correlationId: "req-123"
};
```

### Step 4: Update Message Validation

#### Before

```typescript
function validateMessage(message: any): message is SmartGPTMessage {
  return message &&
         typeof message.id === 'string' &&
         typeof message.type === 'string' &&
         typeof message.timestamp === 'number';
}
```

#### After

```typescript
import { validateOmniMessage } from "@promethean/omni-protocol";

function validateMessage(message: unknown) {
  const result = validateOmniMessage(message);
  if (result.success) {
    console.log("Valid message:", result.data);
    return result.data;
  } else {
    console.error("Invalid message:", result.error);
    throw new Error(`Invalid message: ${result.error.message}`);
  }
}
```

### Step 5: Update Message Handlers

#### Before

```typescript
class MessageHandler {
  async handleMessage(message: SmartGPTMessage): Promise<any> {
    switch (message.type) {
      case "request":
        return this.handleRequest(message as SmartGPTRequest);
      case "response":
        return this.handleResponse(message as SmartGPTResponse);
      default:
        throw new Error(`Unknown message type: ${message.type}`);
    }
  }

  private async handleRequest(request: SmartGPTRequest): Promise<SmartGPTResponse> {
    try {
      const result = await this.executeMethod(request.method, request.params);
      return {
        id: `resp-${request.id}`,
        type: "response",
        success: true,
        result,
        timestamp: Date.now(),
        source: "server"
      };
    } catch (error) {
      return {
        id: `resp-${request.id}`,
        type: "response",
        success: false,
        error: error.message,
        timestamp: Date.now(),
        source: "server"
      };
    }
  }
}
```

#### After

```typescript
import {
  OmniMessage,
  OmniRequest,
  OmniResponse,
  OmniEvent,
  validateOmniRequest,
  createRequestId
} from "@promethean/omni-protocol";

class MessageHandler {
  async handleMessage(rawMessage: unknown): Promise<OmniResponse | void> {
    // Validate message first
    const validated = validateOmniMessage(rawMessage);
    if (!validated.success) {
      return this.createErrorResponse(null, "INVALID_REQUEST", validated.error.message);
    }

    const message = validated.data;

    switch (message.type) {
      case "request":
        return this.handleRequest(message as OmniRequest);
      case "event":
        return this.handleEvent(message as OmniEvent);
      default:
        return this.createErrorResponse(
          message.correlationId,
          "UNKNOWN_MESSAGE_TYPE",
          `Unknown message type: ${message.type}`
        );
    }
  }

  private async handleRequest(request: OmniRequest): Promise<OmniResponse> {
    try {
      const result = await this.executeAction(request.payload.action, request.payload.params);

      return {
        id: createRequestId(),
        type: "response",
        payload: {
          success: true,
          data: result
        },
        timestamp: new Date().toISOString(),
        source: "server",
        correlationId: request.id
      };
    } catch (error) {
      return {
        id: createRequestId(),
        type: "response",
        payload: {
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: error.message,
            details: { action: request.payload.action }
          }
        },
        timestamp: new Date().toISOString(),
        source: "server",
        correlationId: request.id
      };
    }
  }

  private async handleEvent(event: OmniEvent): Promise<void> {
    // Handle events asynchronously
    console.log(`Received event: ${event.payload.event}`, event.payload.data);
  }

  private createErrorResponse(
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
      source: "server",
      correlationId: correlationId || ""
    };
  }
}
```

## Advanced Migration Patterns

### 1. Message Transformation Layer

Create a compatibility layer to support gradual migration:

```typescript
import { SmartGPTMessage, SmartGPTRequest, SmartGPTResponse } from "./legacy-types.js";
import { OmniMessage, OmniRequest, OmniResponse, OmniEvent } from "@promethean/omni-protocol";

export class MessageTransformer {
  // Convert legacy SmartGPT to Omni protocol
  static smartGPTToOmni(smartGPTMessage: SmartGPTMessage): OmniMessage {
    const baseMessage = {
      id: smartGPTMessage.id,
      timestamp: new Date(smartGPTMessage.timestamp).toISOString(),
      source: smartGPTMessage.source || "unknown",
      destination: smartGPTMessage.target
    };

    switch (smartGPTMessage.type) {
      case "request":
        const sgRequest = smartGPTMessage as SmartGPTRequest;
        return {
          ...baseMessage,
          type: "request",
          payload: {
            action: sgRequest.method,
            params: sgRequest.params
          }
        } as OmniRequest;

      case "response":
        const sgResponse = smartGPTMessage as SmartGPTResponse;
        return {
          ...baseMessage,
          type: "response",
          payload: {
            success: sgResponse.success,
            data: sgResponse.success ? sgResponse.result : undefined,
            error: !sgResponse.success ? {
              code: "LEGACY_ERROR",
              message: sgResponse.error || "Unknown error"
            } : undefined
          },
          correlationId: sgRequest?.id || ""
        } as OmniResponse;

      default:
        throw new Error(`Unsupported SmartGPT message type: ${smartGPTMessage.type}`);
    }
  }

  // Convert Omni protocol to legacy SmartGPT
  static omniToSmartGPT(omniMessage: OmniMessage): SmartGPTMessage {
    const baseMessage = {
      id: omniMessage.id,
      timestamp: new Date(omniMessage.timestamp).getTime(),
      source: omniMessage.source,
      target: omniMessage.destination
    };

    switch (omniMessage.type) {
      case "request":
        const omniRequest = omniMessage as OmniRequest;
        return {
          ...baseMessage,
          type: "request",
          method: omniRequest.payload.action,
          params: omniRequest.payload.params
        } as SmartGPTRequest;

      case "response":
        const omniResponse = omniMessage as OmniResponse;
        return {
          ...baseMessage,
          type: "response",
          success: omniResponse.payload.success,
          result: omniResponse.payload.success ? omniResponse.payload.data : undefined,
          error: !omniResponse.payload.success ? omniResponse.payload.error?.message : undefined
        } as SmartGPTResponse;

      default:
        throw new Error(`Unsupported Omni message type: ${omniMessage.type}`);
    }
  }
}
```

### 2. Dual Protocol Support

Support both protocols during migration:

```typescript
export class HybridMessageHandler {
  private transformer = MessageTransformer;
  private omniHandler = new OmniMessageHandler();
  private legacyHandler = new SmartGPTMessageHandler();

  async handleMessage(rawMessage: unknown): Promise<any> {
    // Try to detect message format
    if (this.isOmniMessage(rawMessage)) {
      return this.omniHandler.handleMessage(rawMessage);
    } else if (this.isSmartGPTMessage(rawMessage)) {
      // Transform to Omni and handle
      const transformed = this.transformer.smartGPTToOmni(rawMessage);
      const result = await this.omniHandler.handleMessage(transformed);

      // Transform response back to legacy format if needed
      if (this.requiresLegacyResponse(rawMessage)) {
        return this.transformer.omniToSmartGPT(result);
      }

      return result;
    } else {
      throw new Error("Unknown message format");
    }
  }

  private isOmniMessage(message: any): boolean {
    return message &&
           typeof message.id === 'string' &&
           typeof message.type === 'string' &&
           message.payload !== undefined &&
           typeof message.timestamp === 'string';
  }

  private isSmartGPTMessage(message: any): boolean {
    return message &&
           typeof message.id === 'string' &&
           typeof message.type === 'string' &&
           typeof message.timestamp === 'number';
  }

  private requiresLegacyResponse(request: any): boolean {
    // Determine if the caller expects legacy format
    return request.headers?.['accept-protocol'] === 'smartgpt';
  }
}
```

## Testing Migration

### 1. Parallel Testing

Run both implementations in parallel and compare results:

```typescript
export class MigrationTester {
  private legacyHandler = new SmartGPTMessageHandler();
  private newHandler = new OmniMessageHandler();
  private transformer = new MessageTransformer();

  async testMessage(message: any): Promise<{
    legacy: any;
    new: any;
    match: boolean;
    differences: string[];
  }> {
    // Test legacy handler
    const legacyResult = await this.legacyHandler.handleMessage(message);

    // Convert to Omni format and test new handler
    const omniMessage = this.transformer.smartGPTToOmni(message);
    const newResult = await this.newHandler.handleMessage(omniMessage);

    // Convert new result back to legacy format for comparison
    const newLegacyResult = this.transformer.omniToSmartGPT(newResult);

    // Compare results
    const differences = this.compareResults(legacyResult, newLegacyResult);
    const match = differences.length === 0;

    return {
      legacy: legacyResult,
      new: newResult,
      match,
      differences
    };
  }

  private compareResults(legacy: any, newResult: any): string[] {
    const differences: string[] = [];

    // Compare structure and content
    if (legacy.id !== newResult.id) {
      differences.push(`ID mismatch: ${legacy.id} vs ${newResult.id}`);
    }

    if (legacy.type !== newResult.type) {
      differences.push(`Type mismatch: ${legacy.type} vs ${newResult.type}`);
    }

    // Add more comparison logic as needed

    return differences;
  }
}
```

### 2. Load Testing

Ensure the new implementation performs well under load:

```typescript
export class LoadTester {
  async testConcurrentRequests(
    handler: any,
    requests: any[],
    concurrency = 10
  ): Promise<{
    totalTime: number;
    averageTime: number;
    errors: number;
    successRate: number;
  }> {
    const startTime = Date.now();
    const results = await Promise.allSettled(
      requests.map(req => handler.handleMessage(req))
    );
    const endTime = Date.now();

    const errors = results.filter(r => r.status === 'rejected').length;
    const successRate = ((results.length - errors) / results.length) * 100;
    const totalTime = endTime - startTime;
    const averageTime = totalTime / results.length;

    return {
      totalTime,
      averageTime,
      errors,
      successRate
    };
  }
}
```

## Migration Checklist

### Pre-Migration

- [ ] Audit current SmartGPT bridge usage
- [ ] Identify all message types and patterns
- [ ] Create comprehensive test suite
- [ ] Set up parallel testing environment
- [ ] Document all custom message formats

### Migration Phase

- [ ] Update package dependencies
- [ ] Create message transformation layer
- [ ] Update message creation code
- [ ] Update message handling code
- [ ] Add validation for all messages
- [ ] Update error handling

### Testing Phase

- [ ] Run parallel tests for all message types
- [ ] Perform load testing
- [ ] Test error scenarios
- [ ] Validate backward compatibility
- [ ] Test integration with external systems

### Post-Migration

- [ ] Remove legacy dependencies
- [ ] Clean up transformation layer
- [ ] Update documentation
- [ ] Monitor performance
- [ ] Update deployment configurations

## Common Migration Issues

### 1. Timestamp Format Changes

**Issue**: SmartGPT used Unix timestamps (numbers), Omni uses ISO strings.

**Solution**: Always convert timestamps to ISO strings when creating Omni messages.

```typescript
// Before
timestamp: Date.now()

// After
timestamp: new Date().toISOString()
```

### 2. Required Field Changes

**Issue**: Some fields that were optional in SmartGPT are required in Omni.

**Solution**: Ensure all required fields are present:

```typescript
// Omni requires source field
source: message.source || "unknown"

// Responses require correlationId
correlationId: request.id
```

### 3. Error Structure Changes

**Issue**: SmartGPT used string errors, Omni uses structured error objects.

**Solution**: Convert string errors to structured format:

```typescript
// Before
error: "User not found"

// After
error: {
  code: "NOT_FOUND",
  message: "User not found",
  details: { userId: "user-456" }
}
```

### 4. Method vs Action

**Issue**: SmartGPT used "method" field, Omni uses "action" in payload.

**Solution**: Map method names to action names:

```typescript
// Before
method: "getUser"

// After
payload: {
  action: "getUser"
}
```

## Rollback Strategy

If issues arise during migration, have a rollback plan:

1. **Feature Flags**: Use feature flags to switch between protocols
2. **Dual Support**: Keep both implementations running
3. **Message Queue**: Buffer messages during transition
4. **Monitoring**: Add alerts for protocol-specific errors
5. **Gradual Rollout**: Migrate service by service, not all at once

```typescript
export class ProtocolManager {
  constructor(
    private useOmniProtocol = false,
    private legacyHandler: SmartGPTMessageHandler,
    private omniHandler: OmniMessageHandler
  ) {}

  async handleMessage(message: any): Promise<any> {
    if (this.useOmniProtocol) {
      return this.omniHandler.handleMessage(message);
    } else {
      return this.legacyHandler.handleMessage(message);
    }
  }

  setProtocol(useOmni: boolean): void {
    this.useOmniProtocol = useOmni;
    console.log(`Switched to ${useOmni ? 'Omni' : 'SmartGPT'} protocol`);
  }
}
```

This comprehensive migration guide ensures a smooth transition from SmartGPT bridge to Omni protocol while maintaining system stability and functionality.