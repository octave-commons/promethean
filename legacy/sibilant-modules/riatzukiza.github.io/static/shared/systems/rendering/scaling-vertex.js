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
  Andy
 } from "../../andy.js";
import { 
  Renderable
 } from "./renderable.js";
var ScalingVertex = Renderable.define("ScalingVertex", { 
  init( layer = this.layer ){ 
    
      this.layer = layer;
      return this;
    
   },
  clear(  ){ 
    
   },
  structure:(new Andy.Gl.Type.Composite({ 
    point:Andy.Type.Vector3,
    color:Andy.Color.RGBA,
    size:Andy.Type.float
   }))
 });
export { 
  ScalingVertex
 };