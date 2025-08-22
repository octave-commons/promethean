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
  TrailDots
 } from "/client/obstacles/systems/ants/trail-dots.js";
import { 
  DecayingTrails
 } from "/client/obstacles/systems/ants/trail-segments.js";
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
  rgba
 } from "/client/obstacles/colors.js";
import { 
  Collision,
  placeEntity
 } from "/shared/systems/collision.js";
import { 
  game,
  activeGameSystems
 } from "/client/obstacles/game.js";
import { 
  TrailsPanel
 } from "/client/obstacles/systems/ants/trail-panel.js";
import { 
  config
 } from "/client/obstacles/config.js";
import { 
  Friction
 } from "/client/obstacles/forces.js";
const systems=[ Position, TrailDots, DecayingTrails, TrailsPanel ];
const trailSegments=create(EntityGroup)("Trail segments", systems, game.ent);
var getTrailSegments = (function getTrailSegments$() {
  /* get-trail-segments eval.sibilant:23:0 */

  return trailSegments;
});
var spawnAntTrailSegment = (function spawnAntTrailSegment$(ant) {
  /* spawn-ant-trail-segment eval.sibilant:25:0 */

  `
  obstacles/entities/trail-segment/spawn-trail-segment.md

  # obstacles.entities.trail-segment.spawn-trail-segment

  ## arguments

  ant: An entity from the obstacles.entities.ant entity group

  ## description

  Spawns a new trail vector entity from the ants current location and velocity.`

  ;
  const trailSegment=trailSegments.spawn();
  trailSegment.ant = ant;
  const tpos=trailSegment.positionInterface;
  const apos=ant.positionInterface;
  const avel=ant.velocityInterface;
  trailSegment.trailDot.vertex.point.x = tpos.x = apos.x;
  trailSegment.trailDot.vertex.point.y = tpos.y = apos.y;
  trailSegment.trailDot.vertex.point.z = apos.z;
  trailSegment.trailSegment.x = avel.xd;
  trailSegment.trailSegment.y = avel.yd;
  trailSegment.trailSegment.pheremones = SignalField.layer[(Math.min(Math.max(Math.round((apos.x / config.size)), 0), (config.columns - 1)) || 1)][(Math.min(Math.max(Math.round((apos.y / config.size)), 0), (config.rows - 1)) || 1)];
  return trailSegment;
});
export { 
  spawnAntTrailSegment
 };