// Eidolon Field Classifier - Uses embedding vectors for intelligent task clustering

import type {
  TaskEmbedding,
  ClusterAttractor,
  EidolonClassificationResult,
  LearningStats,
} from './types.js';

export class EidolonFieldClassifier {
  private attractors: Map<string, ClusterAttractor> = new Map();
  private tasks: TaskEmbedding[] = [];
  private embeddingDim: number;
  private fieldDim: number;
  private embeddingModel: string;

  constructor(
    embeddingDim: number = 768,
    fieldDim: number = 8,
    embeddingModel: string = 'nomic-embed-text:latest',
  ) {
    this.embeddingDim = embeddingDim;
    this.fieldDim = fieldDim;
    this.embeddingModel = embeddingModel;
  }

  private generateHashEmbedding(prompt: string): number[] {
    const words = prompt.toLowerCase().split(/\s+/);
    const embedding = new Array(this.embeddingDim).fill(0);

    words.forEach((word, i) => {
      for (let j = 0; j < word.length; j++) {
        const charCode = word.charCodeAt(j);
        const idx = (i * word.length + j) % this.embeddingDim;
        embedding[idx] += charCode / 255;
      }
    });

    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map((val) => (magnitude > 0 ? val / magnitude : 0));
  }

  private reduceEmbedding(embedding: number[]): number[] {
    const step = Math.floor(embedding.length / this.fieldDim);
    return Array(this.fieldDim)
      .fill(0)
      .map((_, i) => embedding[i * step] || 0);
  }

  async addTask(
    taskId: string,
    prompt: string,
    category?: string,
    performance?: number,
  ): Promise<void> {
    console.log(`Adding task ${taskId} with model: ${this.embeddingModel}`);
    const embedding = this.generateHashEmbedding(prompt);
    const task: TaskEmbedding = {
      taskId,
      prompt,
      embedding,
      category,
      timestamp: Date.now(),
      performance,
    };

    this.tasks.push(task);

    if (category) {
      this.updateAttractor(category, embedding, performance);
    }
  }

  private updateAttractor(category: string, embedding: number[], performance?: number): void {
    const attractorId = category;
    let attractor = this.attractors.get(attractorId);

    if (!attractor) {
      attractor = {
        id: attractorId,
        center: embedding,
        strength: 1.0,
        category,
        taskCount: 1,
        averagePerformance: performance || 0.5,
      };
      this.attractors.set(attractorId, attractor);
    } else {
      const weight = 1.0 / attractor.taskCount;
      const newCenter = attractor.center.map(
        (val: number, i: number) => val * (1 - weight) + (embedding[i] || 0) * weight,
      );

      attractor.center = newCenter;
      attractor.taskCount++;
      attractor.averagePerformance =
        (attractor.averagePerformance * (attractor.taskCount - 1) + (performance || 0.5)) /
        attractor.taskCount;
      attractor.strength = Math.min(2.0, attractor.strength + 0.1);
    }
  }

  async classifyTask(taskId: string, prompt: string): Promise<EidolonClassificationResult> {
    const embedding = this.generateHashEmbedding(prompt);
    const fieldCoords = this.reduceEmbedding(embedding);

    let nearestAttractor: ClusterAttractor | undefined;
    let minDistance = Infinity;
    let clusterMembership: number[] = [];

    this.attractors.forEach((attractor) => {
      const attractorCoords = this.reduceEmbedding(attractor.center);
      const distance = Math.sqrt(
        fieldCoords.reduce((sum, val, i) => {
          const diff = val - (attractorCoords[i] || 0);
          return sum + diff * diff;
        }, 0),
      );

      clusterMembership.push(1.0 / (1.0 + distance));

      if (distance < minDistance) {
        minDistance = distance;
        nearestAttractor = attractor;
      }
    });

    const confidence = nearestAttractor ? Math.max(0, 1.0 - minDistance / 10.0) : 0.0;
    const predictedCategory = nearestAttractor?.category || 'unknown';

    const reasoning = `Nearest attractor: ${predictedCategory} (${minDistance.toFixed(2)} units); Confidence: ${confidence.toFixed(2)}`;

    return {
      taskId,
      prompt,
      embedding,
      predictedCategory,
      confidence,
      nearestAttractor,
      distanceToCenter: minDistance,
      clusterMembership,
      reasoning,
    };
  }

  async getFieldStats(): Promise<LearningStats> {
    const attractors = Array.from(this.attractors.values());

    return {
      totalTasks: this.tasks.length,
      attractorCount: attractors.length,
      fieldGridSize: 0,
      averageFieldStrength: 0,
      attractors,
    };
  }

  async evolveField(iterations: number = 10): Promise<void> {
    console.log(`Evolving field for ${iterations} iterations`);

    for (let i = 0; i < iterations; i++) {
      // Simple field evolution simulation
      this.attractors.forEach((attractor) => {
        attractor.strength *= 0.99; // Gradual decay
      });
    }
  }

  async reset(): Promise<void> {
    this.attractors.clear();
    this.tasks = [];
  }
}
