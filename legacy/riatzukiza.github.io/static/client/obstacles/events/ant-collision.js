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
  Friction,
  SignalField
 } from "../forces.js";
import { 
  Physics
 } from "/shared/systems/physics.js";
import { 
  config
 } from "../config.js";
const updateParticle=createParticleUpdater(config, game);
game.events.on("antCollision", ((c, c_) => {
	var v = c.entity.velocityInterface;
var v_ = c_.entity.velocityInterface;
var p = c.entity.physicalProperties;
var p_ = c_.entity.physicalProperties;
return updateParticle(v, v.pos, SignalField.field, SignalField.layer, game.ticker.ticks, config.decayOnCollision, false, homePos);
})).once("error", ((err) => {
	console.log("error on", "antCollision", "of", "game.events", "given", "c(c_)");
return console.log(err);
}));