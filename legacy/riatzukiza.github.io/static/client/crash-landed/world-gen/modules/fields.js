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
 } from "../terrain-module.js";
const field=TerrainModule.create(15.1, "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass");
export { 
  field
 };
const meadow=TerrainModule.create(5.1, "floweryGrass", "floweryGrass", "floweryGrass", "floweryGrass", "floweryGrass", "floweryGrass", "floweryGrass", "floweryGrass", "floweryGrass");
export { 
  meadow
 };
const grassyMeadow=TerrainModule.create(5, "grass", "floweryGrass", "grass", "floweryGrass", "grass", "floweryGrass", "grass", "floweryGrass", "grass");
export { 
  grassyMeadow
 };
const otherGrassyMeadow=TerrainModule.create(5.1, "floweryGrass", "grass", "floweryGrass", "grass", "floweryGrass", "grass", "floweryGrass", "grass", "floweryGrass");
export { 
  otherGrassyMeadow
 };
const loneFlower=TerrainModule.create(0.1, "grass", "grass", "grass", "grass", "floweryGrass", "grass", "grass", "grass", "grass");
export { 
  loneFlower
 };