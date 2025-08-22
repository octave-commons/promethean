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
  Saveable
 } from "/shared/saveable.js";
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
  Interface
 } from "/shared/kit/interface/index.js";
import { 
  Renderable
 } from "/shared/systems/rendering/renderable.js";
var spawnComponent = (function spawnComponent$(entity, systems) {
  /* spawn-component eval.sibilant:15:0 */

  return (function() {
    /* eval.sibilant:15:39 */
  
    return systems.get(arguments[0]).spawn(entity);
  });
});
var componentList = (function componentList$(entity) {
  /* component-list eval.sibilant:17:0 */

  return R.map(spawnComponent(entity));
});
var remove = (function remove$(entity) {
  /* remove eval.sibilant:19:0 */

  return (function() {
    /* eval.sibilant:19:21 */
  
    return arguments[0].system.clear(entity);
  });
});
var clear = (function() {
  /* eval.sibilant:21:11 */

  return arguments[0].clear();
});
var capitalize = (function capitalize$(string) {
  /* capitalize eval.sibilant:22:0 */

  return (string.charAt(0).toUpperCase() + string.slice(1));
});
var decapitalize = (function decapitalize$(string) {
  /* decapitalize eval.sibilant:23:0 */

  return (string.charAt(0).toLowerCase() + string.slice(1));
});
var Component = Saveable.define("Component", { 
  register(  ){ 
    
      return `
      shared/ecs/Component/register.md

      # shared.ecs.Component.register

      ## arguments

      no arguements

      ## description

      An abstract function for subclassed components to optionally perform an action on creation.`

      ;
    
   },
  init( entity = this.entity,system = this.system ){ 
    
      this.entity = entity;this.system = system;
      entity[decapitalize(this.name)] = this;
      this.register();
      return this;
    
   }
 });
Component.clear = (function Component$clear$(system = this.system) {
  /* Component.clear inc/core/function-expressions.sibilant:28:8 */

  (function() {
    if (!(this._clear)) {
      throw (new Error("Clear function must be defined to relase from object pool."))
    }
  }).call(this);
  this._clear();
  this.entity[this.name.toLowerCase()] = null;
  this.entity[this.name] = null;
  return this.entity[decapitalize(this.name)] = null;
});
export { 
  Component
 };