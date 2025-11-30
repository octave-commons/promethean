# Pantheon Framework & Shadow-Conf Integration Guide

## Executive Summary

This document provides comprehensive guidance for integrating Pantheon framework's LLM adapter system with shadow-conf's AI-driven security evaluation. The integration replaces hardcoded security rules with contextual AI evaluation while maintaining production-grade reliability and security.

## Integration Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   shadow-conf    │    │   Pantheon       │    │   LLM Provider  │
│                 │    │   Framework      │    │                 │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │ ┌─────────────┐ │
│ │ AI Security │ │    │ │  LlmPort     │ │    │ │   Ollama    │ │
│ │ Evaluator   │─┼────┼─│  Interface   │─┼────┼─│   (Local)   │ │
│ └─────────────┘ │    │ └──────────────┘ │    │ └─────────────┘ │
│                 │    │                  │    │                 │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │ ┌─────────────┐ │
│ │ Traditional │ │    │ │  OpenAI      │ │    │ │   OpenAI    │ │
│ │ Security    │ │    │ │  Adapter     │ │    │ │  (Cloud)    │ │
│ │ Validation  │ │    │ └──────────────┘ │    │ └─────────────┘ │
│ └─────────────┘ │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Data Flow with AI Security

1. **EDN Discovery**: Find all `.edn` files in input directory
2. **AI Security Evaluation**: Each file path and content evaluated by AI
3. **Traditional Validation**: Pattern-based validation as fallback
4. **Contextual Processing**: Security-aware EDN parsing and normalization
5. **Secure Generation**: PM2 ecosystem generation with validated paths

## Implementation Guide

### Step 1: Update Dependencies

Ensure shadow-conf has the correct Pantheon dependencies:

```json
{
  "dependencies": {
    "@promethean-os/pantheon": "workspace:*",
    "@promethean-os/pantheon-llm-openai": "workspace:*"
  }
}
```

### Step 2: Replace Custom Adapters

Remove custom OpenAI/Ollama adapters and use Pantheon's production-ready implementations:

```typescript
// ❌ Remove custom adapters from ai-security-evaluator.ts
export function createOllamaAdapter(model: string = 'error/qwen3:4b-instruct-100k'): LlmPort {
  return {
    complete: async (messages, opts) => {
      // Custom implementation...
    },
  };
}

// ✅ Use Pantheon's adapters
import { makeOpenAIAdapter } from '@promethean-os/pantheon-llm-openai';

export function createOllamaAdapter(model: string = 'error/qwen3:4b-instruct-100k'): LlmPort {
  return makeOpenAIAdapter({
    apiKey: 'ollama', // Ollama doesn't need real API key
    baseURL: 'http://localhost:11434/v1',
    defaultModel: model,
    defaultTemperature: 0.2,
    timeout: 30000,
    retryConfig: {
      maxRetries: 2,
      baseDelay: 1000,
      maxDelay: 10000,
    },
  });
}
```

### Step 3: Integrate AI Security into Main Pipeline

Update `ecosystem-secure.ts` to use AI security evaluation:

```typescript
import { createAISecurityEvaluator, createOllamaAdapter } from './ai-security-evaluator.js';

export async function generateEcosystemSecure(
  options: SecureGenerateEcosystemOptions = {},
): Promise<GenerateEcosystemResult> {
  const {
    inputDir = process.cwd(),
    outputDir = process.cwd(),
    fileName = DEFAULT_OUTPUT_FILE_NAME,
    security = {},
  } = options;

  // Initialize AI security evaluator
  const aiEvaluator = createAISecurityEvaluator({
    llmPort: createOllamaAdapter(),
    model: 'error/qwen3:4b-instruct-100k',
    temperature: 0.2,
    blockThreshold: 0.8,
    warnThreshold: 0.5,
    enableUserConfirmation: !process.env.CI,
    ...security,
  });

  // Validate input directory with AI
  await aiEvaluator.validateWithAI(inputDir, 'filepath', 'input directory');

  // Continue with AI-enhanced processing...
  const ednFiles = await collectEdnFilesWithAI(inputDir, aiEvaluator);
  const documents = await loadDocumentsWithAI(ednFiles, aiEvaluator);

  // Generate with security validation
  return generateSecureEcosystem(documents, { outputDir, fileName }, aiEvaluator);
}
```

### Step 4: Implement Contextual Security Evaluation

Enhance AI security evaluation with context awareness:

```typescript
export interface SecurityEvaluationContext {
  inputType: 'filename' | 'filepath' | 'content' | 'edn-data';
  sourceLocation: string;
  processingStage: 'discovery' | 'parsing' | 'normalization' | 'generation';
  userIntent: 'development' | 'deployment' | 'automation';
  environmentContext: {
    isLocalDev: boolean;
    isProduction: boolean;
    hasUserInteraction: boolean;
  };
}

export class ContextualAISecurityEvaluator {
  constructor(private readonly llmPort: LlmPort) {}

  async evaluateWithContext(
    input: string,
    context: SecurityEvaluationContext,
  ): Promise<SecurityThreatAssessment> {
    const systemPrompt = this.createContextualPrompt(context);

    const assessment = await this.llmPort.complete(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Evaluate: ${input}` },
      ],
      {
        temperature: 0.2,
        model: 'error/qwen3:4b-instruct-100k',
      },
    );

    return this.parseAssessment(assessment.content, context);
  }

  private createContextualPrompt(context: SecurityEvaluationContext): string {
    return `You are an AI security evaluator for shadow-conf, an EDN-to-PM2 configuration tool.

CONTEXT:
- Processing Stage: ${context.processingStage}
- Source: ${context.sourceLocation}
- Environment: ${context.environmentContext.isLocalDev ? 'Local Development' : 'Production'}
- User Intent: ${context.userIntent}

SECURITY EVALUATION CRITERIA:
1. Path traversal attacks that could access system directories
2. Code injection in filenames, paths, or EDN content
3. Command injection patterns in configuration values
4. Script injection attempts in any input
5. Suspicious patterns indicating malicious intent

CONTEXT-AWARE RULES:
- Local development: Allow more flexibility, warn on suspicious patterns
- Production: Strict validation, block on medium confidence threats
- Automation: Higher tolerance for programmatic patterns
- User interaction: Allow confirmation for borderline cases

RESPOND WITH JSON ASSESSMENT:
{
  "isThreat": boolean,
  "confidence": number (0-1),
  "threatType": "path-traversal" | "code-injection" | "command-injection" | "script-injection" | "content-injection" | "suspicious-pattern" | null,
  "explanation": "Human-readable explanation of the assessment",
  "suggestedAction": "block" | "warn" | "allow",
  "patterns": ["list of concerning patterns found"],
  "riskFactors": ["list of risk factors considered"]
}`;
  }
}
```

## Security Enhancement Benefits

### 1. **Contextual Threat Assessment**

Traditional security validation uses static patterns:

```typescript
// ❌ Static pattern matching
const dangerousPatterns = ['../', '<script', 'eval('];
if (dangerousPatterns.some((pattern) => input.includes(pattern))) {
  return { isThreat: true, explanation: 'Dangerous pattern detected' };
}
```

AI-driven security evaluation understands context:

```typescript
// ✅ Contextual AI evaluation
const assessment = await aiEvaluator.evaluateWithContext(input, {
  processingStage: 'parsing',
  sourceLocation: 'services/api/ecosystem.edn',
  userIntent: 'development',
  environmentContext: { isLocalDev: true, isProduction: false, hasUserInteraction: true },
});

// AI can distinguish between:
// - "../../../shared/config" (legitimate relative path)
// - "../../../etc/passwd" (malicious path traversal)
// - "eval('health-check')" (legitimate monitoring)
// - "eval(maliciousCode)" (potential injection)
```

### 2. **Adaptive Security Policies**

The AI adapts security levels based on context:

| Context               | Security Level | Block Threshold | User Confirmation |
| --------------------- | -------------- | --------------- | ----------------- |
| Local Development     | Permissive     | 0.9             | Enabled           |
| CI/CD Pipeline        | Moderate       | 0.7             | Disabled          |
| Production Deployment | Strict         | 0.5             | Disabled          |
| Interactive Session   | Adaptive       | 0.8             | Enabled           |

### 3. **Explainable Security Decisions**

Unlike static patterns, AI provides reasoning:

```json
{
  "isThreat": false,
  "confidence": 0.95,
  "threatType": null,
  "explanation": "Path '../shared/config' is a legitimate relative path for accessing shared configuration in a development environment. No malicious patterns detected.",
  "suggestedAction": "allow",
  "patterns": [],
  "riskFactors": ["relative-path-in-development"]
}
```

## Production Deployment Guide

### 1. **LLM Provider Configuration**

#### Local Development (Ollama)

```typescript
const ollamaAdapter = makeOpenAIAdapter({
  apiKey: 'ollama',
  baseURL: 'http://localhost:11434/v1',
  defaultModel: 'error/qwen3:4b-instruct-100k',
  defaultTemperature: 0.2,
  timeout: 30000,
});
```

#### Production (OpenAI)

```typescript
const openaiAdapter = makeOpenAIAdapter({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://api.openai.com/v1',
  defaultModel: 'gpt-4',
  defaultTemperature: 0.1, // Lower temperature for consistent security
  timeout: 60000,
  retryConfig: {
    maxRetries: 5,
    baseDelay: 2000,
    maxDelay: 30000,
  },
});
```

#### Hybrid Setup

```typescript
const hybridAdapter = {
  complete: async (messages, opts) => {
    try {
      // Try local Ollama first for speed
      return await ollamaAdapter.complete(messages, opts);
    } catch (error) {
      console.warn('Local Ollama unavailable, using OpenAI fallback');
      return await openaiAdapter.complete(messages, opts);
    }
  },
};
```

### 2. **Security Configuration**

#### Development Environment

```typescript
const devSecurityConfig = {
  enableAI: true,
  blockThreshold: 0.9,
  warnThreshold: 0.6,
  enableUserConfirmation: true,
  fallbackToTraditional: true,
  contextAwareness: {
    environment: 'development',
    allowRelativePaths: true,
    strictMode: false,
  },
};
```

#### Production Environment

```typescript
const prodSecurityConfig = {
  enableAI: true,
  blockThreshold: 0.5,
  warnThreshold: 0.3,
  enableUserConfirmation: false,
  fallbackToTraditional: true,
  contextAwareness: {
    environment: 'production',
    allowRelativePaths: false,
    strictMode: true,
  },
};
```

### 3. **Monitoring and Logging**

Enable comprehensive security monitoring:

```typescript
// Security event logging
console.log(`🔍 AI Security Assessment: ${assessment.context.inputType} "${input}"`);
console.log(`   Threat: ${assessment.isThreat ? 'YES' : 'NO'}`);
console.log(`   Confidence: ${(assessment.confidence * 100).toFixed(1)}%`);
console.log(`   Action: ${assessment.suggestedAction}`);
console.log(`   Explanation: ${assessment.explanation}`);

// Metrics collection
SecurityMetrics.record({
  timestamp: Date.now(),
  inputType: assessment.context.inputType,
  isThreat: assessment.isThreat,
  confidence: assessment.confidence,
  suggestedAction: assessment.suggestedAction,
  processingTime: assessment.processingTime,
});
```

## Testing and Validation

### 1. **Unit Testing AI Security**

```typescript
import test from 'ava';
import { createAISecurityEvaluator, createMockOpenCodeAdapter } from '@promethean-os/shadow-conf';

test('AI security evaluator - legitimate path', async (t) => {
  const evaluator = createAISecurityEvaluator({
    llmPort: createMockOpenCodeAdapter(),
    blockThreshold: 0.8,
    warnThreshold: 0.5,
  });

  const assessment = await evaluator.evaluateSecurityThreat(
    './services/api/ecosystem.edn',
    'filepath',
  );

  t.false(assessment.isThreat);
  t.true(assessment.confidence > 0.8);
  t.is(assessment.suggestedAction, 'allow');
});

test('AI security evaluator - malicious path', async (t) => {
  const evaluator = createAISecurityEvaluator({
    llmPort: createMockOpenCodeAdapter(),
    blockThreshold: 0.8,
    warnThreshold: 0.5,
  });

  const assessment = await evaluator.evaluateSecurityThreat('../../../etc/passwd', 'filepath');

  t.true(assessment.isThreat);
  t.true(assessment.confidence > 0.8);
  t.is(assessment.suggestedAction, 'block');
});
```

### 2. **Integration Testing**

```typescript
test('complete pipeline with AI security', async (t) => {
  const result = await generateEcosystemSecure({
    inputDir: './test/fixtures/valid-configs',
    outputDir: './test/output',
    security: {
      enableAI: true,
      blockThreshold: 0.8,
      warnThreshold: 0.5,
      enableUserConfirmation: false,
    },
  });

  t.true(result.apps.length > 0);
  t.true(fs.existsSync(result.outputPath));

  // Verify generated content is secure
  const content = fs.readFileSync(result.outputPath, 'utf8');
  t.false(content.includes('../'));
  t.false(content.includes('<script'));
});
```

## Troubleshooting

### Common Issues

#### 1. **Ollama Connection Failed**

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Start Ollama if not running
ollama serve

# Pull required model
ollama pull error/qwen3:4b-instruct-100k
```

#### 2. **AI Security Evaluation Timeout**

```typescript
// Increase timeout for complex evaluations
const adapter = makeOpenAIAdapter({
  timeout: 120000, // 2 minutes
  retryConfig: {
    maxRetries: 1,
    baseDelay: 5000,
  },
});
```

#### 3. **High False Positive Rate**

```typescript
// Adjust thresholds for your environment
const securityConfig = {
  blockThreshold: 0.9, // Increase for stricter blocking
  warnThreshold: 0.7, // Increase for fewer warnings
  temperature: 0.1, // Lower for more consistent decisions
};
```

## Performance Considerations

### 1. **Caching AI Evaluations**

```typescript
const evaluationCache = new Map<string, SecurityThreatAssessment>();

async function cachedEvaluation(
  input: string,
  inputType: string,
): Promise<SecurityThreatAssessment> {
  const cacheKey = `${inputType}:${input}`;

  if (evaluationCache.has(cacheKey)) {
    return evaluationCache.get(cacheKey)!;
  }

  const assessment = await aiEvaluator.evaluateSecurityThreat(input, inputType as any);
  evaluationCache.set(cacheKey, assessment);

  return assessment;
}
```

### 2. **Batch Processing**

```typescript
// Evaluate multiple inputs in parallel
const assessments = await Promise.all(
  files.map((file) =>
    aiEvaluator.evaluateSecurityThreat(file.path, 'filepath', `from ${file.dir}`),
  ),
);

// Filter out threats
const safeFiles = files.filter((_, index) => !assessments[index].isThreat);
```

## Conclusion

The integration of Pantheon framework with shadow-conf's AI-driven security evaluation provides:

1. **Production-Ready LLM Integration**: Robust error handling, retry logic, and input validation
2. **Contextual Security**: AI understands development vs production contexts
3. **Adaptive Threat Assessment**: Different security levels for different environments
4. **Explainable Decisions**: AI provides reasoning for security decisions
5. **Fallback Protection**: Traditional validation as backup when AI is unavailable

This integration transforms shadow-conf from a static configuration tool into an intelligent, security-aware system that can adapt to different contexts while maintaining production-grade reliability.

---

**Integration Date**: October 28, 2025  
**Framework Versions**: Pantheon v0.1.0, shadow-conf v0.0.0  
**Security Level**: Production-Ready with AI Enhancement
