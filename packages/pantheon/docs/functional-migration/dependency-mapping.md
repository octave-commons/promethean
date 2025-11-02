# Functional Framework Migration Dependency Mapping

## Overview

This document identifies and documents task dependencies, cross-package relationships, critical path items, and parallel execution opportunities for the functional framework migration project.

---

## 1. Task Dependency Matrix

### 1.1 Phase-Level Dependencies

| From Phase | To Phase | Dependency Type | Description | Critical Path |
|------------|-----------|-----------------|-------------|---------------|
| Phase 1 (Foundation) | Phase 2 (Core) | Hard | Infrastructure and patterns must exist | ✅ |
| Phase 2 (Core) | Phase 3 (Services) | Hard | Core services required by service packages | ✅ |
| Phase 3 (Services) | Phase 4 (Systems) | Hard | Service integration required by system packages | ✅ |
| Phase 4 (Systems) | Phase 5 (Utilities) | Soft | System patterns inform utility design | ❌ |
| Phase 5 (Utilities) | Phase 6 (Integration) | Hard | All packages must be converted | ✅ |

### 1.2 Package-Level Dependencies

#### Core Dependencies
```
Pantheon (Auth) → Core → Orchestrator → Workflow
     ↓              ↓        ↓           ↓
   State        Protocol   ECS        Healing
     ↓              ↓        ↓           ↓
Persistence → LLM Services → MCP → Generator
```

#### Detailed Package Dependency Map

| Package | Direct Dependencies | Indirect Dependencies | Migration Priority |
|---------|-------------------|----------------------|-------------------|
| **pantheon** | None | None | Critical |
| **core** | pantheon | None | Critical |
| **auth** | pantheon | None | Critical |
| **persistence** | pantheon, core | None | High |
| **protocol** | pantheon, core | None | High |
| **llm-openai** | pantheon, core, protocol | auth | High |
| **llm-claude** | pantheon, core, protocol | auth | High |
| **llm-opencode** | pantheon, core, protocol | auth | High |
| **mcp** | pantheon, core, protocol | auth, llm-* | High |
| **orchestrator** | pantheon, core, protocol | auth, persistence | Medium |
| **ecs** | pantheon, core | auth, persistence | Medium |
| **workflow** | pantheon, core, orchestrator | auth, persistence, ecs | Medium |
| **state** | pantheon, core | auth, persistence | Medium |
| **generator** | pantheon, core | auth, persistence | Low |
| **ui** | pantheon, core, state | auth, persistence | Low |

---

## 2. Class-Level Dependencies

### 2.1 Pantheon Package Dependencies

```
PantheonError (Foundation)
    ↓
JwtHandler → SessionManager → CliAuthManager
```

#### Dependency Details
- **JwtHandler** depends on: PantheonError
- **SessionManager** depends on: JwtHandler, PantheonError
- **CliAuthManager** depends on: SessionManager, JwtHandler, PantheonError

### 2.2 Core Package Dependencies

```
Types (Foundation)
    ↓
Ports → Context → Actors → Orchestrator
```

#### Dependency Details
- **Ports** depends on: Types
- **Context** depends on: Types, Ports
- **Actors** depends on: Types, Ports, Context
- **Orchestrator** depends on: Types, Ports, Context, Actors

### 2.3 Authentication Package Dependencies

```
Auth Types (Foundation)
    ↓
JWT Handler → Auth Middleware → Session Manager
```

#### Dependency Details
- **JWT Handler** depends on: Auth Types, PantheonError
- **Auth Middleware** depends on: JWT Handler, Auth Types
- **Session Manager** depends on: JWT Handler, Auth Types

---

## 3. Critical Path Analysis

### 3.1 Primary Critical Path

```
Phase 1: Foundation
├── F1.1.1 Migration Infrastructure
├── F1.1.2 Quality Gates
├── F1.2.1 Error Handling Conversion
└── F1.2.2 Utility Conversion
    ↓
Phase 2: Core Packages
├── P2.1.1 Pantheon Error Conversion
├── P2.1.2 JWT Handler Conversion
├── P2.1.3 Session Manager Conversion
├── P2.1.4 CLI Auth Manager Conversion
├── P2.2.1 Core Types Conversion
├── P2.2.2 Core Ports Conversion
├── P2.2.3 Core Context Conversion
├── P2.2.4 Core Actors Conversion
└── P2.2.5 Core Orchestrator Conversion
    ↓
Phase 3: Service Packages
├── S3.1.1 LLM OpenAI Conversion
├── S3.1.2 LLM Claude Conversion
├── S3.1.3 LLM OpenCode Conversion
├── S3.2.1 Persistence Conversion
└── S3.3.1 Protocol Conversion
    ↓
Phase 4: System Packages
├── S4.1.1 ECS Conversion
├── S4.2.1 Orchestrator Conversion
└── S4.3.1 Workflow Conversion
    ↓
Phase 5: Utility Packages
├── U5.1.1 Generator Conversion
├── U5.2.1 UI Conversion
└── U5.3.1 State Conversion
    ↓
Phase 6: Integration
├── I6.1.1 Integration Testing
├── I6.2.1 Documentation Completion
└── I6.3.1 Production Readiness
```

### 3.2 Critical Path Duration
- **Phase 1**: 7 days (Foundation)
- **Phase 2**: 13 days (Core Packages)
- **Phase 3**: 18 days (Service Packages)
- **Phase 4**: 15 days (System Packages)
- **Phase 5**: 10 days (Utility Packages)
- **Phase 6**: 10 days (Integration)
- **Total Critical Path**: 73 days (14.6 weeks)

### 3.3 Critical Path Risks
1. **Foundation Delays**: Impact entire project timeline
2. **Core Package Issues**: Cascade to all dependent packages
3. **Integration Failures**: Require rework of multiple packages
4. **Performance Regressions**: May require architectural changes

---

## 4. Parallel Execution Opportunities

### 4.1 Within-Phase Parallelism

#### Phase 1 Parallel Tasks
```
F1.1.1 Migration Infrastructure ──┐
                                ├───→ F1.2.1 Error Handling
F1.1.2 Quality Gates ────────────┤
                                ├───→ F1.2.2 Utility Conversion
F1.1.3 Documentation Templates ───┘
```

#### Phase 2 Parallel Tasks
```
P2.1.1 Pantheon Error ─────────────┐
                                   ├───→ P2.1.3 Session Manager
P2.1.2 JWT Handler ─────────────────┤
                                   ├───→ P2.1.4 CLI Auth Manager
P2.2.1 Core Types ──────────────────┤
                                   ├───→ P2.2.3 Core Context
P2.2.2 Core Ports ──────────────────┘
```

#### Phase 3 Parallel Tasks
```
S3.1.1 LLM OpenAI ──────┐
                        ├───→ S3.3.1 Protocol
S3.1.2 LLM Claude ──────┤
                        ├───→ S3.2.1 Persistence
S3.1.3 LLM OpenCode ────┘
```

### 4.2 Cross-Phase Parallelism

#### Testing Parallelism
- Test development can proceed 2-3 days behind conversion
- Integration test setup can begin during Phase 2
- Performance testing can start in Phase 3

#### Documentation Parallelism
- Documentation updates can happen alongside development
- API documentation can be written as functions are created
- Migration guides can be prepared during Phase 1

#### Infrastructure Parallelism
- CI/CD pipeline setup can happen during Phase 1
- Monitoring infrastructure can be set up in Phase 2
- Deployment automation can be developed in Phase 3

### 4.3 Resource-Level Parallelism

#### Team Allocation for Parallel Execution
```
Team A (Migration Lead + 1 Senior):
├── Foundation Infrastructure
├── Core Package Conversions
└── System Package Conversions

Team B (1 Senior + 1 Test Engineer):
├── Service Package Conversions
├── Test Development
└── Integration Testing

Team C (Documentation Specialist):
├── Documentation Templates
├── API Documentation
└── Migration Guides
```

---

## 5. Cross-Package Dependencies

### 5.1 Authentication Dependencies

#### Shared Authentication Patterns
```typescript
// Shared across all packages
export interface SecurityContext {
  userId: string;
  permissions: string[];
  roles: string[];
  sessionId: string;
}

// Used by: pantheon, core, all service packages
export const createSecurityContext = (
  user: User,
  sessionId: string,
): SecurityContext => {
  // Functional implementation
};
```

#### Dependency Flow
```
Pantheon (Auth) → Core → All Service Packages
     ↓              ↓           ↓
JWT Patterns   Context     Auth Middleware
     ↓              ↓           ↓
Session Mgmt   Actor Auth  Service Auth
```

### 5.2 Data Persistence Dependencies

#### Shared Persistence Patterns
```typescript
// Used by: persistence, state, core, orchestrator
export interface DataRepository<T> {
  find: (id: string) => Promise<T | null>;
  save: (entity: T) => Promise<T>;
  delete: (id: string) => Promise<boolean>;
  query: (criteria: QueryCriteria) => Promise<T[]>;
}

// Functional repository factory
export const createRepository = <T>(
  adapter: DataAdapter,
): DataRepository<T> => {
  // Functional implementation
};
```

#### Dependency Flow
```
Persistence → State → Core → Orchestrator → Workflow
     ↓          ↓       ↓        ↓           ↓
Data Store  State Mgmt  Context  Coordination  Process
```

### 5.3 Communication Protocol Dependencies

#### Shared Protocol Patterns
```typescript
// Used by: protocol, all service packages, orchestrator
export interface MessageEnvelope {
  id: string;
  type: string;
  payload: unknown;
  metadata: MessageMetadata;
}

// Functional message handling
export const handleMessage = (
  envelope: MessageEnvelope,
  handlers: MessageHandlers,
): Promise<MessageEnvelope | null> => {
  // Functional implementation
};
```

#### Dependency Flow
```
Protocol → LLM Services → MCP → Orchestrator → Workflow
    ↓         ↓           ↓       ↓           ↓
Messaging  AI Comm    Tool Comm  System Comm  Process Comm
```

---

## 6. Risk Dependencies

### 6.1 Technical Risk Dependencies

#### Performance Regression Chain
```
Foundation Performance → Core Performance → Service Performance → System Performance
```

#### Breaking Change Propagation
```
API Changes in Core → Service Integration Issues → System Failures
```

#### Memory Leak Dependencies
```
Resource Management in Core → Service Resource Leaks → System Memory Issues
```

### 6.2 Project Risk Dependencies

#### Team Dependency Risks
```
Key Developer Availability → Critical Path Delays → Project Timeline Impact
```

#### Knowledge Transfer Dependencies
```
Documentation Quality → Team Understanding → Migration Success Rate
```

#### Tooling Dependencies
```
Automation Quality → Conversion Speed → Project Completion Timeline
```

---

## 7. Dependency Management Strategies

### 7.1 Dependency Decoupling

#### Interface-Based Decoupling
```typescript
// Define stable interfaces first
export interface AuthenticationService {
  authenticate: (credentials: Credentials) => Promise<AuthResult>;
  authorize: (context: SecurityContext, permission: string) => boolean;
}

// Implement functional versions
export const createAuthService = (
  dependencies: AuthDependencies,
): AuthenticationService => {
  // Functional implementation
};
```

#### Event-Driven Decoupling
```typescript
// Use events to reduce direct dependencies
export const publishEvent = <T>(event: Event<T>): void => {
  // Event publishing implementation
};

export const subscribeToEvent = <T>(
  eventType: string,
  handler: EventHandler<T>,
): Unsubscribe => {
  // Event subscription implementation
};
```

### 7.2 Dependency Injection Patterns

#### Functional Dependency Injection
```typescript
// Scope-based dependency injection
export type ServiceScope = {
  logger: Logger;
  config: Config;
  auth: AuthenticationService;
  persistence: PersistenceService;
};

export const serviceFunction = (
  input: ServiceInput,
  scope: ServiceScope,
): ServiceOutput => {
  // Use dependencies from scope
  scope.logger.info('Executing service');
  // ... implementation
};
```

#### Factory-Based Dependency Resolution
```typescript
// Factory for creating service scopes
export const createServiceScope = (
  config: Config,
): ServiceScope => {
  return {
    logger: createLogger(config.logLevel),
    config,
    auth: createAuthService(config.auth),
    persistence: createPersistenceService(config.database),
  };
};
```

### 7.3 Version Compatibility Strategies

#### Semantic Versioning for Functional APIs
```typescript
// Versioned functional APIs
export const v1 = {
  authenticate: authenticateV1,
  authorize: authorizeV1,
};

export const v2 = {
  authenticate: authenticateV2,
  authorize: authorizeV2,
  // Backward compatibility
  v1: v1,
};
```

#### Adapter Pattern for Legacy Support
```typescript
// Adapter for class-based to functional transition
export const createClassAdapter = (
  functionalService: FunctionalService,
): ClassService => {
  return {
    method: (input) => functionalService.action(input, scope),
  };
};
```

---

## 8. Monitoring and Validation

### 8.1 Dependency Health Monitoring

#### Dependency Graph Monitoring
```typescript
// Monitor dependency health
export const checkDependencyHealth = async (
  dependencies: Dependency[],
): Promise<HealthReport> => {
  const results = await Promise.allSettled(
    dependencies.map(dep => dep.healthCheck()),
  );
  
  return {
    healthy: results.filter(r => r.status === 'fulfilled').length,
    unhealthy: results.filter(r => r.status === 'rejected').length,
    details: results,
  };
};
```

#### Integration Health Checks
```typescript
// Cross-package integration health
export const checkIntegrationHealth = async (
  packages: Package[],
): Promise<IntegrationReport> => {
  // Test integrations between packages
  // Return health status for each integration
};
```

### 8.2 Dependency Validation

#### Automated Dependency Testing
```typescript
// Test that dependencies are correctly injected
test('dependency injection works correctly', (t) => {
  const mockDeps = createMockDependencies();
  const scope = createServiceScope(mockDeps);
  const input = createTestInput();
  
  const result = serviceFunction(input, scope);
  
  t.true(mockDeps.logger.info.called);
  t.deepEqual(result, expectedOutput);
});
```

#### Circular Dependency Detection
```typescript
// Detect circular dependencies in functional code
export const detectCircularDependencies = (
  modules: Module[],
): CircularDependencyReport => {
  // Analyze import graph
  // Detect and report circular dependencies
};
```

---

## 9. Dependency Evolution

### 9.1 Migration Phase Dependencies

#### Phase Transition Dependencies
```
Phase 1 Complete → Phase 2 Start
Phase 2 Core Complete → Phase 3 Services Start
Phase 3 Services Complete → Phase 4 Systems Start
Phase 4 Systems Complete → Phase 5 Utilities Start
Phase 5 Utilities Complete → Phase 6 Integration Start
```

#### Rollback Dependencies
```
Integration Failure → Phase Rollback → Previous Phase Restoration
Performance Regression → Performance Analysis → Optimization Rollback
Breaking Changes → Compatibility Layer → Gradual Migration
```

### 9.2 Long-term Dependency Management

#### Functional API Evolution
```
Current Functional APIs → Enhanced Functional APIs → Next-Gen Patterns
```

#### Package Dependency Evolution
```
Tightly Coupled → Loosely Coupled → Event-Driven → Microservice Architecture
```

---

## 10. Decision Points and Gates

### 10.1 Go/No-Go Decision Points

#### Phase Completion Gates
1. **Phase 1 Gate**: Infrastructure ready, patterns established
2. **Phase 2 Gate**: Core packages functional, no breaking changes
3. **Phase 3 Gate**: Service packages integrated, performance validated
4. **Phase 4 Gate**: System packages stable, end-to-end working
5. **Phase 5 Gate**: All packages converted, documentation complete
6. **Phase 6 Gate**: Integration validated, production ready

#### Quality Gates
- **Code Quality**: All packages pass linting and type checking
- **Test Coverage**: ≥80% coverage across all packages
- **Performance**: ≤5% regression from baseline
- **Security**: No new security vulnerabilities introduced
- **Documentation**: 100% API documentation coverage

### 10.2 Dependency Resolution Strategies

#### Conflict Resolution
1. **Interface Conflicts**: Use adapter pattern
2. **Version Conflicts**: Use semantic versioning
3. **Performance Conflicts**: Optimize critical path
4. **Resource Conflicts**: Implement resource pooling

#### Escalation Procedures
1. **Technical Blockers**: Escalate to architecture team
2. **Dependency Delays**: Replan critical path
3. **Quality Issues**: Implement additional testing
4. **Resource Constraints**: Reallocate team resources

---

## Summary

### Key Dependencies
1. **Foundation packages** (pantheon, core) are critical path items
2. **Authentication and persistence** affect most other packages
3. **Communication protocols** enable service integration
4. **Testing and documentation** run parallel to development

### Parallel Opportunities
1. **Within phases**: Multiple packages can be converted simultaneously
2. **Across phases**: Testing and documentation can proceed in parallel
3. **Resource allocation**: Teams can work on different package groups

### Risk Mitigation
1. **Interface stability**: Maintain stable interfaces during migration
2. **Gradual rollout**: Use feature flags and compatibility layers
3. **Continuous integration**: Automated testing at each dependency level
4. **Performance monitoring**: Track performance across dependency chain

### Success Factors
1. **Clear dependency mapping**: Understand and document all dependencies
2. **Critical path management**: Focus on high-impact dependencies
3. **Parallel execution**: Maximize parallel work while managing dependencies
4. **Quality gates**: Ensure quality at each dependency level