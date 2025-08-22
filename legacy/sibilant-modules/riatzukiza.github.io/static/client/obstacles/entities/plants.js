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
  Position
 } from "/client/obstacles/systems/position.js";
import { 
  Velocity
 } from "/client/obstacles/systems/velocity.js";
import { 
  Physics
 } from "/shared/systems/physics.js";
import { 
  Component,
  System,
  EntityGroup
 } from "/shared/ecs.js";
import { 
  rgba
 } from "/client/obstacles/colors.js";
import { 
  Collision,
  placeEntity
 } from "/shared/systems/collision.js";
import { 
  game,
  activeGameSystems
 } from "/client/obstacles/game.js";
import { 
  config
 } from "/client/obstacles/config.js";
import { 
  Friction
 } from "/client/obstacles/forces.js";
const plants=create(EntityGroup)("Plants", [ Dot, Position, Physics, Collision, Velocity ], game.ent);
var spawnPlant = (function spawnPlant$(x_y$32, mass) {
  /* spawn-plant eval.sibilant:22:0 */

  var x = x_y$32[0],
      y = x_y$32[1];

  var plant = plants.spawn([ Dot, Position, Physics, Collision, Velocity ]);
  game.systems.get(Dot, plant).color = rgba(0, 255, 0, 255);
  game.systems.get(Physics, plant).mass = mass;
  game.systems.get(Physics, plant).scale = mass;
  game.systems.get(Physics, plant).forces = [ Friction ];
  game.systems.get(Position, plant).x = x;
  game.systems.get(Position, plant).y = y;
  game.systems.get(Position, plant).z = 0;
  return placeEntity(plant, game, config);
});
export { 
  plants
 };
export { 
  spawnPlant
 };