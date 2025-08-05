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
  SuperPosition
 } from "./world-gen/super-position.js";
import { 
  PossibleState
 } from "./world-gen/possible-state.js";
import { 
  TerrainModule
 } from "./world-gen/terrain-module.js";
import { 
  baseWeights
 } from "./world-gen/base-weights.js";
import { 
  BaseDistrobution
 } from "./world-gen/probabilities.js";
import { 
  horizontalRoad
 } from "./world-gen/modules.js";
export { 
  SuperPosition
 };
export { 
  PossibleState
 };
export { 
  TerrainModule
 };
export { 
  baseWeights
 };
export { 
  BaseDistrobution
 };
export { 
  horizontalRoad
 };