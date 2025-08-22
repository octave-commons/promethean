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
  Physics
 } = require("@shared/systems/physics/system.js"),
    { 
  createParticleUpdater
 } = require("@shared/field.js"),
    { 
  nextSpawn,
  spawnAnt,
  ants,
  home,
  homePos,
  nextSpawn,
  plants,
  rocks,
  spawnPlant,
  spawnRock,
  rockGenStep
 } = require("@crash-landed/entities.js"),
    { 
  randomLocation
 } = require("@crash-landed/location.js");
const updateParticle=createParticleUpdater(config, game);
game.events.on("tick", (() => {
	
  nextSpawn(game);
  (function() {
    if (((game.ticker.ticks % 5) === 0 && config.rocks > rocks.size)) {
      return rockGenStep();
    }
  }).call(this);
  (function() {
    if (((game.ticker.ticks % 5) === 2 && config.startingPlants > plants.size)) {
      return spawnPlant(randomLocation(), ((Math.random() * ( - config.plantMassLimit)) + config.plantMassLimit));
    }
  }).call(this);
  return (function() {
    if ((game.ticker.ticks % 50)) {
      return plants.group.each(((plant) => {
      	
        var physics = game.systems.get(Physics, plant);
        (function() {
          if (0 >= physics.mass) {
            return plants.despawn(plant);
          } else {
            const x=(physics.mass + (Math.random() * 10 * config.growthRate));
            physics.mass = x;
            physics.scale = x;
            return (function() {
              if (physics.mass > config.plantMassLimit) {
                const x=(physics.mass / 2);
                physics.mass = x;
                physics.scale = x;
                const plant_=spawnPlant([ ((function() {
                  /* eval.sibilant:1:738 */
                
                  var rand = ((Math.random() * (physics.scale - 0)) + 0);
                  return (physics.scale - (rand / 2));
                }).call(this) + physics.position.x), ((function() {
                  /* eval.sibilant:1:738 */
                
                  var rand = ((Math.random() * (physics.scale - 0)) + 0);
                  return (physics.scale - (rand / 2));
                }).call(this) + physics.position.y) ], physics.mass);
                const physics_=game.systems.get(Physics, plant_);
                const vx=(function() {
                  /* eval.sibilant:1:738 */
                
                  var rand = ((Math.random() * (config.spawnStatic - 0)) + 0);
                  return (config.spawnStatic - (rand / 2));
                }).call(this);
                const vy=(function() {
                  /* eval.sibilant:1:738 */
                
                  var rand = ((Math.random() * (config.spawnStatic - 0)) + 0);
                  return (config.spawnStatic - (rand / 2));
                }).call(this);
                physics.velocity.accelerate([ vx, vy ]);
                return physics_.velocity.accelerate([ (-1 * vx), (-1 * vy) ]);
              }
            }).call(this);
          }
        }).call(this);
        return null;
      
      }));
    }
  }).call(this);

})).once("error", ((err) => {
	
  console.log("error on", "tick", "of", "game.events", "given", "null");
  return console.log(err);

}));