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
var setColor = (function setColor$(r, g, b, a, vert) {
  /* set-color eval.sibilant:2:220 */

  vert.color.r = r;
  vert.color.g = g;
  vert.color.b = b;
  return vert.color.a = a;
});
var setPoint = (function setPoint$(x, y, z, vert) {
  /* set-point eval.sibilant:2:326 */

  vert.point.x = x;
  vert.point.y = y;
  return vert.point.z = z;
});
var Vertex = Renderable.define("Vertex", { 
  init( layer = this.layer ){ 
    
      this.layer = layer;
      return this;
    
   },
  structure:(new Andy.Gl.Type.Composite({ 
    point:Andy.Type.Vector3,
    color:Andy.Color.RGBA,
    size:Andy.Type.float
   })),
  clear(  ){ 
    
      setColor(0, 0, 0, 0, this);
      return setPoint(0, 0, 0, this);
    
   },
  despawn(  ){ 
    
      return this.layer.despawn(this);
    
   }
 });
export { 
  Vertex
 };