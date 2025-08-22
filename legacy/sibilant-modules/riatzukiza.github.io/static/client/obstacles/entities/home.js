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
  Dot
 } from "/shared/systems/rendering/dot.js";
import { 
  Physics
 } from "/shared/systems/physics.js";
import { 
  Collision
 } from "/shared/systems/collision.js";
import { 
  Position
 } from "../systems/position.js";
import { 
  Velocity
 } from "../systems/velocity.js";
import { 
  game,
  activeGameSystems
 } from "../game.js";
import { 
  config
 } from "../config.js";
import { 
  rgba
 } from "../colors.js";
var entity = (function entity$(aspects) {
  /* entity eval.sibilant:14:0 */

  return game.ent.spawn(aspects);
});
var home = entity([ Dot, Position, Physics, Collision ]);
var homePos = game.systems.get(Position, home);
game.systems.get(Dot, home).color = rgba(0, 255, 0, 255);
game.systems.get(Position, home).x = config.homeLocation[0];
game.systems.get(Position, home).y = config.homeLocation[1];
game.systems.get(Position, home).z = 1;
game.systems.get(Physics, home).scale = 5;
game.systems.get(Physics, home).mass = 1;
game.systems.get(Physics, home).forces = [];
game.systems.get(Collision, home).name = "home";
home.name = "home";
export { 
  home
 };
export { 
  homePos
 };