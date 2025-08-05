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
  turnWeight
 } from "./weights.js";
const northEastTurn=TerrainModule.create(turnWeight, "grass", "grass", "grass", "grass", "stone", "stone", "grass", "stone", "grass");
export { 
  northEastTurn
 };
const northWestTurn=TerrainModule.create(turnWeight, "grass", "grass", "grass", "stone", "stone", "grass", "grass", "stone", "grass");
export { 
  northWestTurn
 };
const southWestTurn=TerrainModule.create(turnWeight, "grass", "stone", "grass", "stone", "stone", "grass", "grass", "grass", "grass");
export { 
  southWestTurn
 };
const southEastTurn=TerrainModule.create(turnWeight, "grass", "stone", "grass", "grass", "stone", "stone", "grass", "grass", "grass");
export { 
  southEastTurn
 };
const wideNorthEastTurn=TerrainModule.create(turnWeight, "stone", "stone", "stone", "stone", "grass", "grass", "stone", "grass", "grass");
const wideNorthWestTurn=TerrainModule.create(turnWeight, "stone", "stone", "stone", "grass", "grass", "stone", "grass", "grass", "stone");
const wideSouthWestTurn=TerrainModule.create(turnWeight, "grass", "grass", "stone", "grass", "grass", "stone", "stone", "stone", "stone");