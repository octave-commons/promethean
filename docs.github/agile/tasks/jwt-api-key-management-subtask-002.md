---
uuid: 'jwt-apikey-002'
title: 'Implement JWT API Key Management System'
slug: 'jwt-api-key-management-subtask-002'
status: 'incoming'
priority: 'P0'
storyPoints: 3
lastCommitSha: 'pending'
labels: ['jwt', 'api-keys', 'security', 'pantheon']
created_at: '2025-10-26T20:35:00Z'
estimates:
  complexity: 'medium'
  scale: 'feature'
  time_to_completion: '3-4 hours'
---

# Implement JWT API Key Management System

## Description

Create a secure API key management system that integrates with JWT authentication for Pantheon packages, supporting key generation, rotation, and secure storage.

## Current Issues

- No API key management infrastructure
- Missing key rotation mechanisms
- Insecure key storage practices
- No key lifecycle management

## Implementation Requirements

### 1. API Key Generation and Storage

- [ ] Implement secure API key generation (cryptographically random)
- [ ] Create key storage with encryption at rest
- [ ] Add key metadata management (creation, expiry, usage)
- [ ] Implement key versioning for rotation

### 2. Key Validation and Integration

- [ ] Create API key validation middleware
- [ ] Integrate with JWT token generation
- [ ] Add key-based authentication flows
- [ ] Implement key-to-JWT token mapping

### 3. Key Rotation and Lifecycle

- [ ] Implement automatic key rotation
- [ ] Add key expiry handling
- [ ] Create key revocation mechanisms
- [ ] Support key transition periods

### 4. Security and Monitoring

- [ ] Add key usage monitoring and logging
- [ ] Implement rate limiting per API key
- [ ] Create key audit trails
- [ ] Add security alerts for suspicious activity

## Files to Create/Modify

### New Files

- `packages/pantheon-auth/src/api-keys/key-manager.ts` - Core key management
- `packages/pantheon-auth/src/api-keys/key-generator.ts` - Key generation
- `packages/pantheon-auth/src/api-keys/key-storage.ts` - Secure storage
- `packages/pantheon-auth/src/api-keys/key-validator.ts` - Validation logic
- `packages/pantheon-auth/src/api-keys/key-rotation.ts` - Rotation management

### Modified Files

- `packages/pantheon-auth/src/jwt-handler.ts` - Integrate API keys with JWT
- `packages/pantheon-auth/src/middleware.ts` - Add API key validation
- `packages/pantheon-auth/src/index.ts` - Export key management APIs

## Acceptance Criteria

### Key Management

- [ ] Secure API key generation with sufficient entropy
- [ ] Encrypted storage of API keys at rest
- [ ] Key metadata tracking (creation, expiry, usage)
- [ ] Key versioning support for rotation

### Authentication Integration

- [ ] API key validation middleware
- [ ] JWT token generation using API keys
- [ ] Key-based authentication flows
- [ ] Seamless key-to-JWT integration

### Security Features

- [ ] Automatic key rotation with configurable periods
- [ ] Key expiry and revocation handling
- [ ] Usage monitoring and audit logging
- [ ] Rate limiting per API key

### Testing

- [ ] Unit tests for key generation and storage
- [ ] Integration tests for authentication flows
- [ ] Security tests for key validation
- [ ] Performance tests for key operations

## Technical Implementation

### API Key Structure

```typescript
interface APIKey {
  id: string;
  keyHash: string; // Hashed version of the actual key
  name: string;
  description?: string;
  permissions: string[];
  userId: string;
  createdAt: Date;
  expiresAt?: Date;
  lastUsedAt?: Date;
  usageCount: number;
  isActive: boolean;
  version: number;
}

interface APIKeyMetadata {
  keyId: string;
  algorithm: 'HS256' | 'RS256';
  issuer: string;
  audience: string[];
  customClaims: Record<string, any>;
}
```

### Key Generation Flow

```typescript
class APIKeyGenerator {
  generateKey(): { key: string; keyHash: string } {
    const key = crypto.randomBytes(32).toString('hex');
    const keyHash = crypto.createHash('sha256').update(key).digest('hex');
    return { key, keyHash };
  }

  generateJWTFromKey(apiKey: APIKey, metadata: APIKeyMetadata): string {
    // Generate JWT using API key as signing secret
  }
}
```

## Security Considerations

- Use cryptographically secure random number generation
- Hash API keys before storage (never store raw keys)
- Implement proper key rotation with overlap periods
- Monitor for unusual usage patterns
- Log all key operations for audit trails

## Dependencies

- Node.js crypto module for secure random generation
- Existing JWT infrastructure
- Database/storage for key persistence
- Monitoring and logging infrastructure

## Risk Assessment

**Medium Risk**: Complex key management could introduce security vulnerabilities
**Mitigation**: Comprehensive security review, extensive testing, gradual rollout

## Success Metrics

- 100% secure key generation and storage
- Support for automatic key rotation
- 95%+ test coverage for key operations
- Zero key-related security incidents
- <100ms average key validation time
