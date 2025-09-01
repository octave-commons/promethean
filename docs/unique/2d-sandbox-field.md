---
uuid: c710dc93-9fec-471b-bdee-bedbd360c67f
created_at: 2025.08.02.15.08.53.md
filename: 2d-sandbox-field
description: >-
  A 2D scalar vector field for testing node interactions, particle dynamics, and
  emergent behaviors without semantic layers.
tags:
  - vector
  - field
  - node
  - particle
  - decay
  - simulation
related_to_title:
  - Eidolon Field Abstract Model
  - Exception Layer Analysis
  - Vectorial Exception Descent
  - EidolonField
  - field-dynamics-math-blocks
  - field-node-diagram-outline
  - layer-1-uptime-diagrams
  - Ice Box Reorganization
  - ParticleSimulationWithCanvasAndFFmpeg
  - Layer1SurvivabilityEnvelope
  - eidolon-field-math-foundations
  - eidolon-node-lifecycle
  - Reawakening Duck
  - sibilant-macro-targets
  - Event Bus Projections Architecture
  - aionian-circuit-math
  - Math Fundamentals
related_to_uuid:
  - 5e8b2388-022b-46cf-952c-36ae9b8f0037
  - 21d5cc09-b005-4ede-8f69-00b4b0794540
  - d771154e-a7ef-44ca-b69c-a1626cf94fbf
  - 49d1e1e5-5d13-4955-8f6f-7676434ec462
  - 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
  - 1f32c94a-4da4-4266-8ac0-6c282cfb401f
  - 4127189a-e0ab-436f-8571-cc852b8e9add
  - 291c7d91-da8c-486c-9bc0-bd2254536e2d
  - e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
  - 64a9f9f9-58ee-4996-bdaf-9373845c6b29
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
  - 59b5670f-36d3-4d34-8985-f3144b15347a
  - c5c9a5c6-427d-4864-8084-c083cd55faa0
  - cf6b9b17-bb91-4219-aa5c-172cba02b2da
  - f2d83a77-7f86-4c56-8538-1350167a0c6c
  - c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
references: []
---
Awesome. This will be our **sandbox**—a 2D Eidolon field to test nodes, particles, and flows. No semantics, no layers—just energy moving in space.

---

## 🎯 Design Goals for the 2D Test Field

We want to observe:

1. **Field decay**: values fade out over time
    
2. **Field node influence**: nodes inject energy (like heat or gravity)
    
3. **Particle movement**: particles are attracted, repelled, or dragged by the field
    
4. **Emergent dynamics**: simple rules lead to complex behavior
    

Let’s start from the basics.

---

## 🧊 Field Structure

We'll define a 2D scalar vector field:

- Each cell has a 2D vector: `(vx, vy)`
    
- Optionally: a scalar "magnitude" field derived from the vector
    

```js
class Vector2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  add(other) { return new Vector2(this.x + other.x, this.y + other.y); }
  scale(f) { return new Vector2(this.x * f, this.y * f); }
  magnitude() { return Math.sqrt(this.x ** 2 + this.y ** 2); }
  normalize() { const m = this.magnitude(); return m === 0 ? new Vector2(0, 0) : this.scale(1 / m); }
}
```

```js
class Field2D {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.grid = [...Array(height)].map(() =>
      [...Array(width)].map(() => new Vector2(0, 0))
    );
  }

  get(x, y) {
    return this.grid[y][x];
  }

  applyDecay(rate = 0.95) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.grid[y][x] = this.grid[y][x].scale(rate);
      }
    }
  }

  inject(x, y, vector) {
    this.grid[y][x] = this.grid[y][x].add(vector);
  }
}
```

---

## 🔹 Field Node

```js
class FieldNode {
  constructor(x, y, strength = 1.0, radius = 3) {
    this.x = x;
    this.y = y;
    this.strength = strength;
    this.radius = radius;
  }

  apply(field) {
    for (let dy = -this.radius; dy <= this.radius; dy++) {
      for (let dx = -this.radius; dx <= this.radius; dx++) {
        const tx = this.x + dx;
        const ty = this.y + dy;
        if (tx >= 0 && ty >= 0 && tx < field.width && ty < field.height) {
          const dir = new Vector2(dx, dy).normalize().scale(this.strength);
          field.inject(tx, ty, dir);
        }
      }
    }
  }
}
```

---

## ⚪ Particle

```js
class Particle {
  constructor(x, y, mass = 1.0, drag = 0.9) {
    this.position = new Vector2(x, y);
    this.velocity = new Vector2(0, 0);
    this.mass = mass;
    this.drag = drag;
  }

  update(field) {
    const fx = Math.floor(this.position.x);
    const fy = Math.floor(this.position.y);
    if (fx >= 0 && fy >= 0 && fx < field.width && fy < field.height) {
      const force = field.get(fx, fy).scale(1 / this.mass);
      this.velocity = this.velocity.add(force).scale(this.drag);
      this.position = this.position.add(this.velocity);
    }
  }
}
```

---

## 🔁 Simulation Loop

```js
const field = new Field2D(40, 20);
const node = new FieldNode(20, 10, 0.5);
const particles = [new Particle(5, 5), new Particle(35, 15)];

function tick() {
  field.applyDecay(0.98);
  node.apply(field);
  particles.forEach(p => p.update(field));
}
```

---

## 🖼️ Optional: Visualize It in ASCII

```js
function render(field, particles) {
  let buffer = "";
  for (let y = 0; y < field.height; y++) {
    for (let x = 0; x < field.width; x++) {
      const p = particles.find(p =>
        Math.floor(p.position.x) === x && Math.floor(p.position.y) === y
      );
      if (p) buffer += "●";
      else {
        const mag = field.get(x, y).magnitude();
        buffer += mag > 0.3 ? "+" : mag > 0.1 ? "." : " ";
      }
    }
    buffer += "\n";
  }
  console.log(buffer);
}
```

---

## 🧪 What This Lets Us Do

- Add multiple nodes (e.g., attractor + repulsor)
    
- Inject pulses over time (like an emotion spike)
    
- Observe particle clustering, spirals, escapes
    
- Build toward composite fields with multiple dimensions
    

---

Would you like to:

- Port this to Sibilant as a first module for Promethean?
    
- Add a real-time canvas/WebGL or terminal UI to see it animate?
    
- Begin testing types of particles (task, memory, emotion)?
    

I recommend starting with a single `gravity-style attractor` node and a few drifting particles to make sure field decay and pull are working. Want to do that?<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [Vectorial Exception Descent](vectorial-exception-descent.md)
- [EidolonField](eidolonfield.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [layer-1-uptime-diagrams](layer-1-uptime-diagrams.md)
- [Ice Box Reorganization](ice-box-reorganization.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [Layer1SurvivabilityEnvelope](layer1survivabilityenvelope.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [Reawakening Duck](reawakening-duck.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
