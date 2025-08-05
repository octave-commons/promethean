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
  Vector2DArray
 } from "../typed-arrays/vector-2d.js";
import { 
  ParentSystem
 } from "../system.js";
var VelocitySystem = ParentSystem.define("VelocitySystem", { 
  dataTypes:[ Vector2DArray, Vector2DArray, Vector2DArray ],
  async update( args,[ velocities, corrections, positions ] ){ 
  
    for (var pos of positions.data)
    {
    const v=velocities.data[pos.id];;
    const c=corrections.data[pos.id];;
    const p_=Vector.spawn(v.x, v.y);;
    p_.addTo(v);
    p_.addTo(c);
    pos.addTo(p_);
    p_.despawn()
    }
    ;
    return null;
  
 }
 });
VelocitySystem.start();