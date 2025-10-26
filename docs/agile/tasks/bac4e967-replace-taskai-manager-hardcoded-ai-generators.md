---
uuid: "bac4e967-de4a-49bd-999a-fec4a60bf572"
title: "Replace TaskAIManager Hardcoded AI Generators with Real AI Integration"
slug: "replace-taskai-manager-hardcoded-ai-generators"
status: "todo"
priority: "P1"
storyPoints: 8
lastCommitSha: "pending"
labels: ["ai-integration", "hardcoded", "real-ai", "llm", "pantheon"]
created_at: "2025-10-26T16:35:00Z"
estimates:
  complexity: "high"
---

# Replace TaskAIManager Hardcoded AI Generators with Real AI Integration

## Executive Summary

The TaskAIManager uses hardcoded generator functions that return predictable, non-intelligent responses instead of leveraging real AI capabilities. This defeats the purpose of AI integration and provides no actual analysis.

## Problem Analysis

### Current Hardcoded Implementation

**Files Affected:**
- `generateTaskAnalysis()` (lines 465-570)
- `generateTaskRewrite()` (lines 581-615) 
- `generateTaskBreakdown()` (lines 625-657)

### Issues with Hardcoded Responses

1. **No Real Intelligence**: Responses are deterministic and predictable
2. **Defeats AI Purpose**: No actual AI analysis happening
3. **Poor User Experience**: Users expect intelligent insights
4. **Limited Scalability**: Cannot handle diverse task types
5. **No Learning**: System doesn't improve over time

## Required Implementation

### 1. Replace generateTaskAnalysis with Real AI

**Current Code:**
```typescript
function generateTaskAnalysis(params: TaskAnalysisParams): any {
  const { task, analysisType } = params;
  const contentLength = task.content?.length ?? 0;
  const baseQuality = Math.min(95, 60 + Math.floor(contentLength / 40));
  
  switch (analysisType) {
    case 'quality':
      return {
        qualityScore: baseQuality,
        completenessScore: completeness,
        suggestions: [
          'Ensure acceptance criteria include measurable outcomes.',
          'Document explicit test coverage expectations.',
        ],
        // ... hardcoded responses
      };
  }
}
```

**Required Fix:**
```typescript
async function generateTaskAnalysis(params: TaskAnalysisParams): Promise<any> {
  const { task, analysisType, context } = params;
  
  const prompt = `
    Analyze the following task for ${analysisType} analysis:
    
    Task Title: ${task.title}
    Task Content: ${task.content}
    Current Status: ${task.status}
    Priority: ${task.priority}
    Labels: ${task.labels.join(', ')}
    
    Context: ${JSON.stringify(context, null, 2)}
    
    Provide a comprehensive analysis in JSON format with:
    - qualityScore (0-100)
    - complexityScore (0-100) 
    - completenessScore (0-100)
    - suggestions (array of actionable suggestions)
    - risks (array of potential risks)
    - dependencies (array of required dependencies)
    - subtasks (array of suggested subtasks if applicable)
    - estimatedEffort (object with hours, confidence, breakdown)
    
    Be specific, actionable, and provide concrete examples where possible.
  `;
  
  try {
    const response = await runPantheonComputation({
      actorName: 'task-analyzer',
      goal: `analyze task ${task.title} for ${analysisType}`,
      compute: async () => {
        return await this.llmDriver.generate(prompt);
      },
    });
    
    // Parse and validate AI response
    const analysis = JSON.parse(response);
    return this.validateAnalysisResponse(analysis);
    
  } catch (error) {
    // Fallback to basic analysis if AI fails
    return this.generateFallbackAnalysis(task, analysisType);
  }
}
```

### 2. Replace generateTaskRewrite with Real AI

**Current Code:**
```typescript
function generateTaskRewrite(params: TaskRewriteParams): { content: string; summary: string } {
  const { task, rewriteType, instructions, targetAudience, tone, originalContent } = params;
  
  const rewrittenContent = `## Updated Task Brief: ${task.title}

${originalContent.trim()}

### Objectives
- Deliver outcomes aligned with stakeholder expectations.
- Maintain transparency around scope and dependencies.
// ... hardcoded template
`;
```

**Required Fix:**
```typescript
async function generateTaskRewrite(params: TaskRewriteParams): Promise<{ content: string; summary: string }> {
  const { task, rewriteType, instructions, targetAudience, tone, originalContent } = params;
  
  const prompt = `
    Rewrite the following task content based on specified requirements:
    
    Original Task:
    Title: ${task.title}
    Content: ${originalContent}
    
    Rewrite Requirements:
    - Type: ${rewriteType}
    - Target Audience: ${targetAudience}
    - Tone: ${tone}
    - Special Instructions: ${instructions || 'None provided'}
    
    Please rewrite task content to:
    1. Be appropriate for ${targetAudience} audience
    2. Use a ${tone} tone throughout
    3. Address ${rewriteType} rewrite type specifically
    4. Incorporate any special instructions
    5. Maintain all essential information while improving clarity and structure
    
    Return response in JSON format:
    {
      "content": "rewritten task content in markdown format",
      "summary": "brief summary of changes made"
    }
  `;
  
  try {
    const response = await runPantheonComputation({
      actorName: 'task-rewriter',
      goal: `rewrite task ${task.title} for ${targetAudience}`,
      compute: async () => {
        return await this.llmDriver.generate(prompt);
      },
    });
    
    const result = JSON.parse(response);
    return {
      content: result.content,
      summary: result.summary
    };
    
  } catch (error) {
    // Fallback to basic rewrite if AI fails
    return this.generateFallbackRewrite(params);
  }
}
```

### 3. Replace generateTaskBreakdown with Real AI

**Current Code:**
```typescript
function generateTaskBreakdown(params: TaskBreakdownParams): { subtasks: any[] } {
  const { task, maxSubtasks, complexity, includeEstimates } = params;
  const baseEstimate = complexity === 'high' ? 6 : complexity === 'medium' ? 4 : 2;
  
  const subtasks = [
    {
      title: 'Requirement audit',
      description: `Validate scope, dependencies, and entry criteria for ${task.title}.`,
      estimatedHours: includeEstimates ? baseEstimate : undefined,
      // ... hardcoded subtask
    }
  ].slice(0, maxSubtasks);
  
  return { subtasks };
}
```

**Required Fix:**
```typescript
async function generateTaskBreakdown(params: TaskBreakdownParams): Promise<{ subtasks: any[] }> {
  const { task, maxSubtasks, complexity, includeEstimates } = params;
  
  const prompt = `
    Break down the following task into logical subtasks:
    
    Task Title: ${task.title}
    Task Content: ${task.content}
    Complexity Level: ${complexity}
    Maximum Subtasks: ${maxSubtasks}
    Include Estimates: ${includeEstimates}
    
    Please break this task into ${maxSubtasks} or fewer logical subtasks that:
    1. Follow a logical progression and dependency order
    2. Are appropriately sized for ${complexity} complexity level
    3. Include clear acceptance criteria for each subtask
    4. ${includeEstimates ? 'Include realistic time estimates in hours' : 'Exclude time estimates'}
    5. Identify dependencies between subtasks where applicable
    
    Return response in JSON format:
    {
      "subtasks": [
        {
          "title": "subtask title",
          "description": "detailed description",
          "estimatedHours": ${includeEstimates ? 'number' : 'undefined'},
          "priority": "low|medium|high",
          "dependencies": ["dependency1", "dependency2"],
          "acceptanceCriteria": ["criteria1", "criteria2"]
        }
      ]
    }
  `;
  
  try {
    const response = await runPantheonComputation({
      actorName: 'task-breakdown-generator',
      goal: `create breakdown for ${task.title}`,
      compute: async () => {
        return await this.llmDriver.generate(prompt);
      },
    });
    
    const result = JSON.parse(response);
    return {
      subtasks: this.validateSubtasks(result.subtasks, maxSubtasks, includeEstimates)
    };
    
  } catch (error) {
    // Fallback to basic breakdown if AI fails
    return this.generateFallbackBreakdown(params);
  }
}
```

### 4. Add Response Validation and Fallbacks

```typescript
private validateAnalysisResponse(analysis: any): any {
  // Ensure response has expected structure
  const validated = {
    qualityScore: this.clampScore(analysis.qualityScore),
    complexityScore: this.clampScore(analysis.complexityScore),
    completenessScore: this.clampScore(analysis.completenessScore),
    suggestions: Array.isArray(analysis.suggestions) ? analysis.suggestions : [],
    risks: Array.isArray(analysis.risks) ? analysis.risks : [],
    dependencies: Array.isArray(analysis.dependencies) ? analysis.dependencies : [],
    subtasks: Array.isArray(analysis.subtasks) ? analysis.subtasks : []
  };
  
  // Add estimated effort if present
  if (analysis.estimatedEffort && typeof analysis.estimatedEffort === 'object') {
    validated.estimatedEffort = {
      hours: typeof analysis.estimatedEffort.hours === 'number' ? analysis.estimatedEffort.hours : 0,
      confidence: this.clampScore(analysis.estimatedEffort.confidence),
      breakdown: Array.isArray(analysis.estimatedEffort.breakdown) ? analysis.estimatedEffort.breakdown : []
    };
  }
  
  return validated;
}

private clampScore(score: any): number {
  return typeof score === 'number' ? Math.min(100, Math.max(0, score)) : 50;
}
```

### 5. Add AI Configuration and Model Selection

```typescript
export interface AIModelConfig {
  provider: 'ollama' | 'openai' | 'anthropic' | 'local';
  model: string;
  temperature: number;
  maxTokens: number;
  timeout: number;
  baseUrl?: string;
  apiKey?: string;
}

export class TaskAIManager {
  constructor(
    config: TaskAIManagerConfig = {},
    aiConfig?: AIModelConfig
  ) {
    this.config = { /* ... */ };
    this.aiConfig = aiConfig || this.getDefaultAIConfig();
    this.llmDriver = this.createLLMDriver(this.aiConfig);
  }
  
  private createLLMDriver(config: AIModelConfig): LLMDriver {
    switch (config.provider) {
      case 'ollama':
        return new OllamaDriver(config);
      case 'openai':
        return new OpenAIDriver(config);
      case 'anthropic':
        return new AnthropicDriver(config);
      case 'local':
        return new LocalLLMDriver(config);
      default:
        throw new Error(`Unsupported AI provider: ${config.provider}`);
    }
  }
}
```

## Acceptance Criteria

- [ ] All hardcoded generator functions replaced with AI calls
- [ ] Real AI integration with Pantheon runtime
- [ ] Response validation and error handling
- [ ] Fallback mechanisms for AI failures
- [ ] Multiple AI provider support
- [ ] Configuration management for AI models
- [ ] Performance monitoring and optimization
- [ ] Comprehensive testing for AI responses

## Files to Modify

- `/packages/kanban/src/lib/task-content/ai.ts`
- AI driver integration files
- Response validation utilities
- Configuration management
- Test files for AI integration

## Performance Considerations

- **Response Time**: AI calls should complete within 30 seconds
- **Reliability**: 95%+ success rate for AI operations
- **Fallback**: Graceful degradation when AI is unavailable
- **Caching**: Cache responses for similar requests
- **Rate Limiting**: Respect AI provider rate limits

## Testing Strategy

- Unit tests for response validation
- Integration tests with AI providers
- Performance tests for response times
- Error handling and fallback tests
- Configuration tests for different providers

## Priority

**HIGH** - Core functionality issue affecting user experience and system value.

## Dependencies

- Pantheon runtime integration
- AI provider drivers
- Response validation framework
- Configuration management system

---

**Created:** 2025-10-26  
**Assignee:** TBD  
**Due Date:** 2025-11-01
**AI Integration Review Required:** Yes
