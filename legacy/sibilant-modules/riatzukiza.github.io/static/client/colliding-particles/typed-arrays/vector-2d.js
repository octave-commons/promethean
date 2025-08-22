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
  DoubleBufferedArray
 } from "./double-buffered.js";
import { 
  Vector2D
 } from "../data-types/vector-2d.js";
var Vector2DArray = DoubleBufferedArray.define("Vector2DArray", { 
  dataType:Vector2D,
  addTo( vector2dArray ){ 
    
      for (var v of this.data)
      {
      const v2=vector2dArray.data[v.id];;
      v.x = (v.x + v2.x);;
      v.y = (v.y + v2.y);
      }
      ;
      return this;
    
   }
 });
export { 
  Vector2DArray
 };