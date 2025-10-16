// Type definitions for @promethean/eidolon-field JavaScript module

export interface VectorN {
  values: number[];
  
  static zero(n: number): VectorN;
  add(other: VectorN): VectorN;
  subtract(other: VectorN): VectorN;
  scale(f: number): VectorN;
  magnitude(): number;
  normalize(): VectorN;
  toIndexKey(): string;
  clone(): VectorN;
}

export interface FieldN {
  dimensions: number;
  decay: number;
  grid: Map<string, VectorN>;
  
  get(pos: VectorN): VectorN;
  inject(pos: VectorN, vec: VectorN): void;
  decayAll(): void;
  sampleRegion(center: VectorN, radius: number): Array<{ pos: VectorN; vec: VectorN }>;
}

export interface FieldNode {
  position: VectorN;
  strength: number;
  radius: number;
  
  apply(field: FieldN): void;
}

export interface VectorFieldService {
  field: FieldN;
  nodes: FieldNode[];
  tickMs: number;
  timer: any;
  tickCount: number;
  
  addNode(node: FieldNode): void;
  connect(): Promise<void>;
  saveField(): Promise<void>;
  tick(): void;
  start(): Promise<void>;
  stop(): Promise<void>;
}

export function start(): Promise<VectorFieldService>;