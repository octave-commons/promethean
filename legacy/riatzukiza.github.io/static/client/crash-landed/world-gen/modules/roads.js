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
  horizontalRoad
 } from "./roads/straight.js";
import { 
  northEastTurn
 } from "./roads/turns.js";
import { 
  intersections
 } from "./roads/intersections.js";
export { 
  horizontalRoad
 };
export { 
  northEastTurn
 };
export { 
  intersections
 };