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
  AntDots
 } from "../systems/ants/ant-dot.js";
import { 
  AntTrails
 } from "../systems/ants/ant-trails.js";
import { 
  AntLifeTimer
 } from "../systems/ants/ant-life-timer.js";
import { 
  Position
 } from "../systems/position.js";
import { 
  Velocity
 } from "../systems/velocity.js";
import { 
  Physics
 } from "/shared/systems/physics.js";
import { 
  EntityGroup
 } from "/shared/ecs.js";
import { 
  AntSprites
 } from "../systems/ant-sprites.js";
import { 
  Collision,
  placeEntity
 } from "/shared/systems/collision.js";
import { 
  game,
  activeGameSystems
 } from "../game.js";
import { 
  AntPanel
 } from "../systems/ants/ant-panel.js";
import { 
  config
 } from "../config.js";
const ants=create(EntityGroup)("Ants", [ Collision, AntSprites, AntPanel, Physics, Velocity, Position, AntTrails, AntLifeTimer ], game.ent);
var clearAnts = (function clearAnts$() {
  /* clear-ants eval.sibilant:31:0 */

  return ants.clear();
});
var spawnAnt = (function spawnAnt$(x_y$33, home, startingLife) {
  /* spawn-ant eval.sibilant:32:0 */

  var x = x_y$33[0],
      y = x_y$33[1];

  var ant = ants.spawn();
  game.systems.get(Position, ant).x = x;
  game.systems.get(Position, ant).y = y;
  game.systems.get(Position, ant).z = 0;
  game.systems.get(Physics, ant).scale = 1;
  game.systems.get(Physics, ant).mass = 1;
  game.systems.get(Physics, ant).forces = [ SignalField, Friction ];
  var v = game.systems.get(Velocity, ant);
  (function() {
    if (!(config.spawnStatic === 0)) {
      return v.accelerate([ (1 + ((Math.random() * config.spawnStatic) * (function() {
        if (Math.random() < 0.5) {
          return -1;
        } else {
          return 1;
        }
      }).call(this))), (1 + ((Math.random() * config.spawnStatic) * (function() {
        if (Math.random() < 0.5) {
          return -1;
        } else {
          return 1;
        }
      }).call(this))) ]);
    }
  }).call(this);
  return placeEntity(ant, game, config);
});
export { 
  spawnAnt
 };
export { 
  clearAnts
 };
export { 
  ants
 };