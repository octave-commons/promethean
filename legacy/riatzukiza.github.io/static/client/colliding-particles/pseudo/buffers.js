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
var DoubleBuffer = Interface.define("DoubleBuffer", { 
  get data(  ){ 
    
      return this.currentState;
    
   },
  init( length = 0,currentState = (new SharedArrayBuffer(length)),nextState = (new SharedArrayBuffer(length)) ){ 
    
      this.length = length;this.currentState = currentState;this.nextState = nextState;
      return this;
    
   },
  step(  ){ 
    
      const state=this.currentState;
      const nextState=this.nextState;
      this.nextState = state;
      this.currentState = nextState;
      return this;
    
   }
 });