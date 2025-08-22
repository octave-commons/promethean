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
  roadWeight
 } from "./weights.js";
const horizontalRoad=TerrainModule.create(roadWeight, "grass", "grass", "grass", "stone", "stone", "stone", "grass", "grass", "grass");
export { 
  horizontalRoad
 };
const verticalRoad=TerrainModule.create(roadWeight, "grass", "stone", "grass", "grass", "stone", "grass", "grass", "stone", "grass");
export { 
  verticalRoad
 };
const leftDiagonalRoad=TerrainModule.create(roadWeight, "stone", "grass", "grass", "grass", "stone", "grass", "grass", "grass", "stone");
export { 
  leftDiagonalRoad
 };
const rightDiagonalRoad=TerrainModule.create(roadWeight, "grass", "grass", "stone", "grass", "stone", "grass", "stone", "grass", "grass");
export { 
  rightDiagonalRoad
 };
const grassBelowRoad=TerrainModule.create(roadWeight, "stone", "stone", "stone", "grass", "grass", "grass", "grass", "grass", "grass");
const grassAboveRoad=TerrainModule.create(roadWeight, "grass", "grass", "grass", "grass", "grass", "grass", "stone", "stone", "stone");
const flowersBelowRoad=TerrainModule.create(roadWeight, "stone", "stone", "stone", "grass", "grass", "grass", "floweryGrass", "floweryGrass", "floweryGrass");
const flowersAboveRoad=TerrainModule.create(roadWeight, "floweryGrass", "floweryGrass", "floweryGrass", "grass", "grass", "grass", "stone", "stone", "stone");
const grassOnRightOfRoad=TerrainModule.create(roadWeight, "stone", "grass", "grass", "stone", "grass", "grass", "stone", "grass", "grass");
const grassOnLeftOfRoad=TerrainModule.create(roadWeight, "grass", "grass", "stone", "grass", "grass", "stone", "grass", "grass", "stone");
const flowersOnRightOfRoad=TerrainModule.create(roadWeight, "stone", "grass", "floweryGrass", "stone", "grass", "floweryGrass", "stone", "grass", "floweryGrass");
const flowersOnLeftOfRoad=TerrainModule.create(roadWeight, "floweryGrass", "grass", "stone", "floweryGrass", "grass", "stone", "floweryGrass", "grass", "stone");