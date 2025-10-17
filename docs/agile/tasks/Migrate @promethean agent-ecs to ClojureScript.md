---
uuid: "128312a6-f989-403d-ab2d-e8fe70a6e4ea"
title: "Migrate @promethean/agent-ecs to ClojureScript"
slug: "Migrate @promethean agent-ecs to ClojureScript"
status: "ready"
priority: "P1"
labels: ["migration", "clojurescript", "typed-clojure", "agent-ecs", "agent-system", "ecs-architecture"]
created_at: "2025-10-14T06:36:44.914Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

Migrate the @promethean/agent-ecs package from TypeScript to typed ClojureScript, maintaining identical functionality and test coverage. This is a Phase 2 migration with internal dependencies (@promethean/ds, @promethean/legacy) and complex ECS architecture requiring careful state management and system orchestration.

## 📊 Migration Analysis

### Package Scope

- **Source Files**: 15 TypeScript files (~2,000 LOC)
- **Test Files**: 2 test files (~300 LOC)
- **External Dependencies**: chromadb, mongodb, ollama, express, ws, unified/remark ecosystem
- **Internal Dependencies**: @promethean/ds (ECS framework), @promethean/legacy

### Complexity Assessment

- **ECS Architecture**: Complex Entity-Component-System pattern with world management
- **State Management**: Real-time audio processing, VAD, turn detection, speech arbitration
- **Database Integration**: ChromaDB vector storage, MongoDB persistence
- **Async Systems**: WebSocket connections, streaming audio, concurrent system execution
- **Type System**: Complex component types and system interfaces requiring Typed ClojureScript

## 🎯 Story Point Breakdown

### Core ECS Infrastructure (8 points)

- **Migrate ECS world and entity management** (3 points)
- **Migrate component definitions and type system** (3 points)
- **Migrate system orchestration and ticker** (2 points)

### Audio & Voice Systems (6 points)

- **Migrate VAD (Voice Activity Detection) system** (2 points)
- **Migrate speech arbitration and turn detection** (2 points)
- **Migrate audio playback and queue management** (2 points)

### Database & External Integration (4 points)

- **Migrate ChromaDB vector storage integration** (2 points)
- **Migrate MongoDB persistence layer** (1 point)
- **Migrate WebSocket and Express server components** (1 point)

### Vision & Processing Systems (3 points)

- **Migrate vision frame processing and ring buffer** (2 points)
- **Migrate orchestrator system with LLM integration** (1 point)

## 📋 Implementation Breakdown

### Phase 1: Foundation & ECS Core (Week 1)

#### 1.1 Project Structure Setup

- [ ] Create new ClojureScript package structure with ECS focus
- [ ] Configure shadow-cljs build with typed ClojureScript
- [ ] Set up testing framework (cljs.test) for async systems
- [ ] Configure internal dependency interop (@promethean/ds, @promethean/legacy)

#### 1.2 ECS World & Entity Management

- [ ] Migrate world.ts core ECS world implementation
- [ ] Implement AgentTicker with async system execution
- [ ] Create entity lifecycle management in ClojureScript
- [ ] Migrate component query and iteration patterns

#### 1.3 Component System Migration

- [ ] Migrate all component types from types.ts to Typed ClojureScript
- [ ] Implement component definitions with proper typing
- [ ] Create component accessors and mutators
- [ ] Establish component validation and schema checking

### Phase 2: Audio & Voice Systems (Week 2)

#### 2.1 Voice Activity Detection (VAD)

- [ ] Migrate systems/vad.ts with real-time audio processing
- [ ] Implement VAD state management and thresholds
- [ ] Handle audio level processing and attack/release curves
- [ ] Create VAD testing utilities and mocks

#### 2.2 Speech Arbitration System

- [ ] Migrate systems/speechArbiter.ts for turn management
- [ ] Implement barge-in logic (none, duck, pause, stop)
- [ ] Create utterance queue management with priority handling
- [ ] Handle audio player integration and state synchronization

#### 2.3 Turn Detection & Management

- [ ] Migrate systems/turn.ts for conversation flow
- [ ] Implement turn counting and state tracking
- [ ] Create turn-based audio coordination
- [ ] Handle transcript finalization and clearing

### Phase 3: Database & External Integration (Week 3)

#### 3.1 Vector Database Integration

- [ ] Migrate ChromaDB integration for vector storage
- [ ] Implement vector embedding and retrieval
- [ ] Create vector search and similarity matching
- [ ] Handle ChromaDB connection management and error handling

#### 3.2 MongoDB Persistence

- [ ] Migrate MongoDB integration for state persistence
- [ ] Implement document storage and retrieval patterns
- [ ] Create database connection pooling and management
- [ ] Handle data serialization/deserialization

#### 3.3 Network & Server Components

- [ ] Migrate WebSocket integration for real-time communication
- [ ] Implement Express server components and middleware
- [ ] Create HTTP API endpoints for system control
- [ ] Handle connection management and error recovery

### Phase 4: Vision & Orchestration (Week 4)

#### 4.1 Vision Processing System

- [ ] Migrate vision frame processing and ring buffer
- [ ] Implement frame extraction and management
- [ ] Create vision context building for LLM integration
- [ ] Handle multiple frame types (URL, blob, attachment)

#### 4.2 Orchestrator System

- [ ] Migrate systems/orchestrator.ts with LLM integration
- [ ] Implement conversation context management
- [ ] Create message queuing and routing
- [ ] Handle system prompt integration and formatting

#### 4.3 Testing & Validation

- [ ] Port all existing tests to cljs.test with async support
- [ ] Implement comprehensive ECS testing patterns
- [ ] Create integration tests for database connections
- [ ] Validate performance parity with TypeScript version

## 🔧 Technical Challenges & Solutions

### ECS Architecture Migration

**Challenge**: Complex entity-component-system pattern with state management
**Solution**: Leverage Clojure's immutable data structures and STM for predictable state updates

### Real-time Audio Processing

**Challenge**: Low-latency audio processing with concurrent system execution
**Solution**: Use ClojureScript's async patterns and core.async for stream processing

### Database Integration

**Challenge**: Multiple database integrations (ChromaDB, MongoDB) with different protocols
**Solution**: Create unified database abstraction layer with JS interop

### Type System Migration

**Challenge**: Complex component types and system interfaces
**Solution**: Use Typed ClojureScript with comprehensive type aliases and protocols

## ⛓️ Dependencies & Blockers

### Internal Dependencies

- **@promethean/ds**: Must be migrated first or have stable ClojureScript interface
- **@promethean/legacy**: Legacy code integration points must be identified and handled

### External Dependencies

- **ChromaDB**: Vector database integration requiring JS interop
- **MongoDB**: Database driver integration and connection management
- **Ollama**: LLM integration with streaming support
- **WebSocket/Express**: Network server components

### Potential Blockers

- **ECS Framework Compatibility**: @promethean/ds ECS interface changes
- **Real-time Performance**: ClojureScript performance for audio processing
- **Database Driver Compatibility**: JS interop complexity with database drivers
- **Memory Management**: ECS pattern memory usage in ClojureScript

### Risk Mitigation

- **Incremental Migration**: Phase-based approach with validation at each step
- **Performance Benchmarking**: Continuous performance comparison
- **Fallback Strategy**: Maintain TypeScript version during migration
- **Comprehensive Testing**: Unit, integration, and performance tests

## ✅ Acceptance Criteria

### Functional Requirements

- [ ] **100% API Compatibility**: All existing TypeScript ECS APIs work identically
- [ ] **Test Coverage**: All existing tests ported and passing (100% coverage)
- [ ] **Performance**: No more than 15% performance degradation for real-time systems
- [ ] **Type Safety**: Full Typed ClojureScript type checking with no warnings

### ECS Requirements

- [ ] **Entity Management**: Identical entity lifecycle and component management
- [ ] **System Execution**: Proper system orchestration with async support
- [ ] **State Management**: Predictable state updates and query performance
- [ ] **Memory Efficiency**: Comparable memory usage patterns

### Integration Requirements

- [ ] **Database Integration**: Seamless ChromaDB and MongoDB integration
- [ ] **Audio Processing**: Real-time VAD and speech arbitration functionality
- [ ] **Vision Processing**: Frame processing and LLM integration
- [ ] **Network Services**: WebSocket and Express server functionality

### Quality Requirements

- [ ] **Code Quality**: Pass all linting and formatting checks
- [ ] **Documentation**: Comprehensive ECS and system documentation
- [ ] **Error Handling**: Robust error handling for all external integrations
- [ ] **Monitoring**: Structured logging for system debugging

## 📈 Success Metrics

### Technical Metrics

- **Test Pass Rate**: 100%
- **Type Coverage**: >95% of code typed with Typed ClojureScript
- **Build Time**: <2x TypeScript build time
- **Memory Usage**: <20% increase vs TypeScript version

### Performance Metrics

- **Audio Latency**: <50ms processing latency for VAD
- **System Throughput**: Maintain 60Hz tick rate for real-time processing
- **Database Performance**: <100ms query response times
- **Memory Efficiency**: <100MB baseline memory usage

### Functional Metrics

- **API Compatibility**: 100% (no breaking changes)
- **ECS Performance**: <15% degradation in entity/component operations
- **Integration Success**: All external dependencies working correctly
- **Rollback Capability**: <5 minutes to revert if needed

## ⛓️ Blocked By

- **@promethean/ds migration**: Core ECS framework must be available in ClojureScript
- **@promethean/legacy migration**: Legacy integration points must be resolved
- **Typed ClojureScript infrastructure**: Build system and tooling must be established

## ⛓️ Blocks

- **Phase 2+ agent system migrations**: Cannot migrate other agent packages until ECS foundation is complete
- **Database migration patterns**: Blocks establishment of database integration patterns for other packages
- **Real-time system patterns**: Blocks real-time processing patterns for audio/video systems
