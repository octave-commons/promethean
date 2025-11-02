# {{service-name}} Service

{{service-description}}

## Overview

The `{{service-name}}` service provides {{service-purpose}}.

**Service Type**: {{service-type}}
**Port**: {{service-port}}
**Health Endpoint**: `/health`

## 🚀 Quick Start

### Installation

```bash
cd packages/{{package-name}}
pnpm install
```

### Running the Service

```bash
# Development mode
pnpm dev

# Production mode
pnpm start

# With PM2
pnpm pm2:start
```

### Health Check

```bash
curl http://localhost:{{service-port}}/health
```

## 📁 Implementation

### Core Files
- **Main Entry**: [`src/index.ts`](../../../packages/{{package-name}}/src/index.ts)
- **Service Logic**: [`src/service.ts`](../../../packages/{{package-name}}/src/service.ts)
- **Routes**: [`src/routes.ts`](../../../packages/{{package-name}}/src/routes.ts)
- **Types**: [`src/types.ts`](../../../packages/{{package-name}}/src/types.ts)

### Key Classes & Functions
- **ServiceClass**: [`ServiceClass`](../../../packages/{{package-name}}/src/service.ts#L{{service-class-line}}) - Main service logic
- **setupRoutes()**: [`setupRoutes()`](../../../packages/{{package-name}}/src/routes.ts#L{{setup-routes-line}}) - Route configuration
- **healthCheck()**: [`healthCheck()`](../../../packages/{{package-name}}/src/service.ts#L{{health-check-line}}) - Health endpoint

### View Source
- **GitHub**: [View on GitHub](https://github.com/promethean-ai/promethean/tree/main/packages/{{package-name}}/src)
- **VS Code**: [Open in VS Code](vscode://file/packages/{{package-name}}/src)

## 📚 API Reference

### Endpoints

#### GET /health
**Location**: [`src/routes.ts`](../../../packages/{{package-name}}/src/routes.ts#L{{health-route-line}})

**Description**: Service health check endpoint.

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-01T12:00:00Z",
  "service": "{{service-name}}"
}
```

{{additional-endpoints}}

### Classes

#### ServiceClass
**Location**: [`src/service.ts`](../../../packages/{{package-name}}/src/service.ts#L{{service-class-line}})

**Description**: Main service class handling core functionality.

**Methods**:
- [`constructor()`](../../../packages/{{package-name}}/src/service.ts#L{{constructor-line}}) - Initialize service
- [`start()`](../../../packages/{{package-name}}/src/service.ts#L{{start-line}}) - Start the service
- [`stop()`](../../../packages/{{package-name}}/src/service.ts#L{{stop-line}}) - Stop the service

## Configuration

### Environment Variables

```bash
# Service Configuration
{{env-vars-list}}
```

### Configuration File

```typescript
{{config-interface}}
```

## Development Status

{{development-status}}

## Dependencies

{{dependencies-list}}

## Related Services

{{related-services}}

## Monitoring

### Metrics
- **Health Checks**: Automated health monitoring
- **Performance**: Response time and throughput metrics
- **Errors**: Error rate and type tracking

### Logs
- **Service Logs**: Application-level logging
- **Access Logs**: HTTP request/response logging
- **Error Logs**: Detailed error tracking

---

*Last updated: {{last-updated-date}}*