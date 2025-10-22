/**
 * Natural Language Command Parser
 * Core parser implementation for converting natural language to executable commands
 */

import {
  ParsedCommand,
  CommandEntity,
  CommandPattern,
  ParserConfig,
  ParseResult,
  NLPParser,
} from './types.js';
import {
  DEFAULT_PATTERNS,
  ENTITY_PATTERNS,
  COMMAND_SYNONYMS,
  FUZZY_COMMAND_MAP,
} from './patterns.js';

/**
 * Main Natural Language Parser implementation
 */
export class NaturalLanguageParser implements NLPParser {
  private patterns: Map<string, CommandPattern> = new Map();
  private config: ParserConfig;
  private trainingData: Array<{ input: string; expected: ParsedCommand }> = [];

  constructor(config: Partial<ParserConfig> = {}) {
    this.config = {
      confidenceThreshold: 0.6,
      enableFuzzyMatching: true,
      maxSuggestions: 5,
      ...config,
    };

    // Load default patterns
    DEFAULT_PATTERNS.forEach((pattern) => {
      this.patterns.set(pattern.id, pattern);
    });

    // Add custom patterns if provided
    if (config.customPatterns) {
      config.customPatterns.forEach((pattern) => {
        this.patterns.set(pattern.id, pattern);
      });
    }
  }

  /**
   * Parse natural language input into structured commands
   */
  parse(input: string): ParseResult {
    const trimmedInput = input.trim();
    if (!trimmedInput) {
      return {
        commands: [],
        alternatives: [],
        unrecognized: [''],
        suggestions: [],
        confidence: 0,
      };
    }

    // Extract entities first
    const entities = this.extractEntities(trimmedInput);

    // Try to match patterns
    const matches = this.matchPatterns(trimmedInput);

    // Generate alternatives and suggestions
    const alternatives = this.generateAlternatives(trimmedInput, matches);
    const suggestions = this.generateSuggestions(trimmedInput, matches);
    const unrecognized = this.findUnrecognizedParts(trimmedInput, matches);

    // Calculate overall confidence
    const confidence = this.calculateOverallConfidence(matches);

    return {
      commands: matches.map((match) => this.createParsedCommand(match, trimmedInput, entities)),
      alternatives: alternatives.map((alt) =>
        this.createParsedCommand(alt, trimmedInput, entities),
      ),
      unrecognized,
      suggestions,
      confidence,
    };
  }

  /**
   * Add a custom command pattern
   */
  addPattern(pattern: CommandPattern): void {
    this.patterns.set(pattern.id, pattern);
  }

  /**
   * Remove a command pattern
   */
  removePattern(id: string): void {
    this.patterns.delete(id);
  }

  /**
   * Get all available patterns
   */
  getPatterns(): CommandPattern[] {
    return Array.from(this.patterns.values());
  }

  /**
   * Train parser with examples
   */
  train(examples: { input: string; expected: ParsedCommand }[]): void {
    this.trainingData.push(...examples);

    // In a full implementation, this would update pattern weights
    // and potentially generate new patterns using ML
    console.log(`Trained with ${examples.length} examples`);
  }

  /**
   * Extract entities from input text
   */
  private extractEntities(input: string): CommandEntity[] {
    const entities: CommandEntity[] = [];

    Object.entries(ENTITY_PATTERNS).forEach(([type, pattern]) => {
      let match;
      while ((match = pattern.exec(input)) !== null) {
        entities.push({
          type,
          value: match[0],
          position: {
            start: match.index!,
            end: match.index! + match[0].length,
          },
          confidence: this.calculateEntityConfidence(type, match[0]),
        });
      }
    });

    return entities;
  }

  /**
   * Match input against command patterns
   */
  private matchPatterns(
    input: string,
  ): Array<{ pattern: CommandPattern; match: RegExpMatchArray; confidence: number }> {
    const matches: Array<{ pattern: CommandPattern; match: RegExpMatchArray; confidence: number }> =
      [];

    for (const pattern of this.patterns.values()) {
      const match = input.match(pattern.pattern);
      if (match) {
        const confidence = this.calculatePatternConfidence(pattern, match, input);
        if (confidence >= this.config.confidenceThreshold) {
          matches.push({ pattern, match, confidence });
        }
      }
    }

    // Sort by confidence (highest first)
    return matches.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Generate alternative interpretations
   */
  private generateAlternatives(
    input: string,
    matches: Array<{ pattern: CommandPattern; match: RegExpMatchArray; confidence: number }>,
  ) {
    const alternatives: Array<{
      pattern: CommandPattern;
      match: RegExpMatchArray;
      confidence: number;
    }> = [];

    // If fuzzy matching is enabled, try fuzzy variations
    if (this.config.enableFuzzyMatching) {
      const fuzzyMatches = this.tryFuzzyMatches(input);
      alternatives.push(...fuzzyMatches);
    }

    // Try pattern variations with synonyms
    const synonymMatches = this.trySynonymMatches(input);
    alternatives.push(...synonymMatches);

    // Filter out already matched patterns and sort by confidence
    return alternatives
      .filter((alt) => !matches.some((match) => match.pattern.id === alt.pattern.id))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, this.config.maxSuggestions);
  }

  /**
   * Generate suggestions for similar commands
   */
  private generateSuggestions(
    input: string,
    matches: Array<{ pattern: CommandPattern; match: RegExpMatchArray; confidence: number }>,
  ): string[] {
    const suggestions: string[] = [];

    // Find patterns with similar keywords
    for (const pattern of this.patterns.values()) {
      if (matches.some((match) => match.pattern.id === pattern.id)) {
        continue;
      }

      const patternText = pattern.pattern.source.toLowerCase();
      const similarity = this.calculateStringSimilarity(input.toLowerCase(), patternText);

      if (similarity > 0.3) {
        suggestions.push(pattern.help);
      }
    }

    return suggestions
      .sort((a, b) => b.length - a.length) // Prefer more specific suggestions
      .slice(0, this.config.maxSuggestions);
  }

  /**
   * Find parts of input that weren't recognized
   */
  private findUnrecognizedParts(
    input: string,
    matches: Array<{ pattern: CommandPattern; match: RegExpMatchArray; confidence: number }>,
  ): string[] {
    if (matches.length === 0) {
      return [input];
    }

    const unrecognized: string[] = [];
    let processedInput = input;

    // Remove matched parts from input
    for (const match of matches) {
      const matchedText = match.match[0];
      processedInput = processedInput.replace(matchedText, '').trim();
    }

    if (processedInput) {
      unrecognized.push(processedInput);
    }

    return unrecognized;
  }

  /**
   * Create a parsed command from pattern match
   */
  private createParsedCommand(
    match: { pattern: CommandPattern; match: RegExpMatchArray; confidence: number },
    originalText: string,
    entities: CommandEntity[],
  ): ParsedCommand {
    const args: string[] = [];
    const params: Record<string, string | boolean> = {};

    // Extract arguments using template
    match.pattern.template.forEach((_templateVar, index) => {
      const value = match.match[index + 1];
      if (value) {
        args.push(value.trim());

        // Map to parameter name if mapping exists
        const paramName = match.pattern.paramMapping[index + 1];
        if (paramName) {
          params[paramName] = value.trim();
        }
      }
    });

    // Extract flags and options from entities
    entities.forEach((entity) => {
      if (entity.type === 'priority') {
        params.priority = entity.value;
      } else if (entity.type === 'status') {
        params.status = entity.value;
      } else if (entity.type === 'labels') {
        params.labels = entity.value;
      }
    });

    return {
      action: match.pattern.command,
      args,
      params,
      confidence: match.confidence,
      originalText,
      entities,
    };
  }

  /**
   * Calculate confidence score for a pattern match
   */
  private calculatePatternConfidence(
    pattern: CommandPattern,
    match: RegExpMatchArray,
    input: string,
  ): number {
    let confidence = 0.5; // Base confidence for any match

    // Boost confidence for exact matches
    if (match[0] === input) {
      confidence += 0.3;
    }

    // Boost confidence based on pattern specificity
    const patternComplexity = pattern.pattern.source.length;
    confidence += Math.min(patternComplexity / 100, 0.2);

    // Check if all expected groups were captured
    const expectedGroups = pattern.template.length;
    const actualGroups = match.length - 1;
    if (actualGroups >= expectedGroups) {
      confidence += 0.2;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Calculate confidence score for entity extraction
   */
  private calculateEntityConfidence(entityType: string, value: string): number {
    switch (entityType) {
      case 'uuid':
        return /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value)
          ? 0.95
          : 0.5;
      case 'short_id':
        return /^[a-f0-9]{6,}$/i.test(value) ? 0.8 : 0.4;
      case 'priority':
        return /^(P[0-9]|critical|high|medium|low|urgent|important)$/i.test(value) ? 0.9 : 0.6;
      case 'status':
        return /^(incoming|accepted|breakdown|ready|todo|in_progress|in_review|review|document|done|blocked|rejected)$/i.test(
          value,
        )
          ? 0.9
          : 0.6;
      default:
        return 0.7;
    }
  }

  /**
   * Try fuzzy matches for common typos
   */
  private tryFuzzyMatches(
    input: string,
  ): Array<{ pattern: CommandPattern; match: RegExpMatchArray; confidence: number }> {
    const matches: Array<{ pattern: CommandPattern; match: RegExpMatchArray; confidence: number }> =
      [];
    const words = input.toLowerCase().split(/\s+/);

    for (const [incorrect, correct] of Object.entries(FUZZY_COMMAND_MAP)) {
      if (words.includes(incorrect)) {
        const correctedInput = input.replace(new RegExp(incorrect, 'gi'), correct);

        for (const pattern of this.patterns.values()) {
          const match = correctedInput.match(pattern.pattern);
          if (match) {
            matches.push({
              pattern,
              match,
              confidence: 0.7, // Lower confidence for fuzzy matches
            });
          }
        }
      }
    }

    return matches;
  }

  /**
   * Try matches using command synonyms
   */
  private trySynonymMatches(
    input: string,
  ): Array<{ pattern: CommandPattern; match: RegExpMatchArray; confidence: number }> {
    const matches: Array<{ pattern: CommandPattern; match: RegExpMatchArray; confidence: number }> =
      [];
    const words = input.toLowerCase().split(/\s+/);

    for (const [canonical, synonyms] of Object.entries(COMMAND_SYNONYMS)) {
      for (const synonym of synonyms) {
        if (words.includes(synonym)) {
          const synonymInput = input.replace(new RegExp(synonym, 'gi'), canonical);

          for (const pattern of this.patterns.values()) {
            const match = synonymInput.match(pattern.pattern);
            if (match) {
              matches.push({
                pattern,
                match,
                confidence: 0.8, // Good confidence for synonym matches
              });
            }
          }
        }
      }
    }

    return matches;
  }

  /**
   * Calculate overall confidence for the parsing result
   */
  private calculateOverallConfidence(
    matches: Array<{ pattern: CommandPattern; match: RegExpMatchArray; confidence: number }>,
  ): number {
    if (matches.length === 0) {
      return 0;
    }

    if (matches.length === 1) {
      return matches[0]?.confidence ?? 0;
    }

    // Weight by confidence and pattern specificity
    const totalConfidence = matches.reduce((sum, match) => {
      const weight = (match.pattern?.template?.length ?? 0) / 10; // More specific patterns get higher weight
      return sum + (match.confidence ?? 0) * weight;
    }, 0);

    const totalWeight = matches.reduce((sum, match) => {
      return sum + (match.pattern?.template?.length ?? 0) / 10;
    }, 0);

    return totalWeight > 0 ? totalConfidence / totalWeight : 0;
  }

  /**
   * Calculate string similarity using Levenshtein distance
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) {
      return 1.0;
    }

    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance between two strings
   * Using optimized space approach with explicit array initialization
   */
  private levenshteinDistance(str1: string, str2: string): number {
    if (str1.length === 0) return str2.length;
    if (str2.length === 0) return str1.length;

    // Initialize arrays with explicit size
    const previousRow: number[] = new Array(str1.length + 1);
    const currentRow: number[] = new Array(str1.length + 1);

    // Initialize previous row (distance from empty string to prefixes of str1)
    for (let i = 0; i <= str1.length; i++) {
      previousRow[i] = i;
    }

    // Calculate each row
    for (let j = 1; j <= str2.length; j++) {
      currentRow[0] = j; // First column: distance from str2 prefix to empty string

      for (let i = 1; i <= str1.length; i++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        const deletion = (previousRow[i] ?? 0) + 1;
        const insertion = (currentRow[i - 1] ?? 0) + 1;
        const substitution = (previousRow[i - 1] ?? 0) + cost;

        currentRow[i] = Math.min(deletion, insertion, substitution);
      }

      // Copy currentRow to previousRow for next iteration
      for (let i = 0; i <= str1.length; i++) {
        previousRow[i] = currentRow[i]!;
      }
    }

    return previousRow[str1.length]!;
  }
}

/**
 * Factory function to create a parser with default configuration
 */
export function createParser(config?: Partial<ParserConfig>): NaturalLanguageParser {
  return new NaturalLanguageParser(config);
}

/**
 * Convenience function to parse a single command
 */
export function parseCommand(input: string, config?: Partial<ParserConfig>): ParseResult {
  const parser = createParser(config);
  return parser.parse(input);
}
