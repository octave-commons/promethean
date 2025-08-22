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
var R = require("ramda");
import { 
  OrderedMap
 } from "../data-structures/maps/ordered.js";
import { 
  DynamicPool
 } from "../pooling/dynamic-pool.js";
import { 
  Group
 } from "../data-structures/group.js";
import { 
  Entity
 } from "./entity.js";
import { 
  Interface
 } from "/shared/kit/interface/index.js";
import { 
  Saveable
 } from "/shared/saveable.js";
var spawnComponent = (function spawnComponent$(entity, systems) {
  /* spawn-component eval.sibilant:13:0 */

  return (function() {
    /* eval.sibilant:13:39 */
  
    return systems.get(arguments[0]).spawn(entity);
  });
});
var componentList = (function componentList$(entity) {
  /* component-list eval.sibilant:15:0 */

  return R.map(spawnComponent(entity));
});
var remove = (function remove$(entity) {
  /* remove eval.sibilant:17:0 */

  return (function() {
    /* eval.sibilant:17:21 */
  
    return arguments[0].system.clear(entity);
  });
});
var clear = (function() {
  /* eval.sibilant:19:11 */

  return arguments[0].clear();
});
var EntitySystem = Saveable.define("EntitySystem", { 
  currentId:0,
  init( process = this.process,pool = create(DynamicPool)(Entity, 256) ){ 
    
      this.process = process;this.pool = pool;
      return this;
    
   },
  get game(  ){ 
    
      return this.process;
    
   },
  clear(  ){ 
    
      return this.pool.clear();
    
   },
  spawn( aspects ){ 
    
      return this.pool.spawn(this, ((this.currentId)++), aspects);
    
   }
 });
export { 
  EntitySystem
 };