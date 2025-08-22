const { 
  Matrix
 } = require("./matrix");
const { 
  create,
  extend,
  mixin
 } = require("./util");
const { 
  Entity
 } = require("./entity");
let empty = Entity.empty;
var makePool = (function makePool$(width, entType) {
  /* make-pool eval.sibilant:5:0 */

  return create(Matrix)([], width, width).dmap((function(nil, x, y) {
    /* eval.sibilant:7:9 */
  
    return create(entType)(x, y, 0, 0, 0, 0);
  }));
});
const Plant = { 
  symbol:Symbol("Plant"),
  init( pos = this.pos,system = this.system ){ 
    
      this.pos = pos;this.system = system;
      return this;
    
   },
  spawn( x = this.x,y = this.y,system = this.system,plant = this ){ 
    
      let ent = system.sim.coord.get(x, y);
      return (function() {
        if (!(system.entities.has(ent))) {
          console.log("spawning plant");
          let data = {
            x: x,
            y: y,
            r: system.color.red,
            g: system.color.green,
            b: system.color.blue,
            a: 255
          };
          this.pos = ent;
          system.layer.add(data);
          return system.entities.add(ent);
        }
      }).call(this);
    
   },
  grow( x = this.x,y = this.y,system = this.system ){ 
    
      return (function() {
        if (Math.round(Math.random()) === 1) {
          return requestAnimationFrame(() => {
          	
            return Plant.spawn((goal.x + (Math.floor((Math.random() * (2 - -2))) + -2)), (goal.y + (Math.floor((Math.random() * (2 - -2))) + -2)), system);
          
          }, 0);
        }
      }).call(this);
    
   }
 };
const System = { 
  symbol:Symbol("System"),
  pool:Matrix,
  init( color = this.color,entityType = this.entityType,sim = this.sim,pool = makePool(entityType, sim.coord.width),entities = (new Set()),layer = sim.layers.get() ){ 
    
      this.color = color;this.entityType = entityType;this.sim = sim;this.pool = pool;this.entities = entities;this.layer = layer;
      return this;
    
   },
  build( entityType = this.entityType,color = this.color,methods = this.methods ){ 
    
   },
  random( entityType = this.entityType,sim = this.sim ){ 
    
      return entityType.spawn((Math.floor((Math.random() * (sim.coord.width - 0))) + 0), (Math.floor((Math.random() * (sim.coord.width - 0))) + 0), this);
    
   },
  update(  ){ 
    
   }
 };
exports.System = System;