// SPDX-License-Identifier: GPL-3.0-only
// Placeholder security module for OpenCode Unified

export interface PromptInjectionDetectorResult {
  isInjection: boolean;
  confidence: number;
  detectedPatterns: string[];
  sanitizedInput?: string;
}

export class BasicPromptInjectionDetector {
  detect(input: string): PromptInjectionDetectorResult {
    // Simple placeholder implementation
    return {
      isInjection: false,
      confidence: 0,
      detectedPatterns: [],
      sanitizedInput: input,
    };
  }
}
