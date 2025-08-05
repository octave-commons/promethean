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
  Physics
 } from "../system.js";
var Friction = Physics.Force.define("Friction", { 
  template:true,
  get config(  ){ 
    
      throw (new Error("No config provided to friction force sub system."))
    
   },
  apply( c = this.c,config = this.config ){ 
    
      var v = c.velocity;
      var physics = c.system.process.systems.get(Physics, c.entity);
      return (function() {
        if (!((v.xd === 0 && v.yd === 0))) {
          v.xd = (v.xd * (1 / (config.stationaryResistanceCoefficiant + (physics.mass * config.friction))));
          v.yd = (v.yd * (1 / (config.stationaryResistanceCoefficiant + (physics.mass * config.friction))));
          return null;
        }
      }).call(this);
    
   }
 });
export { 
  Friction
 };