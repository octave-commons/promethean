---
uuid: 'config-validation-schemas-002'
title: 'Define Configuration Schemas for Pantheon Packages (Phase 2)'
slug: 'config-validation-schemas-002'
status: 'ready'
priority: 'P1'
storyPoints: 13
lastCommitSha: 'pending'
labels: ['pantheon', 'configuration', 'schemas', 'zod', 'validation']
created_at: '2025-10-26T18:50:00Z'
estimates:
  complexity: 'medium-high'
---

# Define Configuration Schemas for Pantheon Packages (Phase 2)

## Description

Define comprehensive Zod schemas for all pantheon packages based on their current configuration patterns. This phase creates standardized schema definitions that will be used by the validation framework from Phase 1.

## Package Schema Requirements

### 1. pantheon-core

```typescript
export const CoreConfigSchema = z.object({
  // Agent orchestrator configuration
  orchestrator: z
    .object({
      maxConcurrentAgents: z.number().min(1).default(10),
      defaultTimeout: z.number().min(1000).default(30000),
      retryPolicy: z
        .object({
          maxRetries: z.number().min(0).default(3),
          backoffMultiplier: z.number().min(1).default(2),
          initialDelay: z.number().min(100).default(1000),
        })
        .default({}),
    })
    .default({}),

  // Transport configuration
  transport: z.object({
    type: z.enum(['amqp', 'websocket', 'http']),
    url: z.string().url(),
    auth: z
      .object({
        type: z.enum(['none', 'basic', 'token', 'certificate']),
        credentials: z.record(z.any()).optional(),
      })
      .default({ type: 'none' }),
    reconnect: z
      .object({
        enabled: z.boolean().default(true),
        maxAttempts: z.number().min(0).default(5),
        delay: z.number().min(0).default(1000),
        backoff: z.enum(['linear', 'exponential']).default('exponential'),
      })
      .default({}),
  }),

  // Logging configuration
  logging: z
    .object({
      level: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
      format: z.enum(['json', 'text']).default('json'),
      outputs: z.array(z.enum(['console', 'file', 'remote'])).default(['console']),
      file: z
        .object({
          path: z.string(),
          maxSize: z.string().default('10MB'),
          maxFiles: z.number().min(1).default(5),
        })
        .optional(),
    })
    .default({}),
});
```

### 2. pantheon-persistence

```typescript
export const PersistenceConfigSchema = z.object({
  // Database configuration
  database: z.object({
    type: z.enum(['mongodb', 'postgresql', 'sqlite']),
    url: z.string().min(1),
    name: z.string().min(1).default('pantheon'),
    maxConnections: z.number().min(1).default(10),
    connectionTimeout: z.number().min(1000).default(5000),
    ssl: z.boolean().default(false),
    sslOptions: z.record(z.any()).optional(),
  }),

  // Caching configuration
  cache: z
    .object({
      enabled: z.boolean().default(true),
      ttl: z.number().min(1000).default(60000),
      maxSize: z.number().min(1).default(100),
      strategy: z.enum(['lru', 'fifo', 'lfu']).default('lru'),
      redis: z
        .object({
          url: z.string().url(),
          keyPrefix: z.string().default('pantheon:'),
          ttl: z.number().min(0).optional(),
        })
        .optional(),
    })
    .default({}),

  // Dual store configuration
  dualStore: z
    .object({
      enabled: z.boolean().default(true),
      primaryType: z.enum(['memory', 'file', 'database']),
      secondaryType: z.enum(['memory', 'file', 'database']),
      syncInterval: z.number().min(1000).default(5000),
      conflictResolution: z
        .enum(['primary-wins', 'secondary-wins', 'timestamp'])
        .default('primary-wins'),
    })
    .default({}),
});
```

### 3. pantheon-protocol

```typescript
export const ProtocolConfigSchema = z.object({
  // Message envelope configuration
  envelope: z
    .object({
      defaultPriority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
      defaultTtl: z.number().min(1000).default(300000),
      maxRetries: z.number().min(0).default(3),
      enableSigning: z.boolean().default(false),
      signingKey: z.string().min(1).optional(),
    })
    .default({}),

  // Transport configuration (extends base)
  transport: z.object({
    type: z.enum(['amqp', 'websocket', 'http']),
    url: z.string().url(),
    options: z.record(z.any()).optional(),
    auth: z
      .object({
        type: z.enum(['none', 'basic', 'token', 'certificate']),
        credentials: z.record(z.any()).optional(),
      })
      .default({ type: 'none' }),
    reconnect: z
      .object({
        enabled: z.boolean().default(true),
        maxAttempts: z.number().min(0).default(5),
        delay: z.number().min(0).default(1000),
        backoff: z.enum(['linear', 'exponential']).default('exponential'),
      })
      .default({}),
    queue: z
      .object({
        name: z.string().min(1),
        durable: z.boolean().default(true),
        exclusive: z.boolean().default(false),
        autoDelete: z.boolean().default(false),
        arguments: z.record(z.any()).optional(),
      })
      .optional(),
  }),

  // Security configuration
  security: z
    .object({
      enableEncryption: z.boolean().default(false),
      encryptionKey: z.string().min(32).optional(),
      enableSignatureVerification: z.boolean().default(false),
      trustedKeys: z.array(z.string()).default([]),
    })
    .default({}),
});
```

### 4. pantheon-logger

```typescript
export const LoggerConfigSchema = z.object({
  // Core logging configuration
  level: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
  format: z.enum(['json', 'text', 'pretty']).default('json'),
  timestamp: z.boolean().default(true),
  colorize: z.boolean().default(false),

  // Output configuration
  outputs: z
    .array(
      z.object({
        type: z.enum(['console', 'file', 'remote', 'database']),
        level: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).optional(),
        format: z.enum(['json', 'text', 'pretty']).optional(),
        config: z.record(z.any()).optional(),
      }),
    )
    .default([{ type: 'console' }]),

  // File output configuration
  file: z
    .object({
      path: z.string(),
      maxSize: z.string().default('10MB'),
      maxFiles: z.number().min(1).default(5),
      rotation: z.enum(['daily', 'weekly', 'monthly', 'size']).default('size'),
      compression: z.boolean().default(true),
    })
    .optional(),

  // Remote logging configuration
  remote: z
    .object({
      endpoint: z.string().url(),
      apiKey: z.string().min(1).optional(),
      batchSize: z.number().min(1).default(100),
      flushInterval: z.number().min(1000).default(5000),
      retryAttempts: z.number().min(0).default(3),
    })
    .optional(),

  // Structured logging
  structured: z
    .object({
      enableMetadata: z.boolean().default(true),
      enableStackTrace: z.boolean().default(false),
      enablePerformanceMetrics: z.boolean().default(false),
      customFields: z.record(z.string()).default({}),
    })
    .default({}),
});
```

### 5. pantheon-auth

```typescript
export const AuthConfigSchema = z.object({
  // JWT configuration
  jwt: z.object({
    secret: z.string().min(32),
    algorithm: z.enum(['HS256', 'HS384', 'HS512', 'RS256', 'RS384', 'RS512']).default('HS256'),
    expiration: z
      .string()
      .regex(/^\d+[smhd]$/)
      .default('1h'),
    refreshExpiration: z
      .string()
      .regex(/^\d+[smhd]$/)
      .default('7d'),
    issuer: z.string().optional(),
    audience: z.array(z.string()).default([]),
  }),

  // Authentication providers
  providers: z
    .array(
      z.object({
        name: z.string().min(1),
        type: z.enum(['local', 'oauth2', 'ldap', 'saml']),
        enabled: z.boolean().default(true),
        config: z.record(z.any()),
      }),
    )
    .default([]),

  // Password policies
  passwordPolicy: z
    .object({
      minLength: z.number().min(6).default(8),
      requireUppercase: z.boolean().default(true),
      requireLowercase: z.boolean().default(true),
      requireNumbers: z.boolean().default(true),
      requireSymbols: z.boolean().default(false),
      maxAge: z.number().min(0).optional(),
      historyCount: z.number().min(0).default(5),
    })
    .default({}),

  // Session configuration
  session: z
    .object({
      store: z.enum(['memory', 'redis', 'database']).default('memory'),
      ttl: z.number().min(60000).default(3600000),
      secret: z.string().min(32),
      rolling: z.boolean().default(true),
      secure: z.boolean().default(false),
      sameSite: z.enum(['strict', 'lax', 'none']).default('lax'),
    })
    .default({}),
});
```

## Implementation Tasks

### 1. Schema Creation

- [ ] Create schema files for each pantheon package
- [ ] Define environment variable mappings
- [ ] Add validation rules and custom validators
- [ ] Implement default value management

### 2. Schema Composition

- [ ] Create reusable schema builders
- [ ] Implement schema inheritance patterns
- [ ] Add schema composition utilities
- [ ] Create schema validation helpers

### 3. Documentation Generation

- [ ] Generate JSON schemas for IDE support
- [ ] Create configuration documentation
- [ ] Add environment variable reference
- [ ] Generate validation rule documentation

### 4. Testing & Validation

- [ ] Create comprehensive test suites for each schema
- [ ] Add integration tests with real configurations
- [ ] Test environment variable loading
- [ ] Validate error message quality

## Acceptance Criteria

### Schema Coverage

- [ ] All pantheon packages have defined schemas
- [ ] All existing configuration options covered
- [ ] Environment variable mappings complete
- [ ] Default values properly defined

### Validation Quality

- [ ] All schemas use appropriate Zod validators
- [ ] Custom validators for complex validation rules
- [ ] Clear error messages for invalid configurations
- [ ] Proper handling of sensitive data

### Developer Experience

- [ ] TypeScript types automatically inferred
- [ ] IDE auto-completion for configuration
- [ ] Comprehensive documentation generated
- [ ] Migration guides for existing configurations

## Technical Implementation

### File Structure

```
packages/pantheon-config-validator/src/schemas/
├── core.ts
├── persistence.ts
├── protocol.ts
├── logger.ts
├── auth.ts
├── index.ts
└── builders/
    ├── database.ts
    ├── auth.ts
    ├── logging.ts
    └── transport.ts
```

### Environment Variable Mapping

```typescript
export const ENV_MAPPINGS = {
  core: {
    PANTHEON_MAX_CONCURRENT_AGENTS: 'orchestrator.maxConcurrentAgents',
    PANTHEON_DEFAULT_TIMEOUT: 'orchestrator.defaultTimeout',
    PANTHEON_LOG_LEVEL: 'logging.level',
    PANTHEON_TRANSPORT_TYPE: 'transport.type',
    PANTHEON_TRANSPORT_URL: 'transport.url',
  },
  persistence: {
    DATABASE_URL: 'database.url',
    DATABASE_NAME: 'database.name',
    DATABASE_MAX_CONNECTIONS: 'database.maxConnections',
    CACHE_TTL: 'cache.ttl',
    CACHE_MAX_SIZE: 'cache.maxSize',
  },
  // ... other mappings
};
```

## Success Metrics

- **Coverage**: 100% of configuration options have schemas
- **Validation**: All invalid configurations caught with clear errors
- **Migration**: Zero breaking changes for existing configurations
- **Documentation**: Auto-generated docs cover all options

## Dependencies

- Phase 1: Configuration Validation Framework
- Existing package configuration analysis
- Environment variable naming conventions
- Package maintainers for validation requirements

## Risks & Mitigations

**Risk**: Missing configuration options in schemas
**Mitigation**: Comprehensive testing and package maintainer review

**Risk**: Complex validation rules
**Mitigation**: Custom validators with clear error messages

**Risk**: Breaking existing configurations
**Mitigation**: Backward compatibility and migration utilities

## Notes

This phase establishes the contract for configuration across all pantheon packages. The schemas will serve as the source of truth for both validation and documentation.

## Related Issues

- Parent: config-validation-pantheon-001
- Dependency: config-validation-framework-001 (Phase 1)
- Prerequisite for: Package Integration (Phase 3)
