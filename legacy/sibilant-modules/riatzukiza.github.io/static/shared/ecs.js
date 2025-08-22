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
  System
 } from "./ecs/component-system.js";
import { 
  Component
 } from "./ecs/component.js";
import { 
  Entity
 } from "./ecs/entity.js";
import { 
  EntityGroup
 } from "./ecs/entity-group.js";
import { 
  EntitySystem
 } from "./ecs/entity-system.js";
export { 
  System
 };
export { 
  Component
 };
export { 
  Entity
 };
export { 
  EntityGroup
 };
export { 
  EntitySystem
 };