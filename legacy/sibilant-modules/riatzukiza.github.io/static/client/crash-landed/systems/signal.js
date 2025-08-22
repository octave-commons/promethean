Array.prototype.each = (function Array$prototype$each$(f) {
  /* Array.prototype.each inc/misc.sibilant:1:1692 */

  this.forEach(f);
  return this;
});
Object.prototype.each = (function Object$prototype$each$(f) {
  /* Object.prototype.each inc/misc.sibilant:1:1754 */

  return Object.keys(this).forEach(((k) => {
  	
    return f(this[k], k);
  
  }));
});
var { 
  Component,
  System
 } = require("@shared/ecs.js");
var Influence = Component.define("Influence", { 
  get minX(  ){ 
    
      return Math.floor(this.entity.collisionBounds.minX);
    
   },
  get minY(  ){ 
    
      return Math.floor(this.entity.collisionBounds.minY);
    
   },
  get maxX(  ){ 
    
      return Math.ceil(this.entity.collisionBounds.maxX);
    
   },
  get maxY(  ){ 
    
      return Math.ceil(this.entity.collisionBounds.maxY);
    
   },
  get velocity(  ){ 
    
      return this.entity.velocityInterface;
    
   },
  get pos(  ){ 
    
      return this.entity.positionInterface;
    
   },
  get quadTree(  ){ 
    
      return this.entity.collisionBounds.system.quads;
    
   }
 });
exports.Influence = Influence;
var Signal = System.define("Signal", { 
  get field(  ){ 
    
      throw (new Error("No signal matrix defined for signal system"))
    
   },
  evolve( cell ){ 
    
   },
  _updateComponent( c ){ 
    
      const signalCell=this.field.get(Math.round(c.pos.x), Math.round(c.pos.y), this.game.ticker.ticks);
      console.log({ 
        signalCell,
        c
       });
      (function() {
        if (c.velocity) {
          return c.velocity.accelerate([ signalCell.x, signalCell.y ]);
        }
      }).call(this);
      this.evolve(signalCell, c);
      return null;
    
   }
 });
exports.Signal = Signal;