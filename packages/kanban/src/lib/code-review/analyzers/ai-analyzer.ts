/**
 * AI Code Analyzer
 *
 * Integrates with AI models to provide intelligent code analysis,
 * suggestions, and quality assessments.
 */

import { readFile } from 'fs/promises';
import type { AIAnalysisResult, CodeReviewSuggestion, Task } from '../types.js';

export interface AIAnalyzerConfig {
  enabled: boolean;
  model: string;
  temperature: number;
  maxTokens: number;
  timeout: number;
}

/**
 * AI Analyzer for code review
 */
export class AIAnalyzer {
  private config: AIAnalyzerConfig;
  private available: boolean = false;

  constructor(config: AIAnalyzerConfig) {
    this.config = config;
  }

  /**
   * Check if AI analyzer is available
   */
  async checkAvailability(): Promise<void> {
    try {
      // Check if Ollama is available
      const response = await fetch('http://localhost:11434/api/tags', {
        signal: AbortSignal.timeout(5000),
      });
      
      if (!response.ok) {
        throw new Error('Ollama service not responding');
      }

      const data = await response.json();
      const models = data.models || [];
      const modelAvailable = models.some((m: any) => m.name === this.config.model);
      
      if (!modelAvailable) {
        console.warn(`AI model ${this.config.model} not found in Ollama`);
      }

      this.available = true;
    } catch (error) {
      throw new Error(`AI analyzer not available: ${error}`);
    }
  }

  /**
   * Analyze code with AI
   */
  async analyze(
    task: Task,
    files: string[]
  ): Promise<AIAnalysisResult> {
    if (!this.available) {
      throw new Error('AI analyzer is not available');
    }

    try {
      // Read file contents
      const fileContents = await this.readFileContents(files);
      
      // Generate analysis prompt
      const prompt = this.generateAnalysisPrompt(task, fileContents);
      
      // Call AI model
      const response = await this.callAI(prompt);
      
      // Parse AI response
      const result = this.parseAIResponse(response);
      
      return result;

    } catch (error) {
      console.warn('AI analysis failed:', error);
      // Return fallback result
      return {
        insights: ['AI analysis was unavailable'],
        recommendations: ['Consider manual code review'],
        codeQuality: {
          readability: 50,
          maintainability: 50,
          testability: 50,
          documentation: 50,
        },
        suggestions: [],
        confidence: 0,
      };
    }
  }

  /**
   * Read contents of files for analysis
   */
  private async readFileContents(files: string[]): Promise<Map<string, string>> {
    const contents = new Map<string, string>();

    for (const file of files) {
      try {
        const content = await readFile(file, 'utf-8');
        contents.set(file, content);
      } catch (error) {
        console.warn(`Failed to read file ${file}:`, error);
      }
    }

    return contents;
  }

  /**
   * Generate analysis prompt for AI
   */
  private generateAnalysisPrompt(task: Task, fileContents: Map<string, string>): string {
    const filesText = Array.from(fileContents.entries())
      .map(([file, content]) => {
        // Limit content size to avoid token limits
        const truncatedContent = content.length > 2000 
          ? content.substring(0, 2000) + '...[truncated]'
          : content;
        return `File: ${file}\n\`\`\`\n${truncatedContent}\n\`\`\``;
      })
      .join('\n\n');

    return `You are a senior code reviewer conducting a comprehensive code review for a kanban transition.

Task Context:
- Title: ${task.title}
- UUID: ${task.uuid}
- Priority: ${task.priority || 'Not specified'}
- Description: ${task.content?.substring(0, 500) || 'No description provided'}

Code to Review:
${filesText}

Please analyze the code and provide:

1. **Code Quality Assessment** (rate each 0-100):
   - Readability: How clear and understandable is the code?
   - Maintainability: How easy is it to modify and extend?
   - Testability: How easy is it to test the code?
   - Documentation: How well is the code documented?

2. **Insights**: Key observations about the code quality, patterns, and potential issues

3. **Recommendations**: Specific suggestions for improvement

4. **Suggestions**: Detailed improvement suggestions with:
   - Type: improvement, optimization, refactor, or best_practice
   - Category: the area of concern
   - Message: specific recommendation
   - Impact: high, medium, or low
   - Effort: high, medium, or low
   - Example: code example if applicable

Respond in JSON format:
{
  "codeQuality": {
    "readability": 85,
    "maintainability": 75,
    "testability": 90,
    "documentation": 60
  },
  "insights": [
    "Code follows good naming conventions",
    "Missing error handling in several places"
  ],
  "recommendations": [
    "Add comprehensive error handling",
    "Consider adding unit tests for edge cases"
  ],
  "suggestions": [
    {
      "type": "improvement",
      "category": "error-handling",
      "message": "Add try-catch blocks around async operations",
      "impact": "high",
      "effort": "medium",
      "example": "try { await operation(); } catch (error) { handleError(error); }"
    }
  ]
}`;
  }

  /**
   * Call AI model
   */
  private async callAI(prompt: string): Promise<string> {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model,
        prompt,
        stream: false,
        options: {
          temperature: this.config.temperature,
          num_predict: this.config.maxTokens,
        },
      }),
      signal: AbortSignal.timeout(this.config.timeout),
    });

    if (!response.ok) {
      throw new Error(`AI model request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response || '';
  }

  /**
   * Parse AI response
   */
  private parseAIResponse(response: string): AIAnalysisResult {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate and normalize the response
      const codeQuality = {
        readability: this.clamp(parsed.codeQuality?.readability || 50, 0, 100),
        maintainability: this.clamp(parsed.codeQuality?.maintainability || 50, 0, 100),
        testability: this.clamp(parsed.codeQuality?.testability || 50, 0, 100),
        documentation: this.clamp(parsed.codeQuality?.documentation || 50, 0, 100),
      };

      const insights = Array.isArray(parsed.insights) 
        ? parsed.insights.filter((i: any) => typeof i === 'string')
        : [];

      const recommendations = Array.isArray(parsed.recommendations)
        ? parsed.recommendations.filter((r: any) => typeof r === 'string')
        : [];

      const suggestions = Array.isArray(parsed.suggestions)
        ? parsed.suggestions
            .filter((s: any) => typeof s === 'object' && s.message)
            .map((s: any): CodeReviewSuggestion => ({
              id: `ai-suggestion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              type: s.type || 'improvement',
              category: s.category || 'general',
              message: s.message,
              impact: s.impact || 'medium',
              effort: s.effort || 'medium',
              example: s.example,
            }))
        : [];

      // Calculate overall confidence based on response quality
      const confidence = this.calculateConfidence(parsed, response);

      return {
        insights,
        recommendations,
        codeQuality,
        suggestions,
        confidence,
      };

    } catch (error) {
      console.warn('Failed to parse AI response:', error);
      
      // Return fallback result
      return {
        insights: ['AI response could not be parsed'],
        recommendations: ['Manual code review recommended'],
        codeQuality: {
          readability: 50,
          maintainability: 50,
          testability: 50,
          documentation: 50,
        },
        suggestions: [],
        confidence: 0,
      };
    }
  }

  /**
   * Clamp value between min and max
   */
  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  /**
   * Calculate confidence in AI response
   */
  private calculateConfidence(parsed: any, rawResponse: string): number {
    let confidence = 50; // Base confidence

    // Check if response has expected structure
    if (parsed.codeQuality && typeof parsed.codeQuality === 'object') {
      confidence += 10;
    }

    if (Array.isArray(parsed.insights) && parsed.insights.length > 0) {
      confidence += 10;
    }

    if (Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0) {
      confidence += 10;
    }

    if (Array.isArray(parsed.suggestions) && parsed.suggestions.length > 0) {
      confidence += 15;
    }

    // Check response length (longer responses tend to be more detailed)
    if (rawResponse.length > 500) {
      confidence += 5;
    }

    return Math.min(100, confidence);
  }

  /**
   * Get code quality summary
   */
  getCodeQualitySummary(quality: AIAnalysisResult['codeQuality']): string {
    const average = (quality.readability + quality.maintainability + quality.testability + quality.documentation) / 4;
    
    if (average >= 85) {
      return 'Excellent code quality';
    } else if (average >= 70) {
      return 'Good code quality';
    } else if (average >= 55) {
      return 'Fair code quality';
    } else {
      return 'Poor code quality';
    }
  }

  /**
   * Get priority suggestions
   */
  getPrioritySuggestions(suggestions: CodeReviewSuggestion[]): CodeReviewSuggestion[] {
    return suggestions
      .filter(s => s.impact === 'high' && s.effort !== 'high')
      .sort((a, b) => {
        // Sort by impact first, then by effort
        const impactOrder = { high: 3, medium: 2, low: 1 };
        const effortOrder = { low: 3, medium: 2, high: 1 };
        
        const impactDiff = impactOrder[b.impact as keyof typeof impactOrder] - impactOrder[a.impact as keyof typeof impactOrder];
        if (impactDiff !== 0) return impactDiff;
        
        return effortOrder[a.effort as keyof typeof effortOrder] - effortOrder[b.effort as keyof typeof effortOrder];
      });
  }
}