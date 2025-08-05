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
  Velocity
 } from "/shared/systems/velocity.js";
import { 
  Position
 } from "/shared/systems/position.js";
import { 
  game
 } from "../game.js";
import { 
  createParticleUpdater
 } from "/shared/field.js";
import { 
  homePos,
  plants,
  ants,
  rocks
 } from "../entities.js";
import { 
  placeEntity
 } from "/shared/systems/collision.js";
import { 
  Physics
 } from "/shared/systems/physics/system.js";
import { 
  Friction,
  SignalField
 } from "../forces.js";
import { 
  config
 } from "../config.js";
const updateParticle=createParticleUpdater(config, game);
Set.prototype.each = (function Set$prototype$each$(f) {
  /* Set.prototype.each eval.sibilant:17:0 */

  this.forEach(f);
  return this;
});
game.events.on("antFoundPlant", ((ant, plant) => {
	var av = ant.entity.velocityInterface;
var ap = game.systems.get(Physics, ant.entity);
for (var seg of ant.entity.antTrail.segments)
{
seg.trailSegment.apply()
}
;
ant.entity.antLife.reset();
((ant.entity.antLife.winCount)++);
ant.entity.antTrail.segments.clear();
av.pos.x = homePos.x;
av.pos.y = homePos.y;
placeEntity(ant.entity, game, config);
var pp = game.systems.get(Physics, plant.entity);
return pp.scale = pp.mass = Math.max((pp.mass - (0.05 * ap.mass)), 0);
}));