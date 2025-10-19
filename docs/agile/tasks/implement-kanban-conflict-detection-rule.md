---
uuid: "7b8a9c2d-4e5f-6a7b-8c9d-0e1f2a3b4c5d"
title: "Implement Kanban Conflict Detection Rule for Todo → In Progress Transitions"
slug: "implement-kanban-conflict-detection-rule"
status: "accepted"
priority: "P1"
labels: ["kanban", "transition-rules", "conflict-detection", "rag", "symbolic-search", "workflow-automation"]
created_at: "Mon Oct 13 2025 10:30:00 GMT-0500 (Central Daylight Time)"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
lastCommitSha: "deec21fe4553bb49020b6aa2bdfee1b89110f15d"
commitHistory: 
  - sha: "deec21fe4553bb49020b6aa2bdfee1b89110f15d"
    timestamp: "2025-10-19T16:27:40.288Z"
    action: "Bulk commit tracking initialization"
---

# Implement Kanban Conflict Detection Rule for Todo → In Progress Transitions

## 🎯 Objective

Implement a sophisticated conflict detection rule for the `todo → in_progress` kanban transition that uses AI-powered analysis to prevent work conflicts between agents working on related code areas simultaneously.

## 📋 Acceptance Criteria

### Core Functionality
- [ ] **Conflict Detection Engine**: Implement workflow that analyzes task against currently in-progress tasks
- [ ] **Multi-source Analysis**: Use three analysis methods:
  1. Files linked by tasks (wiki links, file paths in content)
  2. RAG context from indexed code files using existing ChromaDB/vector search
  3. Symbolic search for terms inferable from task context
- [ ] **Scoring Algorithm**: Implement 0-100 conflict chance scoring with specific thresholds:
  - **< 60**: HARD BLOCK - Block transition completely (no transition allowed)
  - **60 ≤ score < 80**: SOFT BLOCK - Block first attempt with warning, allow second attempt
  - **≥ 80**: ALLOW - No blocking (transition allowed)
- [ ] **Integration**: Seamlessly integrate with existing `TransitionRulesEngine` in `packages/kanban/src/lib/transition-rules.ts`

### Technical Requirements
- [ ] **Performance**: Analysis completes within 5 seconds for typical tasks
- [ ] **Reliability**: Graceful fallback when RAG/symbolic search unavailable
- [ ] **Audit Trail**: Log conflict detection results with reasoning
- [ ] **Configuration**: Make thresholds and analysis methods configurable

### Testing & Quality
- [ ] **Unit Tests**: 90%+ coverage for conflict detection logic
- [ ] **Integration Tests**: Test with real kanban board transitions
- [ ] **Edge Cases**: Handle empty tasks, missing files, search failures
- [ ] **Performance Tests**: Validate under concurrent load

### Documentation
- [ ] **API Documentation**: Complete JSDoc for all public methods
- [ ] **Configuration Guide**: Document available settings and defaults
- [ ] **Troubleshooting**: Common issues and resolution steps

## 🔧 Technical Implementation Details

### 1. Conflict Detection Workflow

```typescript
interface ConflictAnalysisRequest {
  task: Task;
  inProgressTasks: Task[];
  board: Board;
}

interface ConflictAnalysisResult {
  conflictChance: number; // 0-100
  reasoning: string[];
  conflictingTasks: string[];
  analysisMethods: {
    fileLinks: number;
    ragContext: number;
    symbolicSearch: number;
  };
  recommendations: string[];
}
```

### 2. Analysis Components

#### File Links Analysis
- Extract file paths from task content and wiki links
- Compare with files linked to in-progress tasks
- Score based on overlap percentage

#### RAG Context Analysis
- Use existing `packages/indexer-core` ChromaDB integration
- Query for similar code chunks using task title/content as query
- Score based on semantic similarity with in-progress task contexts

#### Symbolic Search Analysis
- Extract key terms from task (function names, classes, variables)
- Use AST-based search to find code references
- Score based on symbol overlap with in-progress task areas

### 3. Integration Points

#### Transition Rules Engine
```typescript
// Add to TransitionRulesEngine.validateTransition()
if (fromNormalized === 'todo' && toNormalized === 'in_progress') {
  const conflictResult = await this.detectConflicts(task, board);
  if (conflictResult.conflictChance < 60) {
    violations.push(`HIGH CONFLICT RISK - HARD BLOCK (${conflictResult.conflictChance}%): ${conflictResult.reasoning.join('; ')}`);
  } else if (conflictResult.conflictChance < 80) {
    // Check if this is a retry attempt (SOFT BLOCK)
    const retryCount = this.getRetryCount(task.uuid);
    if (retryCount === 0) {
      violations.push(`Moderate conflict risk (${conflictResult.conflictChance}%). Retry allowed: ${conflictResult.reasoning.join('; ')}`);
      this.incrementRetryCount(task.uuid);
    }
  }
  // conflictChance >= 80: ALLOW - no blocking
}
```

#### Configuration Integration
```typescript
interface ConflictDetectionConfig {
  enabled: boolean;
  thresholds: {
    hardBlock: number;   // default: 60 (block if < this value)
    softBlock: number;   // default: 80 (block if < this value, warn on first attempt)
  };
  weights: {
    fileLinks: number;  // default: 0.4
    ragContext: number; // default: 0.4
    symbolicSearch: number; // default: 0.2
  };
  timeouts: {
    analysis: number;   // default: 5000ms
  };
}
```

### 4. File Structure

```
packages/kanban/src/lib/
├── conflict-detection/
│   ├── index.ts                 # Main export
│   ├── analyzer.ts              # Core analysis logic
│   ├── file-links.ts            # File link analysis
│   ├── rag-context.ts           # RAG context analysis
│   ├── symbolic-search.ts       # Symbolic search analysis
│   ├── scoring.ts               # Conflict scoring algorithm
│   └── types.ts                 # Type definitions
├── transition-rules.ts          # Updated with conflict detection
└── tests/
    ├── conflict-detection.test.ts
    ├── integration.test.ts
    └── fixtures/
```

## 🧪 Testing Strategy

### Unit Tests
- Test each analysis component independently
- Mock external dependencies (ChromaDB, file system)
- Validate scoring algorithm with known inputs
- Test configuration variations

### Integration Tests
- End-to-end transition validation
- Real kanban board scenarios
- Concurrent task transitions
- Performance under load

### Test Fixtures
- Sample tasks with various conflict scenarios
- Mock in-progress task sets
- Pre-configured test data for RAG queries

## 📚 Dependencies & Integration

### Existing Components to Leverage
- **`@promethean/indexer-core`**: RAG/vector search capabilities
- **`@promethean/kanban`**: Transition rules engine
- **`@promethean/markdown`**: Task content parsing
- **ChromaDB**: Vector storage for semantic search

### New Dependencies
- **AST parser**: For symbolic code analysis (e.g., `@typescript-eslint/parser`)
- **File path utilities**: For link extraction and normalization

## 🚀 Implementation Phases

### Phase 1: Foundation (Complexity: 3)
- Set up project structure and types
- Implement basic file link analysis
- Create scoring framework
- Add unit tests for core components

### Phase 2: RAG Integration (Complexity: 3)
- Integrate with existing indexer-core
- Implement semantic similarity analysis
- Add RAG-specific tests
- Handle fallback scenarios

### Phase 3: Symbolic Search (Complexity: 5)
- Implement AST-based code analysis
- Add symbol extraction and matching
- Integrate with scoring algorithm
- Add comprehensive tests

### Phase 4: Integration & Polish (Complexity: 2)
- Integrate with transition rules engine
- Add configuration management
- Performance optimization
- Documentation and examples

## ⚠️ Risk Mitigation

### Technical Risks
- **RAG Performance**: Implement caching and timeouts
- **Symbolic Search Complexity**: Start with simple pattern matching
- **False Positives**: Make thresholds configurable and tunable

### Operational Risks
- **Transition Blocking**: Ensure graceful degradation
- **Performance Impact**: Add async processing and caching
- **Configuration Drift**: Provide sensible defaults

## 📈 Success Metrics

- **Accuracy**: >85% conflict detection accuracy (measured against manual review)
- **Performance**: <5 second analysis time for 95% of tasks
- **Reliability**: <1% false positive rate
- **Adoption**: Zero increase in transition failures due to bugs

## 🔍 Related Tasks & Dependencies

### Prerequisites
- None - builds on existing infrastructure

### Dependencies
- May require updates to `packages/indexer-core` for enhanced query capabilities
- Potential coordination with teams managing code indexing pipelines

### Follow-up Work
- Machine learning model for conflict prediction
- Advanced visualization of conflict hotspots
- Integration with code review systems

---

## 📝 Implementation Notes

This task requires deep integration with the existing Promethean Framework's kanban and indexing systems. The implementation should follow the established patterns:

- **Functional Programming**: Use immutable data structures and pure functions
- **TypeScript**: Strict typing with comprehensive JSDoc
- **Testing**: TDD approach with AVA test framework
- **Error Handling**: Graceful degradation with detailed logging
- **Configuration**: Environment-based configuration with sensible defaults

The conflict detection system should enhance agent collaboration without introducing friction or blocking legitimate work unnecessarily.
