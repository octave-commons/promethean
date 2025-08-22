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
 } from "../systems/velocity.js";
import { 
  Physics
 } from "/shared/systems/physics/system.js";
import { 
  game
 } from "../game.js";
import { 
  home,
  plants,
  ants,
  rocks
 } from "../entities.js";
game.events.on("collision", ((c, c_) => {
	var v = c.entity.velocityInterface;
var v_ = c_.entity.velocityInterface;
var p = c.entity.physicalProperties;
var p_ = c_.entity.physicalProperties;
if( (c.entity === home && plants.has(c_.entity)) ){ 
  return game.events.emit("plantCollidingWithSpawn", c, c_);
 };
if( (c_.entity === home && plants.has(c.entity)) ){ 
  return game.events.emit("plantCollidingWithSpawn", c_, c);
 };
if( (c.entity === home && rocks.has(c_.entity)) ){ 
  return game.events.emit("plantCollidingWithSpawn", c, c_);
 };
if( (c_.entity === home && rocks.has(c.entity)) ){ 
  return game.events.emit("plantCollidingWithSpawn", c_, c);
 };
if( (v && v_ && p && p_) ){ 
  if( (ants.has(c_.entity) && plants.has(c.entity)) ){ 
    return game.events.emit("antFoundPlant", c_, c);
   };
  if( (ants.has(c.entity) && plants.has(c_.entity)) ){ 
    return game.events.emit("antFoundPlant", c, c_);
   };
  v.pos.x = (v.priorX || v.pos.x);;
  v.pos.y = (v.priorY || v.pos.y);;
  if( (ants.has(c.entity) && ants.has(c_.entity)) ){ 
    game.events.emit("antCollision", c, c_);
    return game.events.emit("simpleCollision", c_, c);
   };
  if( ((plants.has(c.entity) && plants.has(c_.entity)) || (plants.has(c.entity) && rocks.has(c_.entity)) || (rocks.has(c.entity) && plants.has(c_.entity)) || (rocks.has(c.entity) && rocks.has(c_.entity))) ){ 
    game.events.emit("staticObjectCollision", c, c_)
   };
  game.events.emit("simpleCollision", c_, c)
 };
c_.colliding = false;
return c.colliding = false;
})).once("error", ((err) => {
	console.log("error on", "collision", "of", "game.events", "given", "c(c_)");
return console.log(err);
}));