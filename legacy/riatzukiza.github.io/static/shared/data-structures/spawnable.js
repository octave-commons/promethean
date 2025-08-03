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
  Saveable
 } from "../saveable.js";
var Spawnable = Saveable.define("Spawnable", { 
  build(  ){ 
    
      Saveable.init.call(this);
      return this.pool = [];
    
   },
  aquire(  ){ 
    
      return (function() {
        if (this.pool.length > 0) {
          return this.pool.pop();
        } else {
          return Object.create(this);
        }
      }).call(this);
    
   },
  spawn( ...args ){ 
    
      return this.aquire().init(...args);
    
   },
  clear(  ){ 
    
      throw (new Error("No clear function defined for spawnable datatype"))
    
   },
  despawn(  ){ 
    
      this.clear();
      return this.pool.push(this);
    
   }
 });
export { 
  Spawnable
 };