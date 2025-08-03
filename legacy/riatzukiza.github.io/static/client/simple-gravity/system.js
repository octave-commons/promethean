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
var GameSystem = Interface.define("GameSystem", { 
  init( buffers = [] ){ 
    
      this.buffers = buffers;
      return this;
    
   },
  send( args ){ 
    
   },
  update( args ){ 
    
      return this.send({ 
        args,
        buffers:this.buffers.map(((data) => {
        	return [ data.currentState.buffer, data.nextState.buffer ];
        }))
       });
    
   }
 });
var ThreadedGameSystem = GameSystem.define("ThreadedGameSystem", { 
  
 });