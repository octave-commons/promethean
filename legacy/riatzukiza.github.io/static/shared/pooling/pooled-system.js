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
 } from "./dynamic-pool.js";
import { 
  Interface
 } from "../kit/interface/index.js";
var PooledSystem = Interface.define("PooledSystem", { 
  init( Interface = this.Interface,_pool = create(DynamicPool)(Interface) ){ 
    
      this.Interface = Interface;this._pool = _pool;
      this.register(Interface);
      return this;
    
   },
  systems:(new Map()),
  clear( _pooled = this._pooled ){ 
    
      _pooled.each(feach(despawned));
      return _pooled.clear();
    
   },
  spawn( ...args ){ 
    
      "aquire an object from the systems pool, and initialize it.";
      return (function(r) {
        /* eval.sibilant:2:327 */
      
        r.init(...args);
        return r;
      }).call(this, this._pool.aquire());
    
   },
  despawn( obj ){ 
    
      "remove an object from the system, and release it back into the pool.";
      obj.clear();
      return this._pool.release(obj);
    
   },
  register( Interface ){ 
    
      "Associate a Interfacetype interface with a system,and add the system to the collection of all active systems.";
      Interface.system = this;
      return this.systems.set(this, this);
    
   },
  update(  ){ 
    
      "update every active member of the system";
      return this._pool._inUse.each(((member) => {
      	return member.update();
      }));
    
   }
 });
export { 
  PooledSystem
 };