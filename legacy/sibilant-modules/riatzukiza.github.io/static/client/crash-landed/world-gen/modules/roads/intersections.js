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
  TerrainModule
 } from "../../terrain-module.js";
import { 
  intersectionWeight
 } from "./weights.js";
const crossRoads=TerrainModule.create(intersectionWeight, "grass", "stone", "grass", "stone", "stone", "stone", "grass", "stone", "grass");
const diagonalCrossRoads=TerrainModule.create(intersectionWeight, "stone", "grass", "stone", "grass", "stone", "grass", "stone", "grass", "stone");
const northTJunction=TerrainModule.create(intersectionWeight, "grass", "grass", "grass", "stone", "stone", "stone", "grass", "stone", "grass");
const southTJunction=TerrainModule.create(intersectionWeight, "grass", "stone", "grass", "stone", "stone", "stone", "grass", "grass", "grass");
const eastTJunction=TerrainModule.create(intersectionWeight, "grass", "stone", "grass", "stone", "stone", "grass", "grass", "stone", "grass");
const westTJunction=TerrainModule.create(intersectionWeight, "grass", "stone", "grass", "grass", "stone", "stone", "grass", "stone", "grass");
const intersections={ 
  crossRoads,
  diagonalCrossRoads,
  northTJunction,
  southTJunction,
  eastTJunction,
  westTJunction
 };
export { 
  intersections
 };
export { 
  crossRoads
 };
export { 
  diagonalCrossRoads
 };
export { 
  northTJunction
 };
export { 
  southTJunction
 };
export { 
  eastTJunction
 };
export { 
  westTJunction
 };