// Type definitions for the AI learning system

// Module declaration for @promethean/eidolon-field
declare module '@promethean/eidolon-field' {
  export class VectorN {
    constructor(values: number[]);
    static zero(n: number): VectorN;
    add(other: VectorN): VectorN;
    subtract(other: VectorN): VectorN;
    scale(f: number): VectorN;
    magnitude(): number;
    normalize(): VectorN;
    toIndexKey(): string;
    clone(): VectorN;
    readonly values: number[];
  }

  export class FieldN {
    constructor(dimensions: number, decay?: number);
    readonly dimensions: number;
    readonly decay: number;
    readonly grid: Map<string, VectorN>;

    get(pos: VectorN): VectorN;
    inject(pos: VectorN, vec: VectorN): void;
    decayAll(): void;
    sampleRegion(center: VectorN, radius: number): Array<{ pos: VectorN; vec: VectorN }>;
  }

  export class FieldNode {
    constructor(position: VectorN, strength?: number, radius?: number);
    readonly position: VectorN;
    readonly strength: number;
    readonly radius: number;

    apply(field: FieldN): void;
  }

  export class VectorFieldService {
    constructor(dim?: number, tickMs?: number);
    readonly field: FieldN;
    readonly nodes: FieldNode[];
    readonly tickMs: number;
    readonly tickCount: number;

    addNode(node: FieldNode): void;
    connect(): Promise<void>;
    saveField(): Promise<void>;
    tick(): void;
    start(): Promise<void>;
    stop(): Promise<void>;
  }

  export function start(): Promise<VectorFieldService>;
}

export interface TaskEmbedding {
  taskId: string;
  prompt: string;
  embedding: number[];
  category?: string;
  timestamp: number;
  performance?: number;
}

export interface ClusterAttractor {
  id: string;
  center: any; // VectorN from eidolon-field
  strength: number;
  category: string;
  taskCount: number;
  averagePerformance: number;
}

export interface EidolonClassificationResult {
  taskId: string;
  prompt: string;
  embedding: number[];
  predictedCategory: string;
  confidence: number;
  nearestAttractor?: ClusterAttractor;
  distanceToCenter: number;
  clusterMembership: number[];
  reasoning: string;
}

export interface LearningStats {
  totalTasks: number;
  attractorCount: number;
  fieldGridSize: number;
  averageFieldStrength: number;
  attractors: ClusterAttractor[];
}
