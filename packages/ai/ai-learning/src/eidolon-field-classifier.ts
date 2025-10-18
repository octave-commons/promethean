// Eidolon Field-Based Task Classifier
// Uses embedding vectors and physics simulation for intelligent task clustering

import type {
  TaskEmbedding,
  ClusterAttractor,
  EidolonClassificationResult,
  LearningStats,
} from './types.js';

// Dynamic import with type assertions for JavaScript module
let VectorN: any;
let FieldN: any;
let FieldNode: any;

async function loadEidolonField() {
  if (!VectorN) {
    const module = await import('@promethean/eidolon-field');
    VectorN = module.VectorN;
    FieldN = module.FieldN;
    FieldNode = module.FieldNode;
  }
}

export class EidolonFieldClassifier {
  private field: any; // Will be FieldN when initialized
  private attractors: Map<string, ClusterAttractor> = new Map();
  private tasks: TaskEmbedding[] = [];
  private embeddingDim: number;
  private fieldDim: number;
  private pcaMatrix?: number[][];
  private pcaMean?: number[];
  private initialized = false;
  private embeddingModel: string;
  private maxRetries: number;
  private timeoutMs: number;

  constructor(
    embeddingDim: number = 768, // nomic-embed-text produces 768 dimensions
    fieldDim: number = 8,
    embeddingModel: string = 'nomic-embed-text:latest',
    maxRetries: number = 3,
    timeoutMs: number = 30000,
  ) {
    this.embeddingDim = embeddingDim;
    this.fieldDim = fieldDim;
    this.embeddingModel = embeddingModel;
    this.maxRetries = maxRetries;
    this.timeoutMs = timeoutMs;
  }

  private async ensureInitialized() {
    if (!this.initialized) {
      await loadEidolonField();
      this.field = new FieldN(this.fieldDim, 0.95); // Slower decay for stability
      this.initialized = true;
    }
  }

  /**
   * Generate embedding for task prompt using Ollama embedding model
   */
  async generateEmbedding(prompt: string): Promise<number[]> {
    try {
      // Try to get embedding from Ollama
      const embedding = await this.getOllamaEmbedding(prompt);
      return embedding;
    } catch (error) {
      console.warn(`Ollama embedding failed, falling back to hash-based: ${error}`);
      // Fallback to hash-based embedding
      return this.generateHashEmbedding(prompt);
    }
  }

/**
   * Get embedding from Ollama queue system
   */
  private async getOllamaEmbedding(prompt: string): Promise<number[]> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        // Submit embedding job to Ollama queue using the proper tool
        const jobResponse = await (globalThis as any).ollamaQueueSubmitJob?.({
          jobName: `embedding-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          modelName: this.embeddingModel,
          jobType: 'embedding',
          input: prompt,
          priority: 'medium',
          options: {
            temperature: 0.0, // Deterministic for embeddings
          }
        });

        if (!jobResponse || !jobResponse.jobId) {
          throw new Error('Failed to submit embedding job to Ollama queue');
        }

        const jobId = jobResponse.jobId;

        // Wait for job completion with timeout
        const startTime = Date.now();
        while (Date.now() - startTime < this.timeoutMs) {
          const status = await (globalThis as any).ollamaQueueGetJobStatus?.({ jobId });

          if (!status) {
            throw new Error('Failed to get job status from Ollama queue');
          }

          if (status.status === 'completed') {
            // Get the embedding result
            const result = await (globalThis as any).ollamaQueueGetJobResult?.({ jobId });

            if (!result || !result.embedding) {
              throw new Error('Job completed but no embedding result found');
            }

            // Ensure the embedding has the correct dimension
            const embedding = Array.isArray(result.embedding) ? result.embedding : result.embedding.data;
            
            if (!Array.isArray(embedding)) {
              throw new Error('Invalid embedding format received from Ollama');
            }

            // Validate embedding dimension
            if (embedding.length !== this.embeddingDim) {
              console.warn(`Embedding dimension mismatch: expected ${this.embeddingDim}, got ${embedding.length}`);
              
              // If embedding is larger, truncate it
              if (embedding.length > this.embeddingDim) {
                return embedding.slice(0, this.embeddingDim);
              }
              
              // If embedding is smaller, pad with zeros
              if (embedding.length < this.embeddingDim) {
                const padded = new Array(this.embeddingDim).fill(0);
                for (let i = 0; i < embedding.length; i++) {
                  padded[i] = embedding[i];
                }
                return padded;
              }
            }

            return embedding;
          }

          if (status.status === 'failed') {
            throw new Error(`Embedding job failed: ${status.error || 'Unknown error'}`);
          }

          if (status.status === 'canceled') {
            throw new Error('Embedding job was canceled');
          }

          // Job is still pending/running, wait a bit
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        throw new Error(`Embedding job timed out after ${this.timeoutMs}ms`);

      } catch (error) {
        lastError = error as Error;
        console.warn(`Embedding attempt ${attempt + 1} failed:`, error);
        
        // Wait before retry (exponential backoff)
        if (attempt < this.maxRetries - 1) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('All embedding attempts failed');
  }

        const jobId = jobResponse.jobId;

        // Wait for job completion with timeout
        const startTime = Date.now();
        while (Date.now() - startTime < this.timeoutMs) {
          const status = await ollamaQueueGetJobStatus({ jobId });

          if (!status) {
            throw new Error('Failed to get job status from Ollama queue');
          }

          if (status.status === 'completed') {
            // Get the embedding result
            const result = await ollamaQueueGetJobResult({ jobId });

            if (!result || !result.embedding) {
              throw new Error('Job completed but no embedding result found');
            }

            // Ensure the embedding has the correct dimension
            const embedding = Array.isArray(result.embedding)
              ? result.embedding
              : result.embedding.data;

            if (!Array.isArray(embedding)) {
              throw new Error('Invalid embedding format received from Ollama');
            }

            // Validate embedding dimension
            if (embedding.length !== this.embeddingDim) {
              console.warn(
                `Embedding dimension mismatch: expected ${this.embeddingDim}, got ${embedding.length}`,
              );

              // If embedding is larger, truncate it
              if (embedding.length > this.embeddingDim) {
                return embedding.slice(0, this.embeddingDim);
              }

              // If embedding is smaller, pad with zeros
              if (embedding.length < this.embeddingDim) {
                const padded = new Array(this.embeddingDim).fill(0);
                for (let i = 0; i < embedding.length; i++) {
                  padded[i] = embedding[i];
                }
                return padded;
              }
            }

            return embedding;
          }

          if (status.status === 'failed') {
            throw new Error(`Embedding job failed: ${status.error || 'Unknown error'}`);
          }

          if (status.status === 'canceled') {
            throw new Error('Embedding job was canceled');
          }

          // Job is still pending/running, wait a bit
          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        throw new Error(`Embedding job timed out after ${this.timeoutMs}ms`);
      } catch (error) {
        lastError = error as Error;
        console.warn(`Embedding attempt ${attempt + 1} failed:`, error);

        // Wait before retry (exponential backoff)
        if (attempt < this.maxRetries - 1) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('All embedding attempts failed');
  }

  /**
   * Fallback hash-based embedding generation
   */
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

    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map((val) => (magnitude > 0 ? val / magnitude : 0));
  }

  /**
   * Initialize PCA for dimensionality reduction
   */
  private initializePCA(): void {
    if (this.tasks.length < 10) return; // Need minimum samples

    // Simple PCA implementation - in practice use a proper library
    const embeddings = this.tasks.map((t) => t.embedding);
    this.pcaMean = new Array(this.embeddingDim).fill(0);

    // Calculate mean
    embeddings.forEach((emb) => {
      emb.forEach((val, i) => {
        (this.pcaMean![i] as number) += val;
      });
    });

    for (let i = 0; i < this.pcaMean!.length; i++) {
      this.pcaMean![i] = (this.pcaMean![i] as number) / embeddings.length;
    }

    // Center the data
    const centered = embeddings.map((emb) =>
      emb.map((val, i) => val - (this.pcaMean![i] as number)),
    );

    // Simple covariance-based PCA (first fieldDim components)
    // In practice, use SVD or eigenvalue decomposition
    this.pcaMatrix = this.computeSimplePCA(centered, this.fieldDim);
  }

  private computeSimplePCA(data: number[][], components: number): number[][] {
    // Simplified PCA - just take the first components after variance sorting
    const cov = this.computeCovariance(data);
    const eigenvectors = this.simpleEigendecomposition(cov);
    return eigenvectors.slice(0, components);
  }

  private computeCovariance(data: number[][]): number[][] {
    if (data.length === 0 || !data[0] || data[0].length === 0) {
      return [];
    }

    const n = data[0].length;
    const cov = Array(n)
      .fill(0)
      .map(() => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        let sum = 0;
        data.forEach((row) => {
          sum += (row[i] as number) * (row[j] as number);
        });
        (cov[i] as number[])[j] = sum / (data.length - 1);
      }
    }
    return cov;
  }

  private simpleEigendecomposition(matrix: number[][]): number[][] {
    // Simplified - return identity matrix (in practice use proper algorithm)
    const n = matrix.length;
    return Array(n)
      .fill(0)
      .map((_, i) =>
        Array(n)
          .fill(0)
          .map((_, j) => (i === j ? 1 : 0)),
      );
  }

  /**
   * Reduce embedding dimensionality using PCA
   */
  private reduceEmbedding(embedding: number[]): number[] {
    if (!this.pcaMatrix || !this.pcaMean) {
      // If no PCA yet, use simple sampling
      const step = Math.floor(embedding.length / this.fieldDim);
      return Array(this.fieldDim)
        .fill(0)
        .map((_, i) => embedding[i * step] || 0);
    }

    // Apply PCA transformation
    const centered = embedding.map((val, i) => val - (this.pcaMean![i] as number));
    const reduced = new Array(this.fieldDim).fill(0);

    for (let i = 0; i < this.fieldDim; i++) {
      let sum = 0;
      const matrixRow = this.pcaMatrix![i] as number[];
      if (matrixRow) {
        for (let j = 0; j < this.embeddingDim; j++) {
          sum += (centered[j] as number) * ((matrixRow as number[])[j] || 0);
        }
      }
      reduced[i] = sum;
    }

    return reduced;
  }

  /**
   * Add a new task to the field system
   */
  async addTask(
    taskId: string,
    prompt: string,
    category?: string,
    performance?: number,
  ): Promise<void> {
    await this.ensureInitialized();

    const embedding = await this.generateEmbedding(prompt);
    const task: TaskEmbedding = {
      taskId,
      prompt,
      embedding,
      category,
      timestamp: Date.now(),
      performance,
    };

    this.tasks.push(task);

    // Update PCA periodically
    if (this.tasks.length % 20 === 0) {
      this.initializePCA();
    }

    // Convert to field coordinates and inject
    const fieldCoords = this.reduceEmbedding(embedding);
    const position = new VectorN(fieldCoords);

    // Create field node for this task
    const strength = performance !== undefined ? performance : 0.5;
    const node = new FieldNode(position, strength, 2.0);
    node.apply(this.field);

    // Update attractors if this task has a category
    if (category) {
      this.updateAttractor(category, position, strength);
    }
  }

  /**
   * Update cluster attractors based on new task data
   */
  private updateAttractor(category: string, position: any, performance: number): void {
    const attractorId = category;
    let attractor = this.attractors.get(attractorId);

    if (!attractor) {
      attractor = {
        id: attractorId,
        center: position.clone(),
        strength: 1.0,
        category,
        taskCount: 1,
        averagePerformance: performance,
      };
      this.attractors.set(attractorId, attractor);
    } else {
      // Update center using weighted average
      const weight = 1.0 / attractor.taskCount;
      const currentCenter = attractor.center;
      const scaledCurrent = currentCenter.scale(1 - weight);
      const scaledPosition = position.scale(weight);
      attractor.center = scaledCurrent.add(scaledPosition);
      attractor.taskCount++;
      attractor.averagePerformance =
        (attractor.averagePerformance * (attractor.taskCount - 1) + performance) /
        attractor.taskCount;
      attractor.strength = Math.min(2.0, attractor.strength + 0.1);
    }
  }

  /**
   * Classify a new task using field dynamics
   */
  async classifyTask(taskId: string, prompt: string): Promise<EidolonClassificationResult> {
    await this.ensureInitialized();

    const embedding = await this.generateEmbedding(prompt);
    const fieldCoords = this.reduceEmbedding(embedding);
    const position = new VectorN(fieldCoords);

    // Sample field around this position
    const region = this.field!.sampleRegion(position, 3.0);

    // Calculate field influence at this position
    let totalInfluence = VectorN.zero(this.fieldDim);
    region.forEach(({ pos, vec }: { pos: any; vec: any }) => {
      const distance = position.subtract(pos).magnitude();
      if (distance > 0) {
        const influence = vec.scale(1.0 / (1.0 + distance));
        totalInfluence = totalInfluence.add(influence);
      }
    });

    // Find nearest attractor
    let nearestAttractor: ClusterAttractor | undefined;
    let minDistance = Infinity;
    let clusterMembership: number[] = [];

    this.attractors.forEach((attractor) => {
      const distance = position.subtract(attractor.center).magnitude();
      clusterMembership.push(1.0 / (1.0 + distance));

      if (distance < minDistance) {
        minDistance = distance;
        nearestAttractor = attractor;
      }
    });

    // Determine confidence based on field strength and distance
    const fieldStrength = totalInfluence.magnitude();
    const confidence = Math.min(1.0, fieldStrength / (1.0 + minDistance));

    const predictedCategory = nearestAttractor?.category || 'unknown';

    const reasoning = this.generateReasoning(
      fieldStrength,
      minDistance,
      nearestAttractor,
      clusterMembership,
    );

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

  private generateReasoning(
    fieldStrength: number,
    distance: number,
    attractor?: ClusterAttractor,
    membership?: number[],
  ): string {
    const parts: string[] = [];

    if (fieldStrength > 0.5) {
      parts.push(`Strong field influence (${fieldStrength.toFixed(2)})`);
    } else if (fieldStrength > 0.1) {
      parts.push(`Moderate field influence (${fieldStrength.toFixed(2)})`);
    } else {
      parts.push(`Weak field influence (${fieldStrength.toFixed(2)})`);
    }

    if (attractor) {
      parts.push(`Nearest attractor: ${attractor.category} (${distance.toFixed(2)} units)`);
      parts.push(`Attractor confidence: ${attractor.averagePerformance.toFixed(2)}`);
    } else {
      parts.push('No nearby attractors found');
    }

    if (membership) {
      const maxMembership = Math.max(...membership);
      if (maxMembership > 0.7) {
        parts.push(`Strong cluster membership (${maxMembership.toFixed(2)})`);
      } else if (maxMembership > 0.3) {
        parts.push(`Moderate cluster membership (${maxMembership.toFixed(2)})`);
      }
    }

    return parts.join('; ');
  }

  /**
   * Get field statistics and attractor information
   */
  async getFieldStats(): Promise<LearningStats> {
    await this.ensureInitialized();

    const attractors = Array.from(this.attractors.values());
    let totalStrength = 0;
    let cellCount = 0;

    this.field!.grid.forEach((vec: any) => {
      totalStrength += vec.magnitude();
      cellCount++;
    });

    return {
      totalTasks: this.tasks.length,
      attractorCount: attractors.length,
      fieldGridSize: cellCount,
      averageFieldStrength: cellCount > 0 ? totalStrength / cellCount : 0,
      attractors,
    };
  }

  /**
   * Simulate field evolution for clustering
   */
  async evolveField(iterations: number = 10): Promise<void> {
    await this.ensureInitialized();

    for (let i = 0; i < iterations; i++) {
      this.field!.decayAll();

      // Re-apply attractor influences
      this.attractors.forEach((attractor) => {
        const node = new FieldNode(attractor.center, attractor.strength, 3.0);
        node.apply(this.field!);
      });
    }
  }

  /**
   * Reset the field system
   */
  async reset(): Promise<void> {
    await this.ensureInitialized();

    this.field = new FieldN(this.fieldDim, 0.95);
    this.attractors.clear();
    this.tasks = [];
    this.pcaMatrix = undefined;
    this.pcaMean = undefined;
  }
}
