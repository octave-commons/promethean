---
uuid: "a8b9c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d"
title: "Implement Smart Incoming → Accepted Transition Rule with AI-Powered Task Quality Analysis"
slug: "implement-smart-incoming-to-accepted-transition-rule"
status: "accepted"
priority: "P1"
labels: ["kanban", "transition-rules", "ai-analysis", "quality-gate", "agents-workflow", "task-validation", "workflow-automation"]
created_at: "2025-10-13T18:45:00.000Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

# Implement Smart Incoming → Accepted Transition Rule with AI-Powered Task Quality Analysis

## 🎯 Objective

Implement an intelligent transition rule for the `incoming → accepted` kanban transition that uses AI-powered analysis to evaluate task quality, coherence, and readiness before allowing tasks to enter the planning workflow. This serves as the first quality gate in the Promethean Framework, ensuring only well-defined tasks proceed to breakdown and execution.

## 📋 Acceptance Criteria

### Core Functionality
- [ ] **AI-Powered Task Analysis**: Implement agent workflow that scores task body and filename using agents-workflow package
- [ ] **Global Context Analysis**: Analyze task against globally related documents from the codebase for relevance assessment
- [ ] **Multi-Criteria Scoring System**: Implement comprehensive scoring based on:
  - **Coherence** (1-10): Task clarity, logical structure, and understandability
  - **Feasibility** (1-10): Technical viability and resource requirements
  - **Relevance** (1-10): Alignment with project goals and current priorities
  - **Value Added** (1-10): Expected impact and benefit to the framework
  - **Urgency** (1-10): Time sensitivity and priority alignment
- [ ] **Intelligent Transition Rules**:
  - **Hard Block**: Average score below 6.0 - cannot transition, requires improvement
  - **Soft Block**: Average score below 8.0 - blocked on first attempt with warning, allowed second time
  - **Auto-Accept**: Average score 8.0+ - immediate transition allowed

### Technical Integration
- [ ] **Seamless Kanban Integration**: Integrate with existing `TransitionRulesEngine` in `packages/kanban/src/lib/transition-rules.ts`
- [ ] **Agents-Workflow Integration**: Leverage `@promethean/agents-workflow` for AI-powered analysis
- [ ] **Codebase Context Analysis**: Use existing indexer and search capabilities for global context
- [ ] **Unstructured Input Handling**: Gracefully handle varying levels of task definition quality
- [ ] **Performance Optimization**: Complete analysis within 10 seconds for typical tasks

### Documentation & Reporting
- [ ] **Comprehensive Rationale**: Provide detailed reasoning for overall score and each sub-score
- [ ] **Task Enhancement**: Append analysis report to task with standardized heading format
- [ ] **Constructive Feedback**: Include specific improvement suggestions for blocked tasks
- [ ] **Audit Trail**: Maintain complete analysis history for quality tracking

### Testing & Quality Assurance
- [ ] **Unit Tests**: 90%+ coverage for scoring algorithms and analysis components
- [ ] **Integration Tests**: Test with real kanban board transitions and various task formats
- [ ] **Edge Case Handling**: Handle empty tasks, malformed content, and analysis failures
- [ ] **Performance Tests**: Validate under concurrent load and large task volumes

## 🔧 Technical Implementation Details

### 1. Task Quality Analysis Interface

```typescript
interface TaskQualityAnalysis {
  taskId: string;
  overallScore: number; // 1-10 average
  criteria: {
    coherence: CriterionScore;
    feasibility: CriterionScore;
    relevance: CriterionScore;
    valueAdded: CriterionScore;
    urgency: CriterionScore;
  };
  rationale: {
    overall: string;
    criteria: Record<string, string>;
  };
  recommendations: string[];
  canTransition: boolean;
  transitionType: 'hard-block' | 'soft-block' | 'auto-accept';
  analysisMetadata: {
    timestamp: string;
    analysisVersion: string;
    processingTime: number;
    contextSources: string[];
  };
}

interface CriterionScore {
  score: number; // 1-10
  rationale: string;
  evidence: string[];
  confidence: number; // 0-1
}
```

### 2. AI Analysis Workflow

#### Agents-Workflow Integration
```typescript
// Define analysis workflow using agents-workflow package
const taskAnalysisWorkflow = `
# Task Quality Analysis Workflow

## Agents
1. **Coherence Analyst**: Evaluates task clarity, structure, and logical flow
2. **Feasibility Assessor**: Analyzes technical viability and resource requirements
3. **Relevance Evaluator**: Assesses alignment with project goals and priorities
4. **Value Analyst**: Estimates impact and benefit to the framework
5. **Urgency Reviewer**: Evaluates time sensitivity and priority alignment

## Process
1. Parse task content and extract key information
2. Query global codebase context for relevance assessment
3. Run parallel analysis by each agent
4. Aggregate scores and generate comprehensive rationale
5. Provide specific improvement recommendations
6. Generate final transition recommendation
`;
```

#### Global Context Analysis
```typescript
interface ContextAnalysisRequest {
  taskTitle: string;
  taskContent: string;
  taskTags: string[];
  priority: string;
}

interface ContextAnalysisResult {
  relatedDocuments: Array<{
    path: string;
    relevanceScore: number;
    keyPoints: string[];
  }>;
  projectAlignment: number; // 0-1
  priorityAlignment: number; // 0-1
  duplicateTasks: Array<{
    taskId: string;
    similarity: number;
    overlapReason: string;
  }>;
}
```

### 3. Scoring Algorithm Implementation

```typescript
class TaskQualityScorer {
  async analyzeTask(task: Task, board: Board): Promise<TaskQualityAnalysis> {
    // 1. Extract and normalize task information
    const taskInfo = await this.extractTaskInfo(task);
    
    // 2. Analyze global context
    const context = await this.analyzeGlobalContext(taskInfo);
    
    // 3. Run AI-powered criteria analysis
    const criteria = await this.analyzeCriteria(taskInfo, context);
    
    // 4. Calculate overall score
    const overallScore = this.calculateOverallScore(criteria);
    
    // 5. Determine transition eligibility
    const transitionDecision = this.determineTransition(overallScore, task);
    
    // 6. Generate comprehensive report
    return this.generateAnalysisReport(task, criteria, overallScore, transitionDecision, context);
  }

  private async analyzeCriteria(
    taskInfo: TaskInfo, 
    context: ContextAnalysisResult
  ): Promise<TaskQualityAnalysis['criteria']> {
    // Use agents-workflow to run parallel analysis
    const workflow = await loadAgentWorkflowsFromMarkdown(taskAnalysisWorkflow);
    
    const analysisResults = await Promise.all([
      this.analyzeCoherence(taskInfo, context),
      this.analyzeFeasibility(taskInfo, context),
      this.analyzeRelevance(taskInfo, context),
      this.analyzeValueAdded(taskInfo, context),
      this.analyzeUrgency(taskInfo, context)
    ]);
    
    return {
      coherence: analysisResults[0],
      feasibility: analysisResults[1],
      relevance: analysisResults[2],
      valueAdded: analysisResults[3],
      urgency: analysisResults[4]
    };
  }
}
```

### 4. Transition Rules Integration

```typescript
// Add to TransitionRulesEngine.validateTransition()
if (fromNormalized === 'incoming' && toNormalized === 'accepted') {
  const qualityResult = await this.analyzeTaskQuality(task, board);
  
  if (!qualityResult.canTransition) {
    if (qualityResult.transitionType === 'hard-block') {
      violations.push(
        `Task quality insufficient for acceptance (score: ${qualityResult.overallScore}/10). ` +
        `Required improvements: ${qualityResult.recommendations.join(', ')}`
      );
    } else if (qualityResult.transitionType === 'soft-block') {
      const retryCount = this.getRetryCount(task.uuid);
      if (retryCount === 0) {
        violations.push(
          `Task quality needs improvement (score: ${qualityResult.overallScore}/10). ` +
          `Retry allowed after addressing: ${qualityResult.recommendations.join(', ')}`
        );
        this.incrementRetryCount(task.uuid);
      }
    }
  }
  
  // Append analysis report to task
  await this.appendAnalysisReport(task, qualityResult);
}
```

### 5. Task Enhancement System

```typescript
interface AnalysisReport {
  taskId: string;
  analysisDate: string;
  overallScore: number;
  transitionDecision: string;
  detailedAnalysis: {
    [criterion: string]: {
      score: number;
      rationale: string;
      suggestions: string[];
    };
  };
  improvementRecommendations: string[];
  nextSteps: string[];
}

// Append to task file with standardized format
private async appendAnalysisReport(task: Task, analysis: TaskQualityAnalysis): Promise<void> {
  const reportSection = `
---

## 🤖 AI Quality Analysis (Generated ${new Date().toISOString()})

**Overall Score**: ${analysis.overallScore}/10  
**Transition Decision**: ${analysis.transitionType.toUpperCase()}  
**Can Transition**: ${analysis.canTransition ? '✅ Yes' : '❌ No'}

### 📊 Criteria Breakdown

${Object.entries(analysis.criteria).map(([criterion, score]) => `
#### ${criterion.charAt(0).toUpperCase() + criterion.slice(1)}
- **Score**: ${score.score}/10
- **Rationale**: ${score.rationale}
- **Evidence**: ${score.evidence.join(', ')}
- **Confidence**: ${(score.confidence * 100).toFixed(1)}%
`).join('\n')}

### 💡 Overall Rationale
${analysis.rationale.overall}

### 🎯 Improvement Recommendations
${analysis.recommendations.map(rec => `- ${rec}`).join('\n')}

### 📋 Next Steps
${analysis.canTransition ? 
  '- Task is ready for acceptance and breakdown' : 
  '- Address the recommendations above and retry transition'
}

---
`;
  
  await this.appendToTaskFile(task.uuid, reportSection);
}
```

### 6. File Structure

```
packages/kanban/src/lib/
├── task-quality/
│   ├── index.ts                    # Main export and orchestration
│   ├── scorer.ts                   # Core scoring algorithms
│   ├── criteria/
│   │   ├── coherence.ts            # Coherence analysis
│   │   ├── feasibility.ts          # Feasibility assessment
│   │   ├── relevance.ts            # Relevance evaluation
│   │   ├── value-added.ts          # Value analysis
│   │   └── urgency.ts              # Urgency assessment
│   ├── context-analyzer.ts         # Global context analysis
│   ├── workflow-integration.ts     # Agents-workflow integration
│   ├── report-generator.ts         # Analysis report generation
│   └── types.ts                    # Type definitions
├── transition-rules.ts             # Updated with quality gate
└── tests/
    ├── task-quality.test.ts
    ├── integration.test.ts
    └── fixtures/
        ├── sample-tasks/
        └── expected-reports/
```

## 🧪 Testing Strategy

### Unit Tests
- Test each criterion analysis independently
- Mock AI responses for consistent testing
- Validate scoring algorithm with known inputs
- Test report generation and formatting

### Integration Tests
- End-to-end transition validation with real tasks
- Test with various task quality levels and formats
- Validate agents-workflow integration
- Test concurrent analysis requests

### Test Fixtures
- Sample tasks spanning quality spectrum (1-10 scores)
- Mock global context scenarios
- Expected analysis reports for validation
- Performance benchmarks and load testing

## 📚 Dependencies & Integration

### Existing Components to Leverage
- **`@promethean/agents-workflow`**: AI-powered analysis workflows
- **`@promethean/kanban`**: Transition rules engine and task management
- **`@promethean/indexer-core`**: Global context search and analysis
- **`@promethean/markdown`**: Task content parsing and manipulation

### New Dependencies
- **AI Model Providers**: OpenAI/Ollama integration via agents-workflow
- **Text Analysis**: Enhanced natural language processing capabilities
- **Caching Layer**: Redis/memory cache for analysis results

## 🚀 Implementation Phases

### Phase 1: Foundation & Scoring Framework (Complexity: 2)
- Set up project structure and core types
- Implement basic scoring algorithms
- Create mock analysis workflow
- Add comprehensive unit tests
- **Deliverable**: Working scorer with mock AI responses

### Phase 2: AI Integration & Context Analysis (Complexity: 3)
- Integrate with agents-workflow package
- Implement global context analysis
- Connect to real AI model providers
- Add caching and performance optimization
- **Deliverable**: End-to-end AI-powered analysis

### Phase 3: Transition Rules Integration (Complexity: 2)
- Integrate with existing TransitionRulesEngine
- Implement retry logic and soft/hard blocking
- Add task enhancement and report generation
- Test with real kanban board transitions
- **Deliverable**: Fully functional quality gate

### Phase 4: Polish & Optimization (Complexity: 1)
- Performance optimization and caching
- Comprehensive integration testing
- Documentation and examples
- Error handling and edge cases
- **Deliverable**: Production-ready implementation

## ⚠️ Risk Mitigation

### Technical Risks
- **AI Analysis Performance**: Implement caching and timeout handling
- **False Positives/Negatives**: Make thresholds configurable and tunable
- **Analysis Failures**: Graceful degradation with manual override options

### Operational Risks
- **Transition Blocking**: Ensure clear feedback and improvement paths
- **Performance Impact**: Async processing with result caching
- **Quality Drift**: Regular model retraining and threshold adjustment

## 📈 Success Metrics

- **Accuracy**: >85% correlation with human quality assessments
- **Performance**: <10 second analysis time for 95% of tasks
- **Reliability**: <5% false positive rate (blocking good tasks)
- **Adoption**: Zero increase in incoming task processing time
- **Quality Improvement**: 30% reduction in low-quality tasks reaching breakdown

## 🔍 Related Tasks & Dependencies

### Prerequisites
- None - builds on existing kanban and agents-workflow infrastructure

### Dependencies
- May require enhancements to `@promethean/agents-workflow` for task-specific analysis
- Potential coordination with teams managing AI model providers and indexing

### Follow-up Work
- Machine learning model for quality prediction based on historical data
- Advanced visualization of task quality trends and patterns
- Integration with automated task improvement suggestions

## 🎯 Business Value

### Immediate Benefits
- **Quality Gate**: Prevents poorly defined tasks from entering workflow
- **Time Savings**: Reduces rework in breakdown and planning phases
- **Consistency**: Standardizes task quality across all contributors
- **Feedback Loop**: Provides constructive guidance for task improvement

### Long-term Impact
- **Workflow Efficiency**: Smoother flow from incoming to execution
- **Agent Productivity**: Higher quality tasks lead to better agent performance
- **Metrics & Insights**: Data-driven understanding of task quality patterns
- **Continuous Improvement**: Automated quality tracking and trend analysis

---

## 📝 Implementation Notes

This implementation represents a significant enhancement to the Promethean Framework's workflow automation. The smart transition rule will serve as a critical quality gate, ensuring that only well-defined, valuable tasks enter the planning and execution pipeline.

The system should be designed with the following principles:

- **Intelligent Enhancement**: Provide constructive feedback rather than just blocking
- **Configurable Thresholds**: Allow tuning based on project needs and team preferences
- **Transparent Process**: Clear rationale for all scoring decisions
- **Graceful Degradation**: Continue functioning even when AI services are unavailable
- **Performance Conscious**: Minimize impact on overall workflow speed

The implementation should follow established Promethean patterns:
- **Functional Programming**: Immutable data structures and pure functions
- **TypeScript**: Strict typing with comprehensive JSDoc
- **Testing**: TDD approach with AVA test framework
- **Error Handling**: Comprehensive error handling with detailed logging
- **Configuration**: Environment-based configuration with sensible defaults
