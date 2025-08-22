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
  DynamicPool
 } from "../pooling/dynamic-pool.js";
import { 
  Interface
 } from "/shared/kit/interface/index.js";
const pools=(new Map());
var PooledDataStructure = Interface.define("PooledDataStructure", { 
  init(  ){ 
    
      
      throw (new Error("Abstract interface missing init function")());
      return this;
    
   },
  clear(  ){ 
    
      throw (new Error("Abstract interface missing clear function")())
    
   },
  get dataPool(  ){ 
    
      const symbol=this.symbol;
      return (function() {
        if (pools.has(symbol)) {
          return pools.get(symbol);
        } else {
          var r = (function() {
            /* inc/misc.sibilant:1:1399 */
          
            return create(DynamicPool)(this);
          }).call(this);
          pools.set(symbol, r);
          return r;
        }
      }).call(this);
    
   },
  spawn( ...args ){ 
    
      return this.dataPool.aquire().init(...args);
    
   },
  despawn(  ){ 
    
      return this.dataPool.release(this);
    
   }
 });
export { 
  PooledDataStructure
 };