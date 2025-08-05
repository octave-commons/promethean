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
  TileGenerator
 } from "./world-gen/worker.js";
import { 
  TileGraph
 } from "/shared/tiles.js";
import { 
  FloorSprites
 } from "./systems/sprites/floor.js";
import { 
  TileVisibility
 } from "./systems/visibility.js";
import { 
  GroundTypes
 } from "./systems/floor-type.js";
import { 
  Containers
 } from "./systems/containers.js";
import { 
  config
 } from "./config.js";
const gameScale=config.gameScale;
const tileSystems=[ FloorSprites, TileVisibility, GroundTypes, Containers ];
const tiles=TileGraph.spawn(gameScale, tileSystems, game);
export { 
  tiles
 };
export { 
  tileSystems
 };