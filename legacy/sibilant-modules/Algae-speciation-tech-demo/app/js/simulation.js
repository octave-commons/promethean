const { 
  create,
  extend,
  mixin
 } = require("./util");
const { 
  EventEmitter
 } = require("events");
const fs = require("browserify-fs");
const { 
  Matrix
 } = require("./matrix");
const { 
  Entity
 } = require("./entity");
const { 
  Layers
 } = require("./webgl-layer");
const Location = { 
  symbol:Symbol("Location"),
  init( x = this.x,y = this.y,layers = [] ){ 
    
      this.x = x;this.y = y;this.layers = layers;
      return this;
    
   }
 };
const Simulation = extend(EventEmitter.prototype, { 
  symbol:Symbol("Simulation"),
  init( fps = this.fps,width = this.width,scale = this.scale,state = false,layers = (new Layers(document.getElementById("stage"), "gl", width, scale)).setBGColor(),coord = create(Matrix)([], width, width).dmap((function(nil, x, y) {
    /* eval.sibilant:17:67 */
  
    return create(Location)(x, y);
  })),systems = (new Set()),rate = (1000 / fps),ticks = 0,sim = this ){ 
    
      this.fps = fps;this.width = width;this.scale = scale;this.state = state;this.layers = layers;this.coord = coord;this.systems = systems;this.rate = rate;this.ticks = ticks;this.sim = sim;
      EventEmitter.call(this);
      return this;
    
   },
  use( color = this.color,system = this.system,entity = this.entity ){ 
    
      this.systems.add(create(system)(this, entity, color));
      return this;
    
   },
  delete(  ){ 
    
      return this;
    
   },
  has(  ){ 
    
      return this;
    
   },
  start(  ){ 
    
      this.state = true;
      this.previous = Date.now();
      this.tick();
      return this;
    
   },
  toggle(  ){ 
    
      this.state = !(this.state);
      (function() {
        if (this.state) {
          return this.start();
        }
      }).call(this);
      return this;
    
   },
  stop(  ){ 
    
      this.state = false;
      return this;
    
   },
  tick( previous = this.previous,rate = this.rate ){ 
    
      (function() {
        if (this.state) {
          let now = Date.now();
          this.elapsed = (now - previous);
          window.requestAnimationFrame(() => {
          	
            return this.tick();
          
          });
          return (function() {
            if (this.elapsed > rate) {
              ++(this.ticks);
              this.previous = (now - (this.elapsed % rate));
              return this.emit("tick", now, this.ticks);
            }
          }).call(this);
        }
      }).call(this);
      return this;
    
   },
  save(  ){ 
    
      return this;
    
   },
  load( cb = this.cb ){ 
    
      cb(this);
      return this;
    
   }
 });
exports.Simulation = Simulation;