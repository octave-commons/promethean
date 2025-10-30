/**
 * AI-powered status normalization using Pantheon OpenAI adapter
 * Uses LLM to intelligently normalize status strings to valid kanban statuses
 */

import { z } from 'zod';
import { makeOpenAIAdapter, type OpenAIAdapterConfig } from '@promethean-os/pantheon';

// Zod schema for validating AI responses
const StatusNormalizationResponse = z.object({
  status: z.enum([
    'icebox',
    'incoming',
    'todo',
    'in_progress',
    'testing',
    'done',
    'ready',
    'blocked',
  ]),
  confidence: z.number().min(0).max(1),
  reasoning: z.string().optional(),
});

export type StatusNormalizationResult = z.infer<typeof StatusNormalizationResponse>;

// Configuration for the normalization service
const config: OpenAIAdapterConfig = {
  apiKey: process.env.OPENAI_API_KEY || '',
  defaultModel: 'gpt-3.5-turbo',
  defaultTemperature: 0.1, // Low temperature for consistent results
};

// Create OpenAI adapter
const llm = makeOpenAIAdapter(config);

/**
 * Normalizes a status string using AI to determine the most likely valid status
 * @param inputStatus The raw status string to normalize
 * @returns Promise resolving to normalized status result
 */
export const normalizeStatusWithAI = async (
  inputStatus: string,
): Promise<StatusNormalizationResult> => {
  const prompt = `You are a kanban board status normalization expert. Given a status string, determine which valid kanban status it most likely belongs to.

Valid statuses are: icebox, incoming, todo, in_progress, testing, done, ready, blocked

Rules:
- "icebox" and variations like "Ice Box", "ice-box" should normalize to "icebox"
- "incoming" and variations like "In-Coming", "in coming" should normalize to "incoming"  
- Empty strings, whitespace-only strings, or null-like strings should be rejected
- Be very confident (0.9+) when the mapping is clear
- Provide brief reasoning for ambiguous cases

Analyze this status: "${inputStatus}"

Respond with JSON only:
{
  "status": "normalized_status",
  "confidence": 0.95,
  "reasoning": "brief explanation"
}`;

  try {
    const response = await llm.complete([
      {
        role: 'system',
        content:
          'You are a kanban status normalization expert. Always respond with valid JSON only.',
      },
      { role: 'user', content: prompt },
    ]);

    // Parse and validate the AI response
    const result = StatusNormalizationResponse.parse(JSON.parse(response.content));
    return result;
  } catch (error) {
    // Fallback to basic normalization if AI fails
    return fallbackNormalization(inputStatus);
  }
};

/**
 * Fallback normalization logic for when AI is unavailable
 * @param inputStatus The status string to normalize
 * @returns Basic normalization result
 */
const fallbackNormalization = (inputStatus: string): StatusNormalizationResult => {
  const trimmed = inputStatus.trim().toLowerCase();

  // Handle empty/whitespace cases
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') {
    return {
      status: 'icebox', // Will be rejected by validation logic
      confidence: 0.1,
      reasoning: 'Empty or invalid input',
    };
  }

  // Basic pattern matching
  if (trimmed.includes('ice') || trimmed.includes('box')) {
    return {
      status: 'icebox',
      confidence: 0.8,
      reasoning: 'Contains ice/box keywords',
    };
  }

  if (trimmed.includes('in') && trimmed.includes('com')) {
    return {
      status: 'incoming',
      confidence: 0.8,
      reasoning: 'Contains in/com keywords',
    };
  }

  if (trimmed.includes('todo') || trimmed.includes('to do')) {
    return {
      status: 'todo',
      confidence: 0.8,
      reasoning: 'Contains todo keywords',
    };
  }

  if (trimmed.includes('progress') || trimmed.includes('doing')) {
    return {
      status: 'in_progress',
      confidence: 0.8,
      reasoning: 'Contains progress/doing keywords',
    };
  }

  if (trimmed.includes('test')) {
    return {
      status: 'testing',
      confidence: 0.8,
      reasoning: 'Contains test keywords',
    };
  }

  if (trimmed.includes('done') || trimmed.includes('complete')) {
    return {
      status: 'done',
      confidence: 0.8,
      reasoning: 'Contains done/complete keywords',
    };
  }

  if (trimmed.includes('ready')) {
    return {
      status: 'ready',
      confidence: 0.8,
      reasoning: 'Contains ready keywords',
    };
  }

  if (trimmed.includes('block')) {
    return {
      status: 'blocked',
      confidence: 0.8,
      reasoning: 'Contains blocked keywords',
    };
  }

  // Default fallback
  return {
    status: 'icebox', // Will be rejected by validation logic
    confidence: 0.1,
    reasoning: 'No clear pattern detected',
  };
};

/**
 * Validates if a normalized status is a valid starting status
 * @param status The normalized status to validate
 * @returns true if valid starting status, false otherwise
 */
export const isValidStartingStatus = (status: string): boolean => {
  const validStartingStatuses = ['icebox', 'incoming'];
  return validStartingStatuses.includes(status);
};

/**
 * Complete validation function that normalizes and validates a status
 * @param inputStatus The raw status string to validate
 * @throws Error if status is invalid or not a valid starting status
 */
export const validateAndNormalizeStatus = async (inputStatus: string): Promise<void> => {
  // Handle empty/whitespace cases immediately
  if (inputStatus === '' || inputStatus.trim() === '') {
    throw new Error(
      `Invalid starting status: "${inputStatus}". Tasks can only be created with starting statuses: icebox, incoming. Use --status flag to specify a valid starting status.`,
    );
  }

  // Use AI to normalize the status
  const normalized = await normalizeStatusWithAI(inputStatus);

  // Check if it's a valid starting status
  if (!isValidStartingStatus(normalized.status)) {
    throw new Error(
      `Invalid starting status: "${inputStatus}". Tasks can only be created with starting statuses: icebox, incoming. Use --status flag to specify a valid starting status.`,
    );
  }

  // If confidence is too low, we might want to be more strict
  if (normalized.confidence < 0.7) {
    throw new Error(
      `Ambiguous starting status: "${inputStatus}". Please be more specific. Valid starting statuses: icebox, incoming. Use --status flag to specify a valid starting status.`,
    );
  }
};
