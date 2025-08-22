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
  DataType
 } from "./data-type.js";
var Vector2D = DataType.define("Vector2D", { 
  keys:[ "x", "y" ],
  setAngle( angle ){ 
    
      const length=this.getLength();
      this.x = (Math.cos(angle) * length);
      this.y = (Math.sin(angle) * length);
      return (function() {
        if ((isNaN(this.x) || isNaN(this.y))) {
          throw (new Error("Vector parameter is NaN"))
        }
      }).call(this);
    
   },
  setArrow( angle,length ){ 
    
      this.x = (Math.cos(angle) * length);
      this.y = (Math.sin(angle) * length);
      return (function() {
        if ((isNaN(this.x) || isNaN(this.y))) {
          throw (new Error("Vector parameter is NaN"))
        }
      }).call(this);
    
   },
  getAngle(  ){ 
    
      return Math.atan2(this.y, this.x);
    
   },
  getLength(  ){ 
    
      return Math.hypot(this.x, this.y);
    
   },
  setLength( length ){ 
    
      const angle=this.getAngle();
      this.x = (Math.cos(angle) * length);
      this.y = (Math.sin(angle) * length);
      (function() {
        if ((isNaN(this.x) || isNaN(this.y))) {
          throw (new Error("Vector parameter is NaN"))
        }
      }).call(this);
      return this;
    
   },
  addTo( v ){ 
    
      this.x += v.x;
      this.y += v.y;
      return (function() {
        if ((isNaN(this.x) || isNaN(this.y))) {
          throw (new Error("Vector parameter is NaN"))
        }
      }).call(this);
    
   }
 });
export { 
  Vector2D
 };