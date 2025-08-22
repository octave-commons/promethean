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
  SystemsManager,
  ThreadedSystem
 } from "./system.js";
import { 
  gameData,
  particles,
  particleGroups
 } from "./data.js";
var VelocitySystem = ThreadedSystem.define("VelocitySystem", { 
  url:"/client/colliding-particles/workers/velocity.js",
  data:[ particles.vel, particles.correction, particles.pos ]
 });
export { 
  VelocitySystem
 };
var AccelerationSystem = ThreadedSystem.define("AccelerationSystem", { 
  url:"/client/colliding-particles/workers/acceleration.js",
  data:[ particles.vel, particles.deflection, particles.nearGravity, particles.farGravity ]
 });
export { 
  AccelerationSystem
 };
var ParticleAttractorSystem = ThreadedSystem.define("ParticleAttractorSystem", { 
  url:"/client/colliding-particles/workers/local-attractor-manager.js",
  data:[ particles.pos, particles.phys, particles.groupId, particles.nearGravity ]
 });
export { 
  ParticleAttractorSystem
 };
var ClusterAttractorSystem = ThreadedSystem.define("ClusterAttractorSystem", { 
  url:"/client/colliding-particles/workers/cluster-attractor-manager.js",
  data:[ particles.pos, particles.phys, particles.groupId, particleGroups, particles.farGravity ]
 });
export { 
  ClusterAttractorSystem
 };
var GroupingSystem = ThreadedSystem.define("GroupingSystem", { 
  url:"/client/colliding-particles/workers/kd-grouper.js",
  data:[ particles.pos, particles.phys, particles.groupId, particles.kdTree, particleGroups ]
 });
export { 
  GroupingSystem
 };
var ElasticDeflectionSystem = ThreadedSystem.define("ElasticDeflectionSystem", { 
  url:"/client/colliding-particles/workers/elastic-deflection-manager.js",
  data:[ particles.pos, particles.vel, particles.phys, particles.kdTree, particles.deflection, particles.correction ]
 });
export { 
  ElasticDeflectionSystem
 };
var KdTreeBuilder = ThreadedSystem.define("KdTreeBuilder", { 
  url:"/client/colliding-particles/workers/kd-tree-builder.js",
  data:[ particles.pos, particles.kdTree ]
 });
var GameSystemsManager = SystemsManager.define("GameSystemsManager", { 
  systems:[ VelocitySystem, GroupingSystem, AccelerationSystem, ParticleAttractorSystem, ClusterAttractorSystem, ElasticDeflectionSystem, KdTreeBuilder ],
  data:gameData
 });
export { 
  GameSystemsManager
 };