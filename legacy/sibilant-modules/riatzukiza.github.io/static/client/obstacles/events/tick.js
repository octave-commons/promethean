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
  Physics
 } from "/shared/systems/physics/system.js";
import { 
  createParticleUpdater
 } from "/shared/field.js";
import { 
  nextSpawn,
  spawnAnt,
  ants,
  home,
  homePos,
  plants,
  rocks,
  spawnPlant,
  spawnRock,
  rockGenStep
 } from "../entities.js";
import { 
  randomLocation
 } from "../location.js";
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
            const plant_=spawnPlant([ (((Math.random() * physics.scale) * (function() {
              if (Math.random() < 0.5) {
                return -1;
              } else {
                return 1;
              }
            }).call(this)) + physics.position.x), (((Math.random() * physics.scale) * (function() {
              if (Math.random() < 0.5) {
                return -1;
              } else {
                return 1;
              }
            }).call(this)) + physics.position.y) ], physics.mass);
            const physics_=game.systems.get(Physics, plant_);
            const vx=((Math.random() * config.spawnStatic) * (function() {
              if (Math.random() < 0.5) {
                return -1;
              } else {
                return 1;
              }
            }).call(this));
            const vy=((Math.random() * config.spawnStatic) * (function() {
              if (Math.random() < 0.5) {
                return -1;
              } else {
                return 1;
              }
            }).call(this));
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