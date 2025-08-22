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
var AccelerationSystem = ParentSystem.define("AccelerationSystem", { 
  dataTypes:[ Vector2DArray, Vector2DArray, Vector2DArray, Vector2DArray ],
  async update( args,[ velocities, deflections, nearGravity, farGravity ] ){ 
  
    for (var vel of velocities.data)
    {
    const v=velocities.data[vel.id];;
    const d=deflections.data[vel.id];;
    const ng=nearGravity.data[vel.id];;
    const fg=farGravity.data[vel.id];;
    const a=ng.add(fg);;
    const v_=Vector.spawn(v.x, v.y);;
    if( (d.x || d.y) ){ 
      v_.x = d.x;
      v_.y = d.y;
     };
    v_.addTo(a);
    vel.x = v_.x;
    vel.y = v_.y;;
    v_.despawn();
    a.despawn()
    }
    ;
    return null;
  
 }
 });
AccelerationSystem.start();