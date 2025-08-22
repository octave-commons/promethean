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
  Vector2DArray
 } from "./typed-arrays/vector-2d.js";
import { 
  rendering,
  vertexLayer
 } from "./rendering.js";
import { 
  Interface
 } from "/shared/kit/interface/index.js";
import { 
  PhysicsArray
 } from "./typed-arrays/physics-array.js";
import { 
  GroupIdArray
 } from "./typed-arrays/group-id-array.js";
import { 
  BarycenterArray
 } from "./typed-arrays/barycenter-array.js";
import { 
  KdTree
 } from "./typed-arrays/kd-tree.js";
import { 
  config
 } from "./config.js";
const { 
  particleCount
 }=config;
const vertices=vertexLayer(particleCount);
export { 
  vertices
 };
var particles = Interface.define("particles", { 
  pos:Vector2DArray.spawn(config.particleCount),
  vel:Vector2DArray.spawn(config.particleCount),
  nearGravity:Vector2DArray.spawn(config.particleCount),
  farGravity:Vector2DArray.spawn(config.particleCount),
  deflection:Vector2DArray.spawn(config.particleCount),
  correction:Vector2DArray.spawn(config.particleCount),
  phys:PhysicsArray.spawn(config.particleCount),
  groupId:GroupIdArray.spawn(config.particleCount),
  kdTree:KdTree.spawn((32 * config.particleCount))
 });
export { 
  particles
 };
const particleGroups=BarycenterArray.spawn(config.groupCount);
export { 
  particleGroups
 };
const gameData=[ particles.pos, particles.phys, particles.vel, particles.nearGravity, particles.farGravity, particles.deflection, particles.correction, particles.groupId, particles.kdTree, particleGroups ];
export { 
  gameData
 };