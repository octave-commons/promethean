Array.prototype.each = (function Array$prototype$each$(f) {
  /* Array.prototype.each inc/misc.sibilant:1:1831 */

  this.forEach(f);
  return this;
});
Object.prototype.each = (function Object$prototype$each$(f) {
  /* Object.prototype.each inc/misc.sibilant:1:1893 */

  return Object.keys(this).forEach(((k) => {
  	return f(this[k], k);
  }));
});
import '/bundles/external.js';
import { 
  mixin,
  create,
  extend
 } from "/shared/kit/core/util.js";
import { 
  Position
 } from "/shared/systems/position.js";
import { 
  Physics
 } from "/shared/systems/physics/system.js";
import { 
  Collision
 } from "/shared/systems/collision.js";
var SignalField = Physics.Force.define("SignalField", { 
  template:true,
  get config(  ){ 
    
      throw Error("No config provided for signal-field force sub system")
    
   },
  get game(  ){ 
    
      throw Error("No game object provided for signal-field force sub system")
    
   },
  get entities(  ){ 
    
      throw Error("No entities object provided for signal-field force sub system")
    
   },
  get updateParticle(  ){ 
    
      throw Error("No update particle function provided for signal-field force sub system")
    
   },
  get field(  ){ 
    
      throw Error("No noise field layer (this.field)  provided for signal-field force sub system")
    
   },
  get layer(  ){ 
    
      throw Error("No signal field layer (this.layer)   provided for signal-field force sub system")
    
   },
  apply( c = this.c,field = this.field,layer = this.layer,config = this.config,game = this.game,entities = this.entities,updateParticle = this.updateParticle ){ 
    
      var v = c.velocity;
      var collision = c.system.process.systems.get(Collision, c.entity);
      updateParticle(v, v.pos, field, layer, game.ticker.ticks, false, false, entities.homePos);
      var winRate = (v.entity.antLife.winCount / ((1 + v.entity.antLife.looseCount) || 1));
      c.scale = (5 + (2 * (function() {
        if (winRate > 1) {
          return winRate;
        } else {
          return 1;
        }
      }).call(this)));
      return c.mass = (10 * (function() {
        if (winRate > 1) {
          return winRate;
        } else {
          return 1;
        }
      }).call(this));
    
   }
 });
export { 
  SignalField
 };