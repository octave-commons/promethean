---
uuid: 06ef038a-e195-49c1-898f-a50cc117c59a
created_at: 2d-sandbox-field.md
filename: 2d-sandbox-field
title: 2d-sandbox-field
description: >-
  A 2D scalar vector field for testing node interactions, particle dynamics, and
  emergent behaviors without semantic layers. The field decays over time, nodes
  inject energy, and particles respond to field forces.
tags:
  - 2d
  - vector-field
  - simulation
  - particle-dynamics
  - field-decay
  - node-influence
  - emergent-behavior
---
Awesome. This will be our **sandbox**—a 2D Eidolon field to test nodes, particles, and flows. No semantics, no layers—just energy moving in space. ^ref-c710dc93-1-0

---

## 🎯 Design Goals for the 2D Test Field

We want to observe: ^ref-c710dc93-7-0

1. **Field decay**: values fade out over time ^ref-c710dc93-9-0
    
2. **Field node influence**: nodes inject energy (like heat or gravity) ^ref-c710dc93-11-0
    
3. **Particle movement**: particles are attracted, repelled, or dragged by the field ^ref-c710dc93-13-0
    
4. **Emergent dynamics**: simple rules lead to complex behavior ^ref-c710dc93-15-0
    

Let’s start from the basics. ^ref-c710dc93-18-0

---

## 🧊 Field Structure

We'll define a 2D scalar vector field: ^ref-c710dc93-24-0

- Each cell has a 2D vector: `(vx, vy)` ^ref-c710dc93-26-0
    
- Optionally: a scalar "magnitude" field derived from the vector ^ref-c710dc93-28-0
    

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
^ref-c710dc93-31-0
 ^ref-c710dc93-44-0
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
^ref-c710dc93-44-0
```

---

## 🔹 Field Node ^ref-c710dc93-76-0

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
^ref-c710dc93-76-0
}
```
^ref-c710dc93-78-0

---
 ^ref-c710dc93-104-0
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
^ref-c710dc93-104-0
  }
}
```
 ^ref-c710dc93-129-0
--- ^ref-c710dc93-129-0

## 🔁 Simulation Loop

```js
const field = new Field2D(40, 20);
const node = new FieldNode(20, 10, 0.5);
const particles = [new Particle(5, 5), new Particle(35, 15)];

function tick() {
  field.applyDecay(0.98);
^ref-c710dc93-129-0
  node.apply(field);
  particles.forEach(p => p.update(field));
}
^ref-c710dc93-133-0
```
 ^ref-c710dc93-145-0
---

## 🖼️ Optional: Visualize It in ASCII ^ref-c710dc93-150-0

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
^ref-c710dc93-145-0
    buffer += "\n";
  }
  console.log(buffer);
^ref-c710dc93-150-0
}
``` ^ref-c710dc93-169-0
^ref-c710dc93-150-0
 ^ref-c710dc93-171-0
--- ^ref-c710dc93-171-0
 ^ref-c710dc93-173-0
## 🧪 What This Lets Us Do ^ref-c710dc93-173-0
 ^ref-c710dc93-175-0
- Add multiple nodes (e.g., attractor + repulsor) ^ref-c710dc93-175-0
    
- Inject pulses over time (like an emotion spike)
    
- Observe particle clustering, spirals, escapes
 ^ref-c710dc93-180-0
- Build toward composite fields with multiple dimensions
 ^ref-c710dc93-182-0
 ^ref-c710dc93-184-0
--- ^ref-c710dc93-184-0
 ^ref-c710dc93-186-0
Would you like to: ^ref-c710dc93-186-0

- Port this to Sibilant as a first module for Promethean?
 ^ref-c710dc93-189-0
- Add a real-time canvas/WebGL or terminal UI to see it animate?
 ^ref-c710dc93-191-0 ^ref-c710dc93-192-0
- Begin testing types of particles (task, memory, emotion)? ^ref-c710dc93-192-0
 ^ref-c710dc93-193-0
 ^ref-c710dc93-194-0 ^ref-c710dc93-195-0
I recommend starting with a single `gravity-style attractor` node and a few drifting particles to make sure field decay and pull are working. Want to do that?
