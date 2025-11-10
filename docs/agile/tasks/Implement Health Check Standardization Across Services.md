---
uuid: 'eeb1fc4d-subtask-003'
title: 'Implement Standardization Across Services'
slug: 'implement-health-check-standardization-across-services'
status: 'breakdown'
priority: 'P1'
labels: ['health', 'monitoring', 'implementation', 'standardization']
created_at: '2025-10-28T00:00:00Z'
estimates:
  complexity: '3'
  scale: 'medium'
  time_to_completion: '2 sessions'
storyPoints: 3
---

# Implement Health Check Standardization Across Services

## 🎯 Objective

Implement the standardized health check interface across all identified Promethean services, ensuring consistency while maintaining backward compatibility.

## 📋 Scope

### Services to Standardize

Based on inventory findings, update the following services:

#### **1. @promethean-os/web-utils** (Priority: High)

- Current: Basic health check utilities
- Target: Enhanced with standardized interface
- Impact: Foundation package used by many services

#### **2. @promethean-os/file-indexer-service** (Priority: High)

- Current: Simple health endpoint
- Target: Full standardized implementation
- Impact: Core service dependency

#### **3. @promethean-os/health-service** (Priority: Medium)

- Current: Dedicated health service
- Target: Reference implementation
- Impact: Centralized health monitoring

#### **4. Additional Services** (Priority: Medium)

- Identify and update other services with health checks
- Ensure consistent implementation across ecosystem

### Implementation Requirements

#### **Standardized Package Structure**

```typescript
// packages/health-utils/src/index.ts
export {
  StandardHealthCheckResponse,
  HealthCheck,
  DependencyHealth,
  HealthCheckOptions,
  HealthCheckFunction,
  StandardHealthChecker,
  HealthCheckRegistry,
} from './interfaces/health-check.js';

export { registerHealthRoute, registerDiagnosticsRoute } from './implementation/registry.js';
```

#### **Service Migration Pattern**

```typescript
// Before: Simple health check
app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// After: Standardized health check
import { registerHealthRoute } from '@promethean-os/health-utils';

await registerHealthRoute(app, {
  serviceName: 'file-indexer-service',
  version: '1.0.0',
  checks: [
    new DatabaseHealthCheck(database),
    new FileSystemHealthCheck('/data'),
    new MemoryHealthCheck(),
  ],
  dependencies: [new DatabaseDependencyChecker(database), new RedisDependencyChecker(redis)],
});
```

## 🔧 Implementation Details

### Phase 1: Create Health Utils Package

#### **Package Setup**

```json
{
  "name": "@promethean-os/health-utils",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "dependencies": {
    "@promethean-os/types": "workspace:*"
  },
  "devDependencies": {
    "ava": "^6.4.1",
    "typescript": "^5.0.0"
  }
}
```

#### **Core Implementation**

```typescript
// packages/health-utils/src/implementation/health-checker.ts
export class StandardHealthChecker {
  constructor(private options: HealthCheckOptions) {}

  async checkHealth(): Promise<StandardHealthCheckResponse> {
    const startTime = Date.now();

    try {
      const checks = await this.executeChecks();
      const dependencies = await this.checkDependencies();
      const status = this.calculateOverallStatus(checks, dependencies);

      return {
        status,
        timestamp: new Date().toISOString(),
        service: this.options.serviceName,
        version: this.options.version,
        checks,
        dependencies,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        service: this.options.serviceName,
        version: this.options.version,
        checks: [
          {
            name: 'health-check-error',
            status: 'fail',
            message: error.message,
            details: { stack: error.stack },
          },
        ],
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        duration: Date.now() - startTime,
      };
    }
  }

  private async executeChecks(): Promise<HealthCheck[]> {
    if (!this.options.checks) return [];

    const results = await Promise.allSettled(
      this.options.checks.map(async (check, index) => {
        const start = Date.now();
        try {
          const result = await check();
          return {
            ...result,
            duration: Date.now() - start,
          };
        } catch (error) {
          return {
            name: `check-${index}`,
            status: 'fail' as const,
            message: error.message,
            duration: Date.now() - start,
          };
        }
      }),
    );

    return results.map((result) =>
      result.status === 'fulfilled'
        ? result.value
        : {
            name: 'unknown-check',
            status: 'fail' as const,
            message: result.reason?.message || 'Check failed',
          },
    );
  }
}
```

### Phase 2: Built-in Health Checks

#### **Database Health Check**

```typescript
export class DatabaseHealthCheck implements HealthCheckFunction {
  constructor(private db: Database) {}

  async execute(): Promise<HealthCheck> {
    const start = Date.now();
    try {
      await this.db.query('SELECT 1');
      return {
        name: 'database',
        status: 'pass',
        duration: Date.now() - start,
        message: 'Database connection successful',
      };
    } catch (error) {
      return {
        name: 'database',
        status: 'fail',
        duration: Date.now() - start,
        message: `Database connection failed: ${error.message}`,
      };
    }
  }
}
```

#### **Memory Health Check**

```typescript
export class MemoryHealthCheck implements HealthCheckFunction {
  constructor(private threshold: number = 0.9) {}

  async execute(): Promise<HealthCheck> {
    const usage = process.memoryUsage();
    const heapUsedRatio = usage.heapUsed / usage.heapTotal;

    return {
      name: 'memory',
      status: heapUsedRatio > this.threshold ? 'warn' : 'pass',
      message: `Memory usage: ${(heapUsedRatio * 100).toFixed(1)}%`,
      details: {
        heapUsed: usage.heapUsed,
        heapTotal: usage.heapTotal,
        external: usage.external,
        threshold: this.threshold,
      },
    };
  }
}
```

#### **File System Health Check**

```typescript
export class FileSystemHealthCheck implements HealthCheckFunction {
  constructor(private path: string) {}

  async execute(): Promise<HealthCheck> {
    const start = Date.now();
    try {
      await fs.access(this.path, fs.constants.R_OK | fs.constants.W_OK);
      const stats = await fs.stat(this.path);

      return {
        name: 'filesystem',
        status: 'pass',
        duration: Date.now() - start,
        message: `File system accessible at ${this.path}`,
        details: {
          path: this.path,
          accessible: true,
          lastModified: stats.mtime,
        },
      };
    } catch (error) {
      return {
        name: 'filesystem',
        status: 'fail',
        duration: Date.now() - start,
        message: `File system inaccessible: ${error.message}`,
        details: { path: this.path },
      };
    }
  }
}
```

### Phase 3: Service Migrations

#### **Web Utils Migration**

```typescript
// packages/web-utils/src/health.ts
import { registerHealthRoute, StandardHealthChecker } from '@promethean-os/health-utils';

// Enhanced health check utilities with backward compatibility
export function createHealthCheck(
  serviceName: string = 'promethean-service',
): () => HealthCheckResponse {
  const checker = new StandardHealthChecker({ serviceName });
  return () => checker.checkHealth();
}

// Enhanced route registration with new features
export async function registerHealthRoute(
  fastify: FastifyInstance,
  options: { readonly serviceName?: string } = {},
): Promise<void> {
  await registerHealthRoute(fastify, {
    serviceName: options.serviceName || 'promethean-service',
    checks: [new MemoryHealthCheck(), new FileSystemHealthCheck(process.cwd())],
  });
}
```

#### **File Indexer Service Migration**

```typescript
// packages/file-indexer-service/src/service.ts
import {
  registerHealthRoute,
  DatabaseHealthCheck,
  FileSystemHealthCheck,
} from '@promethean-os/health-utils';

export class FileIndexerService {
  constructor(
    private indexer: FileIndexer,
    private db?: Database,
  ) {
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Standardized health route
    registerHealthRoute(this.app, {
      serviceName: 'file-indexer-service',
      version: '1.0.0',
      checks: [
        new FileSystemHealthCheck('/data'),
        ...(this.db ? [new DatabaseHealthCheck(this.db)] : []),
      ],
    });

    // Keep existing routes for backward compatibility
    this.setupSearchRoutes();
    this.setupIndexRoutes();
  }
}
```

## ✅ Acceptance Criteria

1. **Health Utils Package Created**

   - Complete implementation of standardized interface
   - Built-in health checks for common scenarios
   - Comprehensive test coverage

2. **Service Migrations Complete**

   - All identified services updated
   - Backward compatibility maintained
   - Enhanced health information provided

3. **Documentation Updated**

   - Migration guides for each service
   - Usage examples and best practices
   - API documentation updated

4. **Testing Validation**
   - All services pass health check tests
   - Backward compatibility verified
   - Performance impact measured

## 🧪 Testing Requirements

### Integration Tests

```typescript
describe('Health Check Standardization', () => {
  test('web-utils backward compatibility', async () => {
    const app = fastify();
    await registerHealthRoute(app, { serviceName: 'test' });

    const response = await app.inject({ method: 'GET', url: '/health' });
    expect(response.json()).toHaveProperty('status');
    expect(response.json()).toHaveProperty('timestamp');
    expect(response.json()).toHaveProperty('service');
  });

  test('file-indexer-service enhanced health', async () => {
    const service = new FileIndexerService(indexer, database);
    const health = await service.getHealth();

    expect(health.checks).toBeDefined();
    expect(health.checks.some((c) => c.name === 'filesystem')).toBe(true);
    expect(health.checks.some((c) => c.name === 'database')).toBe(true);
  });
});
```

### Performance Tests

```typescript
describe('Health Check Performance', () => {
  test('health checks complete within 100ms', async () => {
    const start = Date.now();
    const health = await checker.checkHealth();
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(100);
    expect(health.duration).toBeLessThan(100);
  });
});
```

## 📁 File Structure

```
packages/health-utils/
├── src/
│   ├── interfaces/
│   │   ├── health-check.ts
│   │   ├── dependency.ts
│   │   └── registry.ts
│   ├── implementation/
│   │   ├── health-checker.ts
│   │   ├── registry.ts
│   │   └── checks/
│   │       ├── database.ts
│   │       ├── memory.ts
│   │       ├── filesystem.ts
│   │       └── index.ts
│   └── index.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── performance/
└── package.json

# Updated services
packages/web-utils/src/health.ts          # Enhanced with new features
packages/file-indexer-service/src/        # Updated with standardized health
packages/health-service/src/              # Reference implementation
```

## 🔗 Dependencies

- Interface design task completion
- Service access and permissions
- Testing infrastructure
- Documentation tools

## 🚀 Deliverables

1. **@promethean-os/health-utils Package** - Complete standardized health check implementation
2. **Updated Services** - All services using standardized interface
3. **Migration Documentation** - Step-by-step guides for each service
4. **Test Suites** - Comprehensive testing for all implementations
5. **Performance Benchmarks** - Health check performance measurements

## ⏱️ Timeline

**Estimated Time**: 2 sessions (4-8 hours)
**Dependencies**: Interface design completion
**Blockers**: None

## 🎯 Success Metrics

- ✅ All services using standardized health check interface
- ✅ Backward compatibility maintained for existing clients
- ✅ Enhanced health information available across services
- ✅ Performance impact minimal (<10ms overhead)
- ✅ Comprehensive test coverage achieved

---

## 📝 Notes

This implementation task delivers tangible value by standardizing health checks across the entire Promethean ecosystem. The phased approach ensures gradual adoption while maintaining system stability. The enhanced health information will improve monitoring, debugging, and operational visibility across all services.
