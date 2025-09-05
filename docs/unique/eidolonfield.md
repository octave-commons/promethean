---
uuid: c29a64c6-f5ea-49ca-91a1-0b590ca547ae
created_at: eidolonfield.md
filename: EidolonField
title: EidolonField
description: >-
  A generalized n-dimensional field engine that supports arbitrary-dimensional
  vector fields, field nodes emitting influence based on hyper-radius, and
  particles with position and velocity in n-space. The system uses sparse grids
  and vector math to handle high-dimensional cognition without fixed
  dimensionality constraints.
tags:
  - n-dimensional
  - field engine
  - vector math
  - hyper-radius
  - sparse grid
  - arbitrary dimensions
  - particle physics
  - dynamic fields
---
Yes—excellent clarification. We’re not building _an_ 8-dimensional system, we’re building a **field engine** that can support _bounded n-dimensional cognition_. The number 8 was a meaningful early compression, not a constraint. ^ref-49d1e1e5-1-0

Let’s rewrite everything to support **arbitrary-dimensional vector fields**, with clean abstraction. ^ref-49d1e1e5-3-0

---

## 🧠 EidolonField: Generalized N-Dimensional Field Engine

Instead of baking in 2D logic, we abstract over dimensions using vector math and n-dimensional indexing. ^ref-49d1e1e5-9-0

We’ll support: ^ref-49d1e1e5-11-0

- Fields of any dimensionality ^ref-49d1e1e5-13-0
    
- Field nodes that emit influence based on hyper-radius ^ref-49d1e1e5-15-0
    
- Particles with position and velocity in n-space ^ref-49d1e1e5-17-0
    
- Tick/update loop that works across dimensions ^ref-49d1e1e5-19-0
    

---

## 🧮 VectorN Class

```js
class VectorN {
  constructor(values) {
    this.values = values; // e.g., [x, y, z, ...]
  }

  static zero(n) {
    return new VectorN(Array(n).fill(0));
  }

  add(other) {
    return new VectorN(this.values.map((v, i) => v + other.values[i]));
  }

  scale(f) {
    return new VectorN(this.values.map(v => v * f));
  }

  subtract(other) {
    return new VectorN(this.values.map((v, i) => v - other.values[i]));
  }

  magnitude() {
    return Math.sqrt(this.values.reduce((sum, v) => sum + v * v, 0));
  }

  normalize() {
    const mag = this.magnitude();
    return mag === 0 ? this : this.scale(1 / mag);
  }

  clone() {
    return new VectorN([...this.values]);
  }

  floor() {
    return new VectorN(this.values.map(Math.floor));
  }

  equals(other) {
    return this.values.every((v, i) => v === other.values[i]);
  }

  toIndexKey() {
    return this.values.map(Math.floor).join(',');
  }
}
```
^ref-49d1e1e5-26-0 ^ref-49d1e1e5-74-0

---

## 🌌 FieldN
 ^ref-49d1e1e5-79-0
We use a **sparse grid**: a Map from index keys to vectors. This scales well to high dimensions.
 ^ref-49d1e1e5-81-0
```js
class FieldN {
  constructor(dimensions) {
    this.dimensions = dimensions; // e.g., 4 or 8
    this.grid = new Map(); // key: "x,y,z,...", value: VectorN
    this.decay = 0.98;
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
    const results = [];
    const ranges = this._buildRanges(center.values, radius);
    this._visitGrid(ranges, pos => {
      results.push({ pos: new VectorN(pos), vec: this.get(new VectorN(pos)) });
    });
    return results;
  }

  _buildRanges(centerVals, radius) {
    return centerVals.map(c => {
      const start = Math.floor(c - radius);
      const end = Math.ceil(c + radius);
      return Array.from({ length: end - start + 1 }, (_, i) => i + start);
    });
  }

  _visitGrid(ranges, fn, acc = []) {
    const [head, ...tail] = ranges;
    if (!head) {
      fn(acc);
      return;
    }
    for (const v of head) {
      this._visitGrid(tail, fn, [...acc, v]);
    }
  }
}
^ref-49d1e1e5-81-0
```
^ref-49d1e1e5-82-0

---

## 🔸 Field Node (Emitter) ^ref-49d1e1e5-140-0

```js
class FieldNode {
  constructor(position, strength = 1.0, radius = 2) {
    this.position = position;
    this.strength = strength;
    this.radius = radius;
  }

  apply(field) {
    const region = field.sampleRegion(this.position, this.radius);
    for (const { pos } of region) {
      const direction = pos.subtract(this.position).normalize();
      const influence = direction.scale(this.strength);
      field.inject(pos, influence);
    }
  }
^ref-49d1e1e5-140-0
}
```

---
 ^ref-49d1e1e5-163-0
## ⚪ Particle

```js
class Particle {
  constructor(position, mass = 1.0, drag = 0.95) {
    this.position = position;
    this.velocity = VectorN.zero(position.values.length);
    this.mass = mass;
    this.drag = drag;
  }

  update(field) {
    const force = field.get(this.position).scale(1 / this.mass);
    this.velocity = this.velocity.add(force).scale(this.drag);
    this.position = this.position.add(this.velocity);
^ref-49d1e1e5-163-0
  }
}
```
 ^ref-49d1e1e5-184-0
--- ^ref-49d1e1e5-184-0

## 🔁 Tick Loop
 ^ref-49d1e1e5-188-0
```js
function tick(field, nodes, particles) {
  field.decayAll();
  for (const node of nodes) {
    node.apply(field);
  }
  for (const p of particles) {
^ref-49d1e1e5-184-0
    p.update(field);
  }
}
^ref-49d1e1e5-188-0
```
 ^ref-49d1e1e5-200-0
---

## 🧪 Test Scenario (e.g., 4D field) ^ref-49d1e1e5-205-0

```js
const field = new FieldN(4);
const node = new FieldNode(new VectorN([5, 5, 0, 0]), 1.0, 2);
const particles = [
  new Particle(new VectorN([0, 0, 0, 0])),
  new Particle(new VectorN([10, 10, 0, 0]))
];
^ref-49d1e1e5-200-0

for (let i = 0; i < 100; i++) {
  tick(field, [node], particles);
^ref-49d1e1e5-205-0
}
``` ^ref-49d1e1e5-217-0
^ref-49d1e1e5-207-0
^ref-49d1e1e5-205-0
 ^ref-49d1e1e5-219-0
--- ^ref-49d1e1e5-219-0
 ^ref-49d1e1e5-221-0
## 🧩 This Gives Us: ^ref-49d1e1e5-221-0
 ^ref-49d1e1e5-223-0
- Abstract **topology**, not bound to space or concepts ^ref-49d1e1e5-223-0
    
- Ability to model 2D, 3D, 4D, 8D, or more
    
- Clear way to **add semantic meaning later**
 ^ref-49d1e1e5-228-0
- Field compression possible if the space is too sparse or wide
 ^ref-49d1e1e5-230-0
 ^ref-49d1e1e5-232-0
--- ^ref-49d1e1e5-232-0
 ^ref-49d1e1e5-234-0
Would you like me to: ^ref-49d1e1e5-234-0

- Convert this to Sibilant?
 ^ref-49d1e1e5-237-0
- Build a test CLI that visualizes the magnitude collapse of the field in lower dimensions?
 ^ref-49d1e1e5-239-0
- Write a serialization format (e.g. s-expression or JSON) for field snapshots?
 ^ref-49d1e1e5-241-0
 ^ref-49d1e1e5-242-0 ^ref-49d1e1e5-243-0
We now have the _nervous tissue_. Let’s see it fire.
