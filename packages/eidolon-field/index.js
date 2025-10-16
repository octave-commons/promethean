import { getMongoClient } from '@promethean/persistence/clients.js';

export class VectorN {
  constructor(values) {
    this.values = values;
  }
  static zero(n) {
    return new VectorN(Array(n).fill(0));
  }
  add(other) {
    return new VectorN(this.values.map((v, i) => v + other.values[i]));
  }
  subtract(other) {
    return new VectorN(this.values.map((v, i) => v - other.values[i]));
  }
  scale(f) {
    return new VectorN(this.values.map((v) => v * f));
  }
  magnitude() {
    return Math.sqrt(this.values.reduce((s, v) => s + v ** 2, 0));
  }
  normalize() {
    const m = this.magnitude();
    return m === 0 ? this : this.scale(1 / m);
  }
  toIndexKey() {
    return this.values.map(Math.floor).join(',');
  }
  clone() {
    return new VectorN([...this.values]);
  }
}

export class FieldN {
  constructor(dimensions, decay = 0.98) {
    this.dimensions = dimensions;
    this.decay = decay;
    this.grid = new Map();
  }
  get(pos) {
    const key = pos.toIndexKey();
    return this.grid.get(key) ?? VectorN.zero(this.dimensions);
  }
  inject(pos, vec) {
    const key = pos.toIndexKey();
    const current = this.get(pos);
    this.grid.set(key, current.add(vec));
  }
  decayAll() {
    for (const [key, vec] of this.grid.entries()) {
      this.grid.set(key, vec.scale(this.decay));
    }
  }
  sampleRegion(center, radius) {
    const ranges = center.values.map((c) => {
      const start = Math.floor(c - radius);
      const end = Math.ceil(c + radius);
      return Array.from({ length: end - start + 1 }, (_, i) => i + start);
    });
    const results = [];
    const recurse = (acc, dim) => {
      if (dim === ranges.length) {
        const pos = new VectorN(acc);
        results.push({ pos, vec: this.get(pos) });
        return;
      }
      for (const val of ranges[dim]) {
        recurse([...acc, val], dim + 1);
      }
    };
    recurse([], 0);
    return results;
  }
}

export class FieldNode {
  constructor(position, strength = 1.0, radius = 1) {
    this.position = position;
    this.strength = strength;
    this.radius = radius;
  }
  apply(field) {
    for (const { pos } of field.sampleRegion(this.position, this.radius)) {
      const dir = pos.subtract(this.position).normalize().scale(this.strength);
      field.inject(pos, dir);
    }
  }
}

export class VectorFieldService {
  constructor(dim = 8, tickMs = 100) {
    this.field = new FieldN(dim);
    this.nodes = [];
    this.tickMs = tickMs;
    this.timer = null;
    this.tickCount = 0;
    this.dbName = process.env.DB_NAME || 'eidolon_field';
    this.collectionName = process.env.COLLECTION || 'fields';
    this.client = null;
    this.collection = null;
    this.currentSave = Promise.resolve();
  }
  addNode(node) {
    this.nodes.push(node);
  }
  async connect() {
    this.client = await getMongoClient();
    this.collection = this.client.db(this.dbName).collection(this.collectionName);
  }
  async saveField() {
    if (!this.collection) return;
    const fieldDoc = {
      tick: this.tickCount,
      grid: Array.from(this.field.grid.entries()).map(([key, vec]) => ({
        key,
        values: vec.values,
      })),
    };
    await this.collection.insertOne(fieldDoc);
  }
  tick() {
    this.field.decayAll();
    for (const node of this.nodes) node.apply(this.field);
    this.tickCount += 1;
    this.currentSave = this.saveField().catch((err) => console.error('failed to save field', err));
  }
  async start() {
    if (!this.timer) {
      await this.connect();
      this.timer = setInterval(() => this.tick(), this.tickMs);
    }
  }
  async stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    await this.currentSave;
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.collection = null;
    }
  }
}

export async function start() {
  const service = new VectorFieldService();
  service.addNode(new FieldNode(VectorN.zero(8), 1.0, 1));
  await service.start();

  try {
    const { startService } = await import('@promethean/legacy/serviceTemplate.js');
    await startService({
      id: 'eidolon-field',
      queues: ['eidolon-field'],
      handleTask: async (task) => {
        const { action, position, strength = 1.0, radius = 1 } = task.payload || {};
        if (action === 'add-node' && Array.isArray(position)) {
          service.addNode(new FieldNode(new VectorN(position), strength, radius));
        } else if (action === 'tick') {
          service.tick();
        }
      },
    });
  } catch (err) {
    console.warn('eidolon-field broker bridge unavailable, running without task queue', err);
  }

  console.log('eidolon-field service started');
  return service;
}

if (process.env.NODE_ENV !== 'test') {
  start().catch((err) => {
    console.error('failed to start service', err);
    process.exit(1);
  });
}
