// Type declarations for @promethean/eidolon-field

export class VectorN {
  values: number[];
  
  constructor(values: number[]);
  static zero(n: number): VectorN;
  add(other: VectorN): VectorN;
  subtract(other: VectorN): VectorN;
  scale(f: number): VectorN;
  magnitude(): number;
  normalize(): VectorN;
  toIndexKey(): string;
  clone(): VectorN;
}

export class FieldN {
  dimensions: number;
  decay: number;
  grid: Map<string, VectorN>;
  
  constructor(dimensions: number, decay?: number);
  get(pos: VectorN): VectorN;
  inject(pos: VectorN, vec: VectorN): void;
  decayAll(): void;
  sampleRegion(center: VectorN, radius: number): Array<{ pos: VectorN; vec: VectorN }>;
}

export class FieldNode {
  position: VectorN;
  strength: number;
  radius: number;
  
  constructor(position: VectorN, strength?: number, radius?: number);
  apply(field: FieldN): void;
}

export class VectorFieldService {
  field: FieldN;
  nodes: FieldNode[];
  tickMs: number;
  timer: any;
  tickCount: number;
  
  constructor(dim?: number, tickMs?: number);
  addNode(node: FieldNode): void;
  connect(): Promise<void>;
  saveField(): Promise<void>;
  tick(): void;
  start(): Promise<void>;
  stop(): Promise<void>;
}

export function start(): Promise<VectorFieldService>;