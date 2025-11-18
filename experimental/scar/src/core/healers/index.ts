/**
 * Healing strategies for different types of file corruption
 */

import { HealingStrategy, HealingResult, FileCorruption, ScarType } from '../../types/index.js';
import { FilenameHealer } from './filename-healer.js';
import { ContentHealer } from './content-healer.js';
import { StructureHealer } from './structure-healer.js';
import { EncodingHealer } from './encoding-healer.js';
import { MetadataHealer } from './metadata-healer.js';

export class HealingStrategyRegistry {
  private strategies: Map<string, HealingStrategy> = new Map();

  constructor() {
    this.registerDefaultStrategies();
  }

  private registerDefaultStrategies(): void {
    const filenameHealer = new FilenameHealer();
    const contentHealer = new ContentHealer();
    const structureHealer = new StructureHealer();
    const encodingHealer = new EncodingHealer();
    const metadataHealer = new MetadataHealer();

    this.register(filenameHealer);
    this.register(contentHealer);
    this.register(structureHealer);
    this.register(encodingHealer);
    this.register(metadataHealer);
  }

  register(strategy: HealingStrategy): void {
    this.strategies.set(strategy.name, strategy);
  }

  getStrategy(name: string): HealingStrategy | undefined {
    return this.strategies.get(name);
  }

  getStrategiesForType(type: ScarType): HealingStrategy[] {
    return Array.from(this.strategies.values())
      .filter((strategy) => strategy.supportedTypes.includes(type))
      .sort((a, b) => b.priority - a.priority);
  }

  getAllStrategies(): HealingStrategy[] {
    return Array.from(this.strategies.values());
  }

  async healCorruption(corruption: FileCorruption, content: string): Promise<HealingResult> {
    const strategies = this.getStrategiesForType(corruption.type);

    for (const strategy of strategies) {
      if (strategy.canHeal(corruption)) {
        try {
          const result = await strategy.heal(corruption, content);
          if (result.success) {
            return result;
          }
        } catch (error) {
          // Continue to next strategy if current one fails
          continue;
        }
      }
    }

    return {
      success: false,
      errorMessage: `No suitable healing strategy found for ${corruption.type}`,
      requiresManualReview: true,
    };
  }
}

// Export all healers for direct access
export { FilenameHealer, ContentHealer, StructureHealer, EncodingHealer, MetadataHealer };
