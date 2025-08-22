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
var QuadTree = require("@timohausmann/quadtree-js");
import "/shared/systems/rendering/dot.js";
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
  Group
 } from "/shared/data-structures/group.js";
import { 
  List
 } from "/shared/data-structures/list.js";
import { 
  Vector
 } from "/shared/vectors.js";
import { 
  Trie
 } from "/shared/data-structures/trees/trie.js";
import { 
  Collision,
  placeEntity
 } from "/shared/systems/collision.js";
import { 
  Friction
 } from "/client/obstacles/forces.js";
import { 
  game,
  activeGameSystems
 } from "/client/obstacles/game.js";
import { 
  RockSprites
 } from "/client/obstacles/systems/rock-sprites.js";
import { 
  rgba
 } from "/client/obstacles/colors.js";
import { 
  config
 } from "/client/obstacles/config.js";
const rocks=create(EntityGroup)("Rocks", [ RockSprites, Position, Physics, Collision, Velocity ], game.ent);
const rockPlacementVector=Vector.spawn(0, 0);
const rockScaleVariation=(config.rockMaxSize - config.rockMinSize);
const rockMassVariation=(config.rockMaxMassFactor - config.rockMinMassFactor);
const maxRockBaseMass=(config.rockMassScalingFactor * config.rockMaxMassFactor);
const minRockBaseMass=(config.rockMassScalingFactor * config.rockMinMassFactor);
const maxRockDensity=((config.rockMinSize * maxRockBaseMass) / Math.pow(config.rockMinSize, 3));
const minRockDensity=((config.rockMaxSize * maxRockBaseMass) / Math.pow(config.rockMaxSize, 3));
var spawnRock = (function spawnRock$(x_y$34, mass, scale) {
  /* spawn-rock eval.sibilant:42:0 */

  var x = x_y$34[0],
      y = x_y$34[1];

  console.log("spawning rock");
  var rock = rocks.spawn([ RockSprites, Position, Physics, Collision, Velocity ]);
  const pos=game.systems.get(Position, rock);
  pos.x = x;
  pos.y = y;
  pos.z = 0;
  const phys=game.systems.get(Physics, rock);
  phys.mass = mass;
  phys.scale = scale;
  phys.forces = [ Friction ];
  const velocity=phys.velocity;
  var hardness = Math.max(60, Math.min(225, Math.round((maxRockDensity / phys.density))));
  return placeEntity(rock, game, config);
});
var lastRockPos = [ ((Math.random() * ( - config.dimensions[0])) + config.dimensions[0]), ((Math.random() * ( - config.dimensions[1])) + config.dimensions[1]) ];
var rockGenStep = (function rockGenStep$(position = lastRockPos, mass = (config.rockMinMassFactor + ((Math.random() * ( - rockMassVariation)) + rockMassVariation)), scale = (config.rockMinSize + ((Math.random() * ( - rockScaleVariation)) + rockScaleVariation))) {
  /* rock-gen-step inc/core/function-expressions.sibilant:28:8 */

  spawnRock(position, (config.rockMassScalingFactor * scale * mass), scale);
  rockPlacementVector.rotateTo((5 * Math.random()));
  rockPlacementVector.setLength((((Math.random() * ( - 50)) + 50) * scale));
  return lastRockPos = [ (Math.abs((position[0] + rockPlacementVector.x)) % config.dimensions[0]), (Math.abs((position[1] + rockPlacementVector.y)) % config.dimensions[1]) ];
});
export { 
  rocks
 };
export { 
  spawnRock
 };
export { 
  rockGenStep
 };