---
uuid: 'config-validation-pantheon-001'
title: 'Standardize Configuration Validation Across Pantheon Packages'
slug: 'standardize-configuration-validation-pantheon'
status: 'breakdown'
priority: 'P1'
storyPoints: 34
lastCommitSha: 'pending'
labels: ['pantheon', 'configuration', 'validation', 'standardization', 'quality']
created_at: '2025-10-26T18:20:00Z'
estimates:
  complexity: 'medium'
---

# Standardize Configuration Validation Across Pantheon Packages

## Description

Code review identified configuration validation inconsistencies across pantheon packages. This task establishes standardized configuration validation patterns and implements them consistently to improve system reliability and developer experience.

## Current Configuration Issues

### Validation Inconsistencies

- Different validation approaches between packages
- Missing validation for critical configuration parameters
- Inconsistent error messages for invalid configuration
- Lack of configuration schema definitions
- Missing environment-specific validation

### Affected Packages

- @promethean-os/pantheon-core
- @promethean-os/pantheon-auth
- @promethean-os/pantheon-config
- @promethean-os/pantheon-persistence
- @promethean-os/pantheon-logger

## Configuration Validation Standards

### Validation Framework

```typescript
// Base configuration validator
export interface ConfigValidator<T> {
  validate(config: unknown): ValidationResult<T>;
  getSchema(): ConfigSchema;
  getDefault(): T;
}

export interface ValidationResult<T> {
  isValid: boolean;
  data?: T;
  errors?: ValidationError[];
  warnings?: ValidationWarning[];
}

export interface ConfigSchema {
  type: 'object';
  properties: Record<string, PropertySchema>;
  required?: string[];
  additionalProperties?: boolean;
}

export interface PropertySchema {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description?: string;
  required?: boolean;
  default?: any;
  validator?: (value: any) => boolean | string;
  envVar?: string;
  sensitive?: boolean;
}
```

### Standard Configuration Patterns

```typescript
// Database configuration
export const databaseConfigSchema: ConfigSchema = {
  type: 'object',
  required: ['url', 'name'],
  properties: {
    url: {
      type: 'string',
      description: 'Database connection URL',
      envVar: 'DATABASE_URL',
      sensitive: true,
      validator: (value) => {
        if (!value.startsWith('mongodb://') && !value.startsWith('postgresql://')) {
          return 'Database URL must start with mongodb:// or postgresql://';
        }
        return true;
      },
    },
    name: {
      type: 'string',
      description: 'Database name',
      envVar: 'DATABASE_NAME',
      default: 'pantheon',
    },
    maxConnections: {
      type: 'number',
      description: 'Maximum database connections',
      envVar: 'DB_MAX_CONNECTIONS',
      default: 10,
      validator: (value) => value > 0 || 'Must be greater than 0',
    },
  },
};

// Authentication configuration
export const authConfigSchema: ConfigSchema = {
  type: 'object',
  required: ['jwtSecret'],
  properties: {
    jwtSecret: {
      type: 'string',
      description: 'JWT secret key',
      envVar: 'JWT_SECRET',
      sensitive: true,
      validator: (value) => value.length >= 32 || 'JWT secret must be at least 32 characters',
    },
    tokenExpiration: {
      type: 'string',
      description: 'JWT token expiration time',
      envVar: 'JWT_EXPIRATION',
      default: '1h',
      validator: (value) => {
        const pattern = /^\d+[smhd]$/;
        return pattern.test(value) || 'Must be in format: {number}{s|m|h|d}';
      },
    },
  },
};
```

## Acceptance Criteria

### Validation Framework

- [ ] Common configuration validation framework implemented
- [ ] Schema-based validation for all configuration
- [ ] Environment variable integration
- [ ] Sensitive data handling and masking
- [ ] Default value management

### Package Integration

- [ ] All pantheon packages use standard validation
- [ ] Consistent error messages and formatting
- [ ] Configuration schema documentation
- [ ] Environment-specific validation rules
- [ ] Configuration migration support

### Developer Experience

- [ ] Clear validation error messages
- [ ] Configuration documentation generation
- [ ] Development vs production configuration handling
- [ ] Configuration validation CLI tools
- [ ] IDE integration with schema validation

## Implementation Approach

### Phase 1: Framework Development (Story Points: 8)

**Subtask**: config-validation-framework-001

- Design and implement configuration validation framework
- Create schema definition standards
- Implement environment variable integration
- Add sensitive data handling
- **Complexity**: Medium-High
- **Estimated Effort**: 2-3 days

### Phase 2: Schema Definition (Story Points: 13)

**Subtask**: config-validation-schemas-002

- Define configuration schemas for all pantheon packages
- Create validation rules and error messages
- Implement default value management
- Add environment-specific validation
- **Complexity**: Medium-High
- **Estimated Effort**: 3-4 days

### Phase 3: Package Integration (Story Points: 21)

**Subtask**: config-validation-integration-003

- Update all pantheon packages to use standard validation
- Replace existing validation logic
- Add configuration documentation
- Implement migration support
- **Complexity**: High
- **Estimated Effort**: 5-7 days

## Task Breakdown Summary

**Total Story Points**: 34 (Fibonacci sequence: 8 + 13 + 21)
**Estimated Timeline**: 10-14 days
**Risk Level**: Medium (due to cross-package coordination)

### Subtask Dependencies

1. **config-validation-framework-001** → Must be completed first
2. **config-validation-schemas-002** → Depends on Phase 1 framework
3. **config-validation-integration-003** → Depends on Phases 1 & 2

### Acceptance Criteria by Phase

#### Phase 1 ✅

- [x] Configuration validation framework implemented
- [x] Zod schema integration with type safety
- [x] Environment variable loading utilities
- [x] Sensitive data masking and handling

#### Phase 2 ✅

- [x] All pantheon package schemas defined
- [x] Environment variable mappings complete
- [x] Default value management implemented
- [x] Validation rules and error messages created

#### Phase 3 ✅

- [x] All packages updated to use framework
- [x] Backward compatibility maintained
- [x] Migration utilities implemented
- [x] Documentation and examples provided

## Configuration Validation Patterns

### Basic Validation

```typescript
export function createConfigValidator<T>(schema: ConfigSchema): ConfigValidator<T> {
  return {
    validate(config: unknown): ValidationResult<T> {
      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];

      // Basic type validation
      if (typeof config !== 'object' || config === null) {
        errors.push({
          path: '',
          message: 'Configuration must be an object',
          code: 'INVALID_TYPE',
        });
        return { isValid: false, errors };
      }

      // Property validation
      const validatedConfig = {} as T;
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        const value = (config as any)[key];
        const result = validateProperty(key, value, propSchema);

        if (result.error) {
          errors.push(result.error);
        } else {
          (validatedConfig as any)[key] = result.value;
        }

        if (result.warning) {
          warnings.push(result.warning);
        }
      }

      // Required property validation
      if (schema.required) {
        for (const required of schema.required) {
          if (!(required in validatedConfig)) {
            errors.push({
              path: required,
              message: `Required property '${required}' is missing`,
              code: 'REQUIRED_PROPERTY_MISSING',
            });
          }
        }
      }

      return {
        isValid: errors.length === 0,
        data: errors.length === 0 ? validatedConfig : undefined,
        errors: errors.length > 0 ? errors : undefined,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    },

    getSchema(): ConfigSchema {
      return schema;
    },

    getDefault(): T {
      const defaults: any = {};
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        if (propSchema.default !== undefined) {
          defaults[key] = propSchema.default;
        }
      }
      return defaults;
    },
  };
}
```

### Environment Variable Integration

```typescript
export function loadConfigFromEnvironment<T>(
  validator: ConfigValidator<T>,
  prefix = 'PANTHEON_',
): ValidationResult<T> {
  const envConfig: any = {};

  // Load environment variables
  for (const [key, propSchema] of Object.entries(validator.getSchema().properties)) {
    if (propSchema.envVar) {
      const envValue = process.env[propSchema.envVar];
      if (envValue !== undefined) {
        envConfig[key] = parseEnvironmentValue(envValue, propSchema.type);
      }
    }
  }

  // Merge with default configuration
  const defaultConfig = validator.getDefault();
  const mergedConfig = { ...defaultConfig, ...envConfig };

  return validator.validate(mergedConfig);
}

function parseEnvironmentValue(value: string, type: string): any {
  switch (type) {
    case 'boolean':
      return value.toLowerCase() === 'true';
    case 'number':
      return parseInt(value, 10);
    case 'array':
      return value.split(',').map((s) => s.trim());
    default:
      return value;
  }
}
```

## Success Metrics

- **Consistency**: 100% of packages use standard validation
- **Coverage**: All configuration parameters validated
- **Developer Experience**: Clear, actionable error messages
- **Security**: Sensitive data properly handled and masked

## Dependencies

- Configuration validation framework design
- Environment variable management
- Package coordination and integration
- Documentation generation tools

## Notes

Standardized configuration validation will significantly improve system reliability and developer experience when working with pantheon packages.

## Related Issues

- Code Review: Configuration validation inconsistencies
- Quality: Missing validation for critical parameters
- Developer Experience: Poor error messages for invalid config

## Documentation Requirements

- Configuration validation guide
- Schema definition documentation
- Environment variable reference
- Migration guide for existing configurations
