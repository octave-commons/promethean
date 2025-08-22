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
  Interface
 } from "../kit/interface/index.js";
var Scalar = Interface.define("Scalar", { 
  init( value = this.value ){ 
    
      this.value = value;
      return this;
    
   },
  mul( array = this.array,value = this.value ){ 
    
      return array.map((function() {
        /* eval.sibilant:2:264 */
      
        return (arguments[0] * value);
      }));
    
   },
  div( array = this.array,value = this.value ){ 
    
      return array.map((function() {
        /* eval.sibilant:2:333 */
      
        return (arguments[0] / value);
      }));
    
   },
  sub( array = this.array,value = this.value ){ 
    
      return array.map((function() {
        /* eval.sibilant:2:402 */
      
        return (arguments[0] - value);
      }));
    
   }
 });
export { 
  Scalar
 };