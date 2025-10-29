/**
 * AI-Driven Security Evaluation System
 *
 * Implements contextual AI security evaluation using Pantheon framework
 * with local OpenCode LLM integration for intelligent threat assessment.
 *
 * This replaces hardcoded security rules with contextual AI evaluation
 * that can understand patterns, context, and user intent.
 */

import type { LlmPort, Message } from '@promethean-os/pantheon';
import type { SecurityConfig } from './security-utils.js';

/**
 * Security threat assessment result
 */
export interface SecurityThreatAssessment {
  /** Whether the input is considered a threat */
  isThreat: boolean;
  /** Threat confidence score (0-1) */
  confidence: number;
  /** Type of threat detected */
  threatType?:
    | 'path-traversal'
    | 'code-injection'
    | 'command-injection'
    | 'script-injection'
    | 'content-injection'
    | 'suspicious-pattern';
  /** Human-readable explanation */
  explanation: string;
  /** Suggested action */
  suggestedAction: 'block' | 'warn' | 'allow';
  /** Context for the decision */
  context: {
    input: string;
    inputType: 'filename' | 'filepath' | 'content' | 'edn-data';
    patterns: string[];
    riskFactors: string[];
  };
}

/**
 * AI Security Evaluator Configuration
 */
export interface AISecurityConfig {
  /** LLM port for AI evaluation */
  llmPort: LlmPort;
  /** Model to use for security evaluation */
  model: string;
  /** Temperature for evaluation (lower for consistent security decisions) */
  temperature: number;
  /** Confidence threshold for blocking */
  blockThreshold: number;
  /** Confidence threshold for warning */
  warnThreshold: number;
  /** Enable user confirmation for warnings */
  enableUserConfirmation: boolean;
}

/**
 * Default AI security configuration
 */
export const DEFAULT_AI_SECURITY_CONFIG: Omit<AISecurityConfig, 'llmPort'> = {
  model: 'error/qwen3:4b-instruct-100k',
  temperature: 0.2, // Low temperature for consistent security evaluation
  blockThreshold: 0.8,
  warnThreshold: 0.5,
  enableUserConfirmation: true,
};

/**
 * Creates an AI-driven security evaluator using Pantheon framework
 *
 * @param config - AI security configuration
 * @returns Security evaluator function
 */
export function createAISecurityEvaluator(config: AISecurityConfig) {
  const { llmPort, model, temperature, blockThreshold, warnThreshold, enableUserConfirmation } = {
    ...DEFAULT_AI_SECURITY_CONFIG,
    ...config,
  };

  /**
   * Evaluates security threats using AI contextual analysis
   *
   * @param input - Input to evaluate (filename, path, or content)
   * @param inputType - Type of input being evaluated
   * @param context - Additional context for evaluation
   * @returns Security threat assessment
   */
  async function evaluateSecurityThreat(
    input: string,
    inputType: 'filename' | 'filepath' | 'content' | 'edn-data',
    additionalContext?: string,
  ): Promise<SecurityThreatAssessment> {
    // Create security evaluation prompt
    const systemPrompt = `You are an AI security evaluator for an internal OS tool called shadow-conf.
Your task is to evaluate potential security threats in filenames, file paths, and content.

CONTEXT:
- This is an internal OS tool, not a web application
- The tool processes EDN configuration files for process management
- Users are developers working on their own systems
- We want to prevent accidents while allowing legitimate development work

EVALUATION CRITERIA:
1. Path traversal attempts that could access system directories
2. Code injection attempts in filenames or content
3. Command injection patterns
4. Script injection attempts
5. Suspicious patterns that indicate malicious intent
6. Content that could be dangerous if executed

RESPONSE FORMAT (JSON only):
{
  "isThreat": boolean,
  "confidence": number (0-1),
  "threatType": "path-traversal" | "code-injection" | "command-injection" | "script-injection" | "content-injection" | "suspicious-pattern" | null,
  "explanation": "Human-readable explanation of the assessment",
  "suggestedAction": "block" | "warn" | "allow",
  "patterns": ["list of concerning patterns found"],
  "riskFactors": ["list of risk factors considered"]
}

Be thorough but reasonable. Distinguish between actual threats and legitimate development patterns.`;

    const userPrompt = `Evaluate this ${inputType} for security threats:

Input: ${input}
${additionalContext ? `Additional Context: ${additionalContext}` : ''}

Provide a JSON response following the specified format.`;

    try {
      const response = await llmPort.complete(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        {
          model,
          temperature,
        },
      );

      // Parse AI response
      const aiAssessment = JSON.parse(response.content);

      // Determine final action based on confidence
      let suggestedAction: 'block' | 'warn' | 'allow';
      if (aiAssessment.confidence >= blockThreshold) {
        suggestedAction = 'block';
      } else if (aiAssessment.confidence >= warnThreshold) {
        suggestedAction = enableUserConfirmation ? 'warn' : 'allow';
      } else {
        suggestedAction = 'allow';
      }

      return {
        isThreat: aiAssessment.isThreat && suggestedAction !== 'allow',
        confidence: aiAssessment.confidence,
        threatType: aiAssessment.threatType,
        explanation: aiAssessment.explanation,
        suggestedAction,
        context: {
          input,
          inputType,
          patterns: aiAssessment.patterns || [],
          riskFactors: aiAssessment.riskFactors || [],
        },
      };
    } catch (error) {
      // Fallback to conservative security if AI evaluation fails
      console.warn('AI security evaluation failed, using conservative fallback:', error);
      return {
        isThreat: true,
        confidence: 0.9,
        threatType: 'suspicious-pattern',
        explanation: 'AI security evaluation failed, applying conservative security measure',
        suggestedAction: 'block',
        context: {
          input,
          inputType,
          patterns: ['ai-evaluation-failed'],
          riskFactors: ['ai-unavailable'],
        },
      };
    }
  }

  /**
   * Prompts user for confirmation when AI suggests warning
   *
   * @param assessment - Security threat assessment
   * @returns User decision
   */
  async function promptUserConfirmation(assessment: SecurityThreatAssessment): Promise<boolean> {
    if (!enableUserConfirmation || assessment.suggestedAction !== 'warn') {
      return assessment.suggestedAction !== 'block';
    }

    // In a real implementation, this would prompt the user
    // For now, we'll log and proceed with caution
    console.warn(`⚠️  Security Warning:
Input: ${assessment.context.input}
Type: ${assessment.context.inputType}
Threat: ${assessment.threatType}
Confidence: ${assessment.confidence}
Explanation: ${assessment.explanation}

Allow this operation? (y/N)`);

    // For automated environments, we default to safe choice
    // In interactive environments, this would wait for user input
    return false; // Default to safe choice
  }

  /**
   * Evaluates and potentially blocks input based on AI security assessment
   *
   * @param input - Input to evaluate
   * @param inputType - Type of input
   * @param additionalContext - Additional context
   * @returns Promise that resolves if allowed, throws if blocked
   */
  async function validateWithAI(
    input: string,
    inputType: 'filename' | 'filepath' | 'content' | 'edn-data',
    additionalContext?: string,
  ): Promise<void> {
    const assessment = await evaluateSecurityThreat(input, inputType, additionalContext);

    // Log assessment for transparency
    console.log(`🔍 AI Security Assessment: ${assessment.context.inputType} "${input}"`);
    console.log(`   Threat: ${assessment.isThreat ? 'YES' : 'NO'}`);
    console.log(`   Confidence: ${(assessment.confidence * 100).toFixed(1)}%`);
    console.log(`   Action: ${assessment.suggestedAction}`);
    if (assessment.threatType) {
      console.log(`   Type: ${assessment.threatType}`);
    }
    console.log(`   Explanation: ${assessment.explanation}`);

    if (assessment.suggestedAction === 'block') {
      throw new Error(`Security threat detected: ${assessment.explanation}`);
    }

    if (assessment.suggestedAction === 'warn') {
      const userAllowed = await promptUserConfirmation(assessment);
      if (!userAllowed) {
        throw new Error(`Operation cancelled by user: ${assessment.explanation}`);
      }
    }
  }

  return {
    evaluateSecurityThreat,
    validateWithAI,
    promptUserConfirmation,
  };
}

/**
 * Creates a real Ollama adapter for local LLM integration
 * Connects to local Ollama instance at http://localhost:11434
 */
export function createOllamaAdapter(model: string = 'error/qwen3:4b-instruct-100k'): LlmPort {
  return {
    complete: async (
      messages: Message[],
      opts?: { model?: string; temperature?: number },
    ): Promise<Message> => {
      try {
        const response = await fetch('http://localhost:11434/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: opts?.model || model,
            messages: messages.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            stream: false,
            options: {
              temperature: opts?.temperature || 0.2,
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.message?.content) {
          throw new Error('Invalid response from Ollama API');
        }

        return {
          role: 'assistant',
          content: data.message.content,
        };
      } catch (error) {
        console.error('Ollama adapter error:', error);
        // Fallback to simple pattern matching if Ollama fails
        return createFallbackResponse(messages);
      }
    },
  };
}

/**
 * Creates a fallback response when Ollama is unavailable
 */
function createFallbackResponse(messages: Message[]): Message {
  const lastMessage = messages[messages.length - 1];
  const input = lastMessage.content;

  // Simple pattern-based security evaluation as fallback
  const dangerousPatterns = [
    '../',
    '..\\',
    '<script',
    'javascript:',
    'eval(',
    'exec(',
    '$(',
    '`',
    '; DROP TABLE',
    'require(',
    'process.',
    'fs.',
    'child_process',
  ];

  const foundPatterns = dangerousPatterns.filter((pattern) =>
    input.toLowerCase().includes(pattern.toLowerCase()),
  );

  const isThreat = foundPatterns.length > 0;
  const confidence = Math.min(0.9, foundPatterns.length * 0.3);

  let threatType: SecurityThreatAssessment['threatType'] = undefined;
  if (input.includes('../') || input.includes('..\\')) {
    threatType = 'path-traversal';
  } else if (input.includes('<script') || input.includes('javascript:')) {
    threatType = 'script-injection';
  } else if (input.includes('eval(') || input.includes('exec(')) {
    threatType = 'code-injection';
  } else if (input.includes('$(') || input.includes('`')) {
    threatType = 'command-injection';
  }

  const assessment = {
    isThreat,
    confidence,
    threatType,
    explanation: isThreat
      ? `Detected potentially dangerous patterns: ${foundPatterns.join(', ')}`
      : 'No obvious security threats detected',
    suggestedAction: confidence > 0.7 ? 'block' : confidence > 0.4 ? 'warn' : 'allow',
    patterns: foundPatterns,
    riskFactors: isThreat ? ['pattern-matching'] : [],
  };

  return {
    role: 'assistant',
    content: JSON.stringify(assessment),
  };
}

/**
 * Creates a mock OpenCode adapter for testing purposes
 */
export function createMockOpenCodeAdapter(model: string = 'error/qwen3:4b-instruct-100k'): LlmPort {
  return {
    complete: async (
      messages: Message[],
      opts?: { model?: string; temperature?: number },
    ): Promise<Message> => {
      return createFallbackResponse(messages);
    },
  };
}
