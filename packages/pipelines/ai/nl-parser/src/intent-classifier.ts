import { Intent, IntentClassifier, ParserConfig } from './types';
import { NlpManager } from '@nlpjs/basic';
import { v4 as uuidv4 } from 'uuid';

export class NlpIntentClassifier implements IntentClassifier {
  private nlpManager: NlpManager;
  private intents: Map<string, Intent> = new Map();

  constructor(private config: ParserConfig) {
    this.nlpManager = new NlpManager({
      languages: [config.language],
      forceNER: true,
      nlu: { log: false }
    });
  }

  async classify(text: string): Promise<{ intent: string; confidence: number }> {
    const response = await this.nlpManager.process('en', text);
    
    return {
      intent: response.answer || 'unknown',
      confidence: response.score || 0
    };
  }

  async addIntent(intent: Intent): Promise<void> {
    this.intents.set(intent.name, intent);

    // Add examples to NLP manager
    for (const example of intent.examples) {
      await this.nlpManager.addDocument('en', example, intent.name);
    }

    // Train the model
    await this.nlpManager.train();
  }

  async removeIntent(intentName: string): Promise<void> {
    this.intents.delete(intentName);
    
    // Note: NLP.js doesn't have a direct way to remove documents
    // In a production system, you might want to recreate the manager
    // or implement a more sophisticated approach
  }

  async getIntents(): Promise<Intent[]> {
    return Array.from(this.intents.values());
  }

  async train(examples: Array<{ text: string; intent: string }>): Promise<void> {
    for (const example of examples) {
      await this.nlpManager.addDocument('en', example.text, example.intent);
    }

    await this.nlpManager.train();
  }

  // Advanced classification with multiple candidates
  async classifyWithCandidates(text: string, maxCandidates: number = 3): Promise<Array<{ intent: string; confidence: number }>> {
    const response = await this.nlpManager.process('en', text);
    
    const candidates = response.classifications || [];
    
    return candidates
      .slice(0, maxCandidates)
      .map((classification: any) => ({
        intent: classification.intent,
        confidence: classification.score
      }))
      .filter(candidate => candidate.confidence >= this.config.confidenceThreshold);
  }

  // Get similar intents based on text similarity
  async getSimilarIntents(text: string, threshold: number = 0.5): Promise<Array<{ intent: string; similarity: number }>> {
    const similar: Array<{ intent: string; similarity: number }> = [];
    
    for (const [intentName, intent] of this.intents) {
      for (const example of intent.examples) {
        const similarity = this.calculateSimilarity(text, example);
        if (similarity >= threshold) {
          similar.push({ intent: intentName, similarity });
          break; // Only add each intent once
        }
      }
    }

    return similar.sort((a, b) => b.similarity - a.similarity);
  }

  private calculateSimilarity(text1: string, text2: string): number {
    // Simple Jaccard similarity for demonstration
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  // Export/import model for persistence
  async exportModel(): Promise<any> {
    return this.nlpManager.export();
  }

  async importModel(model: any): Promise<void> {
    await this.nlpManager.import(model);
  }

  // Get statistics about the classifier
  getStatistics(): {
    intentCount: number;
    totalExamples: number;
    averageExamplesPerIntent: number;
  } {
    const intents = Array.from(this.intents.values());
    const totalExamples = intents.reduce((sum, intent) => sum + intent.examples.length, 0);
    
    return {
      intentCount: intents.length,
      totalExamples,
      averageExamplesPerIntent: intents.length > 0 ? totalExamples / intents.length : 0
    };
  }
}