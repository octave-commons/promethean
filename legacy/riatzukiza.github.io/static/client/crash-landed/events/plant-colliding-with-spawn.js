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
    config = require("@crash-landed/config.js"),
    { 
  plants,
  ants,
  rocks
 } = require("@crash-landed/entities.js");
game.events.on("plantCollidingWithSpawn", ((home, plant) => {
	
  const v=plant.entity.velocityInterface;
  const pos=plant.pos;
  var xd = (function() {
    /* eval.sibilant:1:738 */
  
    var rand = ((Math.random() * (config.collisionStatic - 0)) + 0);
    return (config.collisionStatic - (rand / 2));
  }).call(this);
  var yd = (function() {
    /* eval.sibilant:1:738 */
  
    var rand = ((Math.random() * (config.collisionStatic - 0)) + 0);
    return (config.collisionStatic - (rand / 2));
  }).call(this);
  pos.x = (pos.x + xd);
  pos.y = (pos.y + yd);
  return v.accelerate([ xd, yd ]);

})).once("error", ((err) => {
	
  console.log("error on", "plantCollidingWithSpawn", "of", "game.events", "given", "home(plant)");
  return console.log(err);

}));