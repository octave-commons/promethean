---
uuid: 'config-validation-integration-003'
title: 'Integrate Configuration Validation Across Pantheon Packages (Phase 3)'
slug: 'config-validation-integration-003'
status: 'ready'
priority: 'P1'
storyPoints: 21
lastCommitSha: 'pending'
labels: ['pantheon', 'configuration', 'integration', 'migration', 'validation']
created_at: '2025-10-26T18:55:00Z'
estimates:
  complexity: 'high'
---

# Integrate Configuration Validation Across Pantheon Packages (Phase 3)

## Description

Update all pantheon packages to use the standardized configuration validation framework and schemas. This phase involves migrating existing configuration handling, replacing validation logic, and ensuring backward compatibility.

## Package Integration Strategy

### 1. pantheon-core Integration

```typescript
// Before: Basic TypeScript interfaces
export interface AgentOrchestratorConfig {
  maxConcurrentAgents?: number;
  defaultTimeout?: number;
}

// After: Validated configuration with framework
import { createConfigValidator } from '@promethean-os/pantheon-config-validator';
import { CoreConfigSchema } from '@promethean-os/pantheon-config-validator/schemas';

export const coreConfigValidator = createConfigValidator(CoreConfigSchema);

export function createCoreConfig(config?: unknown): CoreConfig {
  const result = coreConfigValidator.validate(config);
  if (!result.isValid) {
    throw new ConfigurationError('Invalid core configuration', result.errors);
  }
  return result.data;
}

export function loadCoreConfigFromEnv(): CoreConfig {
  const result = coreConfigValidator.loadFromEnv('PANTHEON_');
  if (!result.isValid) {
    throw new ConfigurationError('Invalid environment configuration', result.errors);
  }
  return result.data;
}
```

### 2. pantheon-persistence Integration

```typescript
// Before: Basic interface with manual validation
export interface CacheConfig {
  ttl?: number;
  maxSize?: number;
}

// After: Framework-based validation
import { createConfigValidator } from '@promethean-os/pantheon-config-validator';
import { PersistenceConfigSchema } from '@promethean-os/pantheon-config-validator/schemas';

export const persistenceConfigValidator = createConfigValidator(PersistenceConfigSchema);

export function createPersistenceAdapter(deps: Dependencies, config?: unknown) {
  const result = persistenceConfigValidator.validate(config);
  if (!result.isValid) {
    throw new ConfigurationError('Invalid persistence configuration', result.errors);
  }

  const validatedConfig = result.data;

  // Initialize with validated configuration
  return new PantheonPersistenceAdapter(deps, validatedConfig);
}
```

### 3. pantheon-protocol Integration

```typescript
// Before: Existing Zod schemas (keep but extend)
export const TransportConfigSchema = z.object({
  type: z.enum(['amqp', 'websocket', 'http']),
  url: z.string(),
  // ... existing fields
});

// After: Enhanced with framework features
import { createSecureValidator } from '@promethean-os/pantheon-config-validator';
import { ProtocolConfigSchema } from '@promethean-os/pantheon-config-validator/schemas';

export const protocolConfigValidator = createSecureValidator(ProtocolConfigSchema, {
  maskValues: true,
  excludeFromLogs: ['auth.credentials', 'security.encryptionKey'],
});

export function createTransport(config?: unknown) {
  const result = protocolConfigValidator.validate(config);
  if (!result.isValid) {
    throw new ConfigurationError('Invalid transport configuration', result.errors);
  }

  const validatedConfig = result.data;

  switch (validatedConfig.transport.type) {
    case 'amqp':
      return new AMQPTransport(validatedConfig.transport);
    case 'websocket':
      return new WebSocketTransport(validatedConfig.transport);
    case 'http':
      return new HTTPTransport(validatedConfig.transport);
    default:
      throw new ConfigurationError(`Unsupported transport type: ${validatedConfig.transport.type}`);
  }
}
```

## Implementation Tasks

### 1. Package Updates

- [ ] Update pantheon-core to use validation framework
- [ ] Update pantheon-persistence to use validation framework
- [ ] Update pantheon-protocol to use enhanced validation
- [ ] Update pantheon-logger to use validation framework
- [ ] Update pantheon-auth to use validation framework
- [ ] Update remaining pantheon packages

### 2. Migration Support

- [ ] Create backward compatibility layer
- [ ] Implement configuration migration utilities
- [ ] Add deprecation warnings for old patterns
- [ ] Create configuration validation CLI tool

### 3. Testing & Validation

- [ ] Update existing tests to use new validation
- [ ] Add integration tests for all packages
- [ ] Test migration scenarios
- [ ] Validate error handling and messages

### 4. Documentation & Examples

- [ ] Update package documentation
- [ ] Create migration guides
- [ ] Add configuration examples
- [ ] Update README files

## Migration Strategy

### Phase 3.1: Framework Integration (Story Points: 8)

- Add validation framework as dependency
- Implement configuration validators
- Update package initialization code
- Add basic error handling

### Phase 3.2: Backward Compatibility (Story Points: 5)

- Create compatibility layer for existing configs
- Implement gradual migration path
- Add deprecation warnings
- Test existing functionality

### Phase 3.3: Testing & Documentation (Story Points: 8)

- Update test suites
- Add integration tests
- Create migration documentation
- Update package examples

## Acceptance Criteria

### Integration Success

- [ ] All pantheon packages use validation framework
- [ ] Existing functionality preserved
- [ ] Improved error messages and validation
- [ ] Environment variable integration working

### Backward Compatibility

- [ ] Existing configurations continue to work
- [ ] Clear migration path provided
- [ ] Deprecation warnings for old patterns
- [ ] Zero breaking changes for current users

### Quality Assurance

- [ ] All tests pass with new validation
- [ ] Integration tests cover migration scenarios
- [ ] Performance impact minimal (<5% overhead)
- [ ] Security audit passed for sensitive data

## Technical Implementation

### Package Structure Updates

```
packages/pantheon-core/
├── src/
│   ├── config/
│   │   ├── validator.ts
│   │   ├── loader.ts
│   │   └── types.ts
│   └── index.ts
├── tests/
│   ├── config/
│   │   ├── validation.test.ts
│   │   ├── migration.test.ts
│   │   └── integration.test.ts
│   └── ...
└── package.json (updated dependencies)
```

### Migration Utilities

```typescript
// Migration helper for existing configurations
export function migrateLegacyConfig(legacyConfig: any, targetSchema: z.ZodSchema) {
  const migrationMap = {
    // Map old property names to new ones
    maxAgents: 'orchestrator.maxConcurrentAgents',
    timeout: 'orchestrator.defaultTimeout',
    logLevel: 'logging.level',
    // ... other mappings
  };

  const migratedConfig = {};

  // Apply migrations
  for (const [oldKey, newKey] of Object.entries(migrationMap)) {
    if (oldKey in legacyConfig) {
      setNestedProperty(migratedConfig, newKey, legacyConfig[oldKey]);
    }
  }

  // Validate migrated configuration
  const result = targetSchema.safeParse(migratedConfig);
  if (!result.success) {
    throw new ConfigurationError('Migration failed', result.error.issues);
  }

  return result.data;
}
```

### CLI Tool Integration

```typescript
// CLI command for configuration validation
export async function validateConfigCommand(packageName: string, configPath?: string) {
  const config = configPath ? await loadConfigFile(configPath) : await loadConfigFromEnv();
  const validator = getPackageValidator(packageName);

  const result = validator.validate(config);

  if (result.isValid) {
    console.log('✅ Configuration is valid');
    return 0;
  } else {
    console.log('❌ Configuration validation failed:');
    result.errors?.forEach((error) => {
      console.log(`  - ${error.path}: ${error.message}`);
    });
    return 1;
  }
}
```

## Success Metrics

- **Adoption**: 100% of pantheon packages using framework
- **Compatibility**: 0 breaking changes for existing users
- **Quality**: 90% reduction in configuration-related issues
- **Performance**: <5% overhead from validation

## Dependencies

- Phase 1: Configuration Validation Framework
- Phase 2: Schema Definition
- Package maintainer approval
- Testing infrastructure updates

## Risks & Mitigations

**Risk**: Breaking changes for existing users
**Mitigation**: Comprehensive backward compatibility layer and gradual migration

**Risk**: Performance impact from validation
**Mitigation**: Lazy loading and caching strategies

**Risk**: Complex migration scenarios
**Mitigation**: Migration utilities and comprehensive testing

## Notes

This phase completes the configuration validation standardization across the pantheon ecosystem. The focus is on smooth migration with zero disruption to existing users while providing improved validation and developer experience.

## Related Issues

- Parent: config-validation-pantheon-001
- Dependencies: config-validation-framework-001, config-validation-schemas-002
- Blocks: Final validation standardization completion
