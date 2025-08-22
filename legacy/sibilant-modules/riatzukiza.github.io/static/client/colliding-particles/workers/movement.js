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
import '/bundles/external.js';
import { 
  Vector
 } from "/shared/vectors.js";
import { 
  Vector2DPhaseSpace
 } from "../typed-arrays/vector-2d.js";
import { 
  ParentSystem
 } from "../system.js";
var MovementSystem = ParentSystem.define("MovementSystem", { 
  dataTypes:[],
  update( args,[ velocities, positions, attractors ] ){ 
    
      for (var pos of positions.data)
      {
      const v=velocities.data[pos.id];;
      const a=attractors.data[pos.id];;
      const p_=Vector.spawn(v.x, v.y);;
      p_.addTo(a);
      pos.addTo(p_);
      p_.despawn()
      }
      ;
      return null;
    
   }
 });