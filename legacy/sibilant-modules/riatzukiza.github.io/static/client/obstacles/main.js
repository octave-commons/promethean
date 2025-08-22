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
  game,
  activeGameSystems
 } from "./game.js";
import { 
  Collision
 } from "/shared/systems/collision.js";
import { 
  config
 } from "./config.js";
import { 
  entities
 } from "./entities.js";
import { 
  startInterface
 } from "./dom.js";
Collision.setBounds(config.dimensions[0], config.dimensions[1], 500, 1000);
game.start();
import "./events/ant-collision.js";
import "./events/ant-found-plant.js";
import "./events/collision.js";
import "./events/plant-colliding-with-spawn.js";
import "./events/static-object-collision.js";
import "./events/tick.js";
import "./events/simple-collision.js";
startInterface();