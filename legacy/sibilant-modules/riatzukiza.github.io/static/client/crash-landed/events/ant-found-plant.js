Array.prototype.each = (function Array$prototype$each$(f) {
  /* Array.prototype.each inc/misc.sibilant:1:1692 */

  this.forEach(f);
  return this;
});
Object.prototype.each = (function Object$prototype$each$(f) {
  /* Object.prototype.each inc/misc.sibilant:1:1754 */

  return Object.keys(this).forEach(((k) => {
  	
    return f(this[k], k);
  
  }));
});
var { 
  Velocity
 } = require("@shared/systems/velocity.js");
var { 
  Position
 } = require("@shared/systems/position.js");
var { 
  game
 } = require("@crash-landed/game.js"),
    { 
  createParticleUpdater
 } = require("@shared/field.js"),
    { 
  homePos,
  plants,
  ants,
  rocks
 } = require("@crash-landed/entities.js"),
    { 
  placeEntity
 } = require("@shared/systems/collision.js"),
    { 
  config
 } = require("@crash-landed/config.js"),
    { 
  Physics
 } = require("@shared/systems/physics/system.js"),
    { 
  Friction,
  SignalField
 } = require("@crash-landed/forces.js"),
    config = require("@crash-landed/config.js");
const updateParticle=createParticleUpdater(config, game);
Set.prototype.each = (function Set$prototype$each$(f) {
  /* Set.prototype.each eval.sibilant:17:0 */

  this.forEach(f);
  return this;
});
game.events.on("antFoundPlant", ((ant, plant) => {
	
  var av = ant.entity.velocityInterface;
  var ap = game.systems.get(Physics, ant.entity);
  ant.entity.antLife.reset();
  ((ant.entity.antLife.winCount)++);
  av.pos.x = homePos.x;
  av.pos.y = homePos.y;
  placeEntity(ant.entity, game, config);
  var pp = game.systems.get(Physics, plant.entity);
  return pp.scale = pp.mass = Math.max((pp.mass - (0.05 * ap.mass)), 0);

}));