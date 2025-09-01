---
uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
created_at: 2025.08.02.18.08.49.md
filename: ParticleSimulationWithCanvasAndFFmpeg
description: >-
  A Node.js script that simulates particle interactions in an n-dimensional
  field, projects to 2D for rendering, and generates a video using ffmpeg.
tags:
  - Node.js
  - canvas
  - ffmpeg
  - particles
  - simulation
  - field
  - n-dimensional
related_to_title:
  - EidolonField
  - sibilant-macro-targets
  - Ice Box Reorganization
  - 2d-sandbox-field
  - Eidolon Field Abstract Model
  - Vectorial Exception Descent
  - Exception Layer Analysis
  - Performance-Optimized-Polyglot-Bridge
  - 'Polyglot S-expr Bridge: Python-JS-Lisp Interop'
  - field-node-diagram-outline
  - Reawakening Duck
  - Interop and Source Maps
  - eidolon-field-math-foundations
  - compiler-kit-foundations
  - ecs-offload-workers
  - ecs-scheduler-and-prefabs
  - eidolon-node-lifecycle
  - Cross-Language Runtime Polymorphism
  - field-dynamics-math-blocks
  - Cross-Target Macro System in Sibilant
  - polyglot-repl-interface-layer
  - Admin Dashboard for User Management
  - Local-Only-LLM-Workflow
  - Duck's Self-Referential Perceptual Loop
  - polymorphic-meta-programming-engine
  - layer-1-uptime-diagrams
  - Ghostly Smoke Interference
  - Duck's Attractor States
related_to_uuid:
  - 49d1e1e5-5d13-4955-8f6f-7676434ec462
  - c5c9a5c6-427d-4864-8084-c083cd55faa0
  - 291c7d91-da8c-486c-9bc0-bd2254536e2d
  - c710dc93-9fec-471b-bdee-bedbd360c67f
  - 5e8b2388-022b-46cf-952c-36ae9b8f0037
  - d771154e-a7ef-44ca-b69c-a1626cf94fbf
  - 21d5cc09-b005-4ede-8f69-00b4b0794540
  - f5579967-762d-4cfd-851e-4f71b4cb77a1
  - 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
  - 1f32c94a-4da4-4266-8ac0-6c282cfb401f
  - 59b5670f-36d3-4d34-8985-f3144b15347a
  - cdfac40c-00e4-458f-96a7-4c37d0278731
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - 01b21543-7e03-4129-8fe4-b6306be69dee
  - 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
  - c62a1815-c43b-4a3b-88e6-d7fa008a155e
  - 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
  - c34c36a6-80c9-4b44-a200-6448543b1b33
  - 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
  - 5f210ca2-54e9-445b-afe4-fb340d4992c5
  - 9c79206d-4cb9-4f00-87e0-782dcea37bc7
  - 2901a3e9-96f0-497c-ae2c-775f28a702dd
  - 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
  - 71726f04-eb1c-42a5-a5fe-d8209de6e159
  - 7bed0b9a-8b22-4b1f-be81-054a179453cb
  - 4127189a-e0ab-436f-8571-cc852b8e9add
  - b6ae7dfa-0c53-4eb9-aea8-65072b825bee
  - 13951643-1741-46bb-89dc-1beebb122633
references: []
---
Absolutely. Here’s a **Node.js + `canvas` + `ffmpeg`**-friendly script that:

1. Creates an `n`-dimensional field (we’ll project it to 2D for rendering).
    
2. Initializes a set of randomly placed particles.
    
3. Evolves the field over 120 frames.
    
4. Renders each frame to a PNG.
    
5. Optionally stitches those frames into a video using `ffmpeg`.
    

---

### ⚙️ Prereqs

Install dependencies:

```bash
npm install canvas execa fs-extra
```

Ensure `ffmpeg` is installed and in your path.

---

### 📜 `simulate.js`

```js
const { createCanvas } = require('canvas');
const fs = require('fs-extra');
const path = require('path');
const execa = require('execa');

const WIDTH = 400;
const HEIGHT = 400;
const DIM = 2;
const FRAMES = 120;
const PARTICLE_COUNT = 40;

class VectorN {
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
    return new VectorN(this.values.map(v => v * f));
  }
  magnitude() {
    return Math.sqrt(this.values.reduce((s, v) => s + v ** 2, 0));
  }
  normalize() {
    const m = this.magnitude();
    return m === 0 ? this : this.scale(1 / m);
  }
  floor() {
    return new VectorN(this.values.map(Math.floor));
  }
  toIndexKey() {
    return this.values.map(Math.floor).join(',');
  }
}

class FieldN {
  constructor(dimensions) {
    this.dimensions = dimensions;
    this.grid = new Map();
    this.decay = 0.95;
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
    const ranges = center.values.map(c => {
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

class FieldNode {
  constructor(position, strength = 1.0, radius = 4) {
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
  }

  projected2D() {
    const [x, y] = this.position.values;
    return {
      x: Math.floor((x / 50) * WIDTH + WIDTH / 2),
      y: Math.floor((y / 50) * HEIGHT + HEIGHT / 2)
    };
  }
}

async function run() {
  const field = new FieldN(DIM);
  const node = new FieldNode(new VectorN([0, 0]), 1.5, 6);
  const particles = Array.from({ length: PARTICLE_COUNT }, () =>
    new Particle(new VectorN([
      (Math.random() - 0.5) * 100,
      (Math.random() - 0.5) * 100
    ]), 1 + Math.random() * 2, 0.9 + Math.random() * 0.09)
  );

  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');
  const outDir = 'frames';

  await fs.ensureDir(outDir);

  for (let i = 0; i < FRAMES; i++) {
    field.decayAll();
    node.apply(field);
    for (const p of particles) p.update(field);

    // draw frame
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.fillStyle = 'white';
    for (const p of particles) {
      const { x, y } = p.projected2D();
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    const filename = path.join(outDir, `frame_${String(i).padStart(3, '0')}.png`);
    const buffer = canvas.toBuffer('image/png');
    await fs.writeFile(filename, buffer);
    process.stdout.write('.');
  }

  console.log('\nEncoding video...');

  await execa('ffmpeg', [
    '-y',
    '-framerate', '30',
    '-i', path.join(outDir, 'frame_%03d.png'),
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    'output.mp4'
  ]);

  console.log('Video saved as output.mp4');
}

run();
```

---

### 🧪 To run:

```bash
node simulate.js
```

You'll get:

- 120 PNG frames in `./frames`
    
- `output.mp4` as a smooth, projected simulation
    

---

Let me know if you want to:

- Add coloring based on velocity or mass
    
- Emit multiple field nodes
    
- Add trails or heatmaps to the field
    
- Project higher dimensions (e.g. 4D → 2D slice)
    

This is your **visual probe into the Eidolon’s physics**.<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [EidolonField](eidolonfield.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [Ice Box Reorganization](ice-box-reorganization.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [Vectorial Exception Descent](vectorial-exception-descent.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [Reawakening Duck](reawakening-duck.md)
- [Interop and Source Maps](interop-and-source-maps.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [polyglot-repl-interface-layer](polyglot-repl-interface-layer.md)
- [Admin Dashboard for User Management](admin-dashboard-for-user-management.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [layer-1-uptime-diagrams](layer-1-uptime-diagrams.md)
- [Ghostly Smoke Interference](ghostly-smoke-interference.md)
- [Duck's Attractor States](ducks-attractor-states.md)
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
