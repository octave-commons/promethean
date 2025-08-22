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
  config
 } from "../config.js";
import { 
  plants,
  ants,
  rocks
 } from "../entities.js";
game.events.on("plantCollidingWithSpawn", ((home, plant) => {
	const v=plant.entity.velocityInterface;
const pos=plant.pos;
var xd = ((Math.random() * config.collisionStatic) * (function() {
  if (Math.random() < 0.5) {
    return -1;
  } else {
    return 1;
  }
}).call(this));
var yd = ((Math.random() * config.collisionStatic) * (function() {
  if (Math.random() < 0.5) {
    return -1;
  } else {
    return 1;
  }
}).call(this));
pos.x = (pos.x + xd);
pos.y = (pos.y + yd);
return v.accelerate([ xd, yd ]);
})).once("error", ((err) => {
	console.log("error on", "plantCollidingWithSpawn", "of", "game.events", "given", "home(plant)");
return console.log(err);
}));