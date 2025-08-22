
let plants

let canvas;
let ctx;
let field;
let w, h;
let size;
let columns;
let rows;
let noiseZ;
let particles;
let config;
let colorConfig;
let settings;
let colorSettings;
let requestId;
let pheremones;


/*
  Johan Karlsson (DonKarlssonSan)
  2017
*/


class Particle {
  constructor(x, y) {
    this.pos = new Vector(x, y);
    this.prevPos = new Vector(x, y);
    this.vel = new Vector(Math.random() - 0.5, Math.random() - 0.5);
    this.acc = new Vector(0, 0);
    this.size = 2;
  }
  
  move(acc) {
    this.prevPos.x = this.pos.x;
    this.prevPos.y = this.pos.y;
    if(acc) {
      this.acc.addTo(acc);
    }
    this.vel.addTo(this.acc);
    this.pos.addTo(this.vel);
    if(this.vel.getLength() > config.particleSpeed/50) {
      this.vel.setLength(config.particleSpeed/50);
    }
      if(this.acc.getLength() > 10) {
          this.acc.setLength(10)
      }

    this.acc.x = 0;
    this.acc.y = 0;
  }
  
  draw() {
    ctx.fillRect(this.pos.x, this.pos.y, this.size, this.size);
  }
  
  drawLine() {
    ctx.beginPath();
    ctx.moveTo(this.prevPos.x, this.prevPos.y);
    ctx.lineTo(this.pos.x, this.pos.y);
    ctx.stroke();  
  }
  
  wrap() {
    if(this.pos.x > w) {
      this.prevPos.x = this.pos.x = 0;
    } else if(this.pos.x < -this.size) {
      this.prevPos.x = this.pos.x = w - 1;
    }
    if(this.pos.y > h) {
      this.prevPos.y = this.pos.y = 0;
    } else if(this.pos.y < -this.size) {
      this.prevPos.y = this.pos.y = h - 1;
    }
  }
}

let nest = new Particle(500,500)

function setup() {
  size = 5;
  noiseZ = 0;
  canvas = document.querySelector("#canvas");
  ctx = canvas.getContext("2d");
  reset();
  window.addEventListener("resize", reset);  
  config = {
    lineMode: true,
    angleZoom: 9,
    noiseSpeed: 40,
    particleSpeed: 80,
    fieldForce: 50,
    clearAlpha: 1,
  };
  settings = QuickSettings.create();
  settings.addBoolean("Line Mode", config.lineMode, val => config.lineMode = val);
  settings.addRange("Angle Zoom", 1, 100, config.angleZoom, 1, val => config.angleZoom = val);
  settings.addRange("Noise Speed", 1, 100, config.noiseSpeed, 1, val => config.noiseSpeed = val);
  settings.addRange("Particle Speed", 1, 100, config.particleSpeed, 1, val => config.particleSpeed = val);
  settings.addRange("Field Force", 1, 100, config.fieldForce, 1, val => config.fieldForce = val); 
  settings.addRange("Clear Alpha", 0, 0.1, config.clearAlpha, 0.001, val => config.clearAlpha = val); 
  settings.addButton("Clear Canvas", () => drawBackground(1));
  settings.addButton("Reset", reset);
  settings.addButton("Pause", pause);
  settings.addButton("Resume", resume);
  settings.hideControl("Resume");

  colorConfig = {
    particleOpacity: 100,
    baseHue: 120,
    hueRange: 180,
    colorSaturation: 100,
  };
  colorSettings = QuickSettings.create(w - 200, 0, "Color");
  colorSettings.addRange("Particle Opacity", 1, 100, colorConfig.particleOpacity, 1, val => colorConfig.particleOpacity = val);
  colorSettings.addRange("Base Hue", 0, 360, colorConfig.baseHue, 1, val => colorConfig.baseHue = val); 
  colorSettings.addRange("Hue Range", 0, 360, colorConfig.hueRange, 1, val => colorConfig.hueRange = val); 
  colorSettings.addRange("Color Saturation", 0, 100, colorConfig.colorSaturation, 1, val => colorConfig.colorSaturation = val); 


}

function reset() {
  noise.seed(Math.random());  
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
  columns = Math.floor(w / size) + 1;
  rows = Math.floor(h / size) + 1;
  drawBackground(1);
  initParticles();
  initField();
    initPheremones()
}

function entityGroup(t,f) {
    let entities = [];
    for(let i = 0; i < t; i++) {
        let entity = new Particle(...f(i));
        entities.push(entity);
    }
    return entities
}
function initParticles() {

  let numberOfParticles = w * h / 100;
    particles = entityGroup(numberOfParticles,(i) => [nest.pos.x + i,nest.pos.y + i ])
    plants = entityGroup(numberOfParticles,(i) => [Math.random() * w, Math.random() * h])
}

function draw() {
  drawBackground();
  requestId = requestAnimationFrame(draw);
  calculateField();
  noiseZ += config.noiseSpeed/10000;
  drawParticles();
}

function createField(columns,rows) {
    let field = new Array(columns);
    for(let x = 0; x < columns; x++) {
        field[x] = new Array(columns);
        for(let y = 0; y < rows; y++) {
            field[x][y] = new Vector(0, 0);
        }
    }
    return field
}
function initPheremones () {
    pheremones = createField(columns,rows)
}
function initField() {
    field = createField(columns,rows)
}

function calculateField() {
  for(let x = 0; x < columns; x++) {
    for(let y = 0; y < rows; y++) {
      let angle = noise.simplex3(x/config.angleZoom/5, y/config.angleZoom/5, noiseZ) * Math.PI * 2;
      let length = noise.simplex3(x/50 + 40000, y/50 + 40000, noiseZ) * config.fieldForce / 20;
      field[x][y].setLength(length);
      field[x][y].setAngle(angle);

        field[x][y].addTo(pheremones[x][y]);

    }
  }
}

function drawBackground(alpha) {
  ctx.fillStyle = `rgba(0, 0, 0, ${alpha || config.clearAlpha})`;
  ctx.fillRect(0, 0, w, h);
}

function drawParticles() {
  let pos = new Vector(0, 0);
  let hue = Math.sin(noiseZ) * colorConfig.hueRange + colorConfig.baseHue;
  ctx.fillStyle = `hsla(${hue}, ${colorConfig.colorSaturation}%, 50%, ${colorConfig.particleOpacity/500})`;
  ctx.strokeStyle = `hsla(${hue}, ${colorConfig.colorSaturation}%, 50%, ${colorConfig.particleOpacity/500})`;
  particles.forEach(p => {
    if(config.lineMode) {
      p.drawLine();
    } else {
      p.draw();
    }
    pos.x = p.pos.x / size;
    pos.y = p.pos.y / size;
    let v;
    if(pos.x >= 0 && pos.x < columns && pos.y >= 0 && pos.y < rows) {
      v = field[Math.floor(pos.x)][Math.floor(pos.y)];
      if(v.getLength() < 1) {
        pheremones[Math.floor(pos.x)][Math.floor(pos.y)].addTo(v)

        v = pheremones[Math.floor(pos.x)][Math.floor(pos.y)];
      }
    }

    p.move(v);
    p.wrap();
  });
}

function pause() {
  cancelAnimationFrame(requestId);
  settings.hideControl("Pause");
  settings.showControl("Resume");
}

function resume() {
  settings.hideControl("Resume");
  settings.showControl("Pause");
  draw();
}

setup();
draw();
