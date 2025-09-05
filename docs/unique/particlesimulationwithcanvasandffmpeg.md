---
uuid: c38e7047-c6c0-4a19-a0e6-5707a12e9de1
created_at: particlesimulationwithcanvasandffmpeg.md
filename: Particle Simulation with Canvas and FFmpeg
title: Particle Simulation with Canvas and FFmpeg
description: >-
  A Node.js script that simulates particle interactions in an n-dimensional
  field, projects to 2D for rendering, and generates video frames using FFmpeg.
  The simulation evolves over 120 frames with random particle initialization and
  field decay.
tags:
  - Node.js
  - canvas
  - ffmpeg
  - particle simulation
  - n-dimensional field
  - video generation
related_to_uuid:
  - c29a64c6-f5ea-49ca-91a1-0b590ca547ae
  - 10780cdc-5036-4e8a-9599-a11703bc30c9
  - 4316c3f9-551f-4872-b5c5-98ae73508535
  - 14a4bbf0-4780-4a02-8637-e3c1bbcc9915
  - abe9ec8d-5a0f-42c5-b2ab-a2080c86d70c
  - 2611e17e-c7dd-4de6-9c66-d98fcfa9ffb5
  - 7d584c12-7517-4f30-8378-34ac9fc3a3f8
  - 688ad325-4243-4304-bccc-1a1d8745de08
  - e4317155-7fa6-44e8-8aee-b72384581790
  - 8a9432f5-cb79-40fa-bab1-d3b9e9c0bac8
  - 740bbd1c-c039-405c-8a32-4baeddfb5637
  - 0f203aa7-c96d-4323-9b9e-bbc438966e8c
  - 06ef038a-e195-49c1-898f-a50cc117c59a
  - e0d3201b-826a-4976-ab01-36aae28882be
  - 4f9a7fd9-de08-4b9c-87c4-21268bc26d54
  - f0c4823c-53e8-4dd2-9452-c99867bc7d2c
related_to_title:
  - EidolonField
  - Eidolon Field Abstract Model
  - WebSocket Gateway Implementation
  - Ice Box Reorganization
  - RAG UI Panel with Qdrant and PostgREST
  - Universal Lisp Interface
  - promethean-native-config-design
  - template-based-compilation
  - TypeScript Patch for Tool Calling Support
  - Local-Only LLM Workflow
  - heartbeat-fragment-demo
  - schema-evolution-workflow
  - 2d-sandbox-field
  - Field Node Diagrams
  - homeostasis-decay-formulas
  - Reawakening Duck
references:
  - uuid: c29a64c6-f5ea-49ca-91a1-0b590ca547ae
    line: 82
    col: 0
    score: 0.93
  - uuid: 10780cdc-5036-4e8a-9599-a11703bc30c9
    line: 180
    col: 0
    score: 0.9
  - uuid: 14a4bbf0-4780-4a02-8637-e3c1bbcc9915
    line: 55
    col: 0
    score: 0.87
  - uuid: 4316c3f9-551f-4872-b5c5-98ae73508535
    line: 56
    col: 0
    score: 0.86
  - uuid: 4316c3f9-551f-4872-b5c5-98ae73508535
    line: 43
    col: 0
    score: 0.86
  - uuid: abe9ec8d-5a0f-42c5-b2ab-a2080c86d70c
    line: 137
    col: 0
    score: 0.86
  - uuid: abe9ec8d-5a0f-42c5-b2ab-a2080c86d70c
    line: 343
    col: 0
    score: 0.86
  - uuid: 4316c3f9-551f-4872-b5c5-98ae73508535
    line: 296
    col: 0
    score: 0.86
  - uuid: abe9ec8d-5a0f-42c5-b2ab-a2080c86d70c
    line: 50
    col: 0
    score: 0.85
  - uuid: abe9ec8d-5a0f-42c5-b2ab-a2080c86d70c
    line: 80
    col: 0
    score: 0.85
  - uuid: 4316c3f9-551f-4872-b5c5-98ae73508535
    line: 336
    col: 0
    score: 0.85
  - uuid: abe9ec8d-5a0f-42c5-b2ab-a2080c86d70c
    line: 47
    col: 0
    score: 0.85
  - uuid: 2611e17e-c7dd-4de6-9c66-d98fcfa9ffb5
    line: 137
    col: 0
    score: 0.85
---
Absolutely. Here’s a **Node.js + `canvas` + `ffmpeg`**-friendly script that: ^ref-e018dd7a-1-0

1. Creates an `n`-dimensional field (we’ll project it to 2D for rendering). ^ref-e018dd7a-3-0
    
2. Initializes a set of randomly placed particles. ^ref-e018dd7a-5-0
    
3. Evolves the field over 120 frames.
    
4. Renders each frame to a PNG. ^ref-e018dd7a-9-0
    
5. Optionally stitches those frames into a video using `ffmpeg`.
    

---

### ⚙️ Prereqs

Install dependencies: ^ref-e018dd7a-18-0

```bash
npm install canvas execa fs-extra
```
^ref-e018dd7a-20-0
 ^ref-e018dd7a-24-0
Ensure `ffmpeg` is installed and in your path.

---

### 📜 `simulate.js`
 ^ref-e018dd7a-30-0
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
^ref-e018dd7a-30-0
```

---

### 🧪 To run: ^ref-e018dd7a-218-0

```bash
^ref-e018dd7a-218-0
node simulate.js ^ref-e018dd7a-222-0
```
 ^ref-e018dd7a-224-0
You'll get:

- 120 PNG frames in `./frames`
    
- `output.mp4` as a smooth, projected simulation
    
 ^ref-e018dd7a-231-0
---
 ^ref-e018dd7a-233-0
Let me know if you want to:
 ^ref-e018dd7a-235-0
- Add coloring based on velocity or mass
 ^ref-e018dd7a-237-0
- Emit multiple field nodes
 ^ref-e018dd7a-239-0
- Add trails or heatmaps to the field
    
- Project higher dimensions (e.g. 4D → 2D slice) ^ref-e018dd7a-242-0
    

This is your **visual probe into the Eidolon’s physics**.
