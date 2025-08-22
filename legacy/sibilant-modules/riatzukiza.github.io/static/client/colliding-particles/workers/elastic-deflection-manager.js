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
import '/bundles/external.js';
import { 
  Vector
 } from "/shared/vectors.js";
import { 
  Spawnable
 } from "/shared/data-structures/spawnable.js";
import { 
  PhysicsArray
 } from "../typed-arrays/physics-array.js";
import { 
  GroupIdArray
 } from "../typed-arrays/group-id-array.js";
import { 
  Vector2DArray
 } from "../typed-arrays/vector-2d.js";
import { 
  KdTree
 } from "../typed-arrays/kd-tree.js";
import { 
  ThreadedSystem
 } from "../system.js";
import { 
  config
 } from "../config.js";
const { 
  gravitationalConstant
 }=config;
import { 
  ParentSystem
 } from "../system.js";
var DeflectionGroupSystem = ThreadedSystem.define("DeflectionGroupSystem", { 
  url:"/client/colliding-particles/workers/local-attractor-system.js",
  data:[]
 });
const threads=[];
for (var i = 0;config.collisionGroupCount > i;((i)++))
{
const thread=DeflectionGroupSystem.spawn();;
thread.url = ("/client/colliding-particles/workers/kd-deflection.js?gid=" + i);;
thread.start();
threads.push(thread)
}
;
var ElasticDeflectionSystem = ParentSystem.define("ElasticDeflectionSystem", { 
  dataTypes:[ Vector2DArray, Vector2DArray, PhysicsArray, KdTree, Vector2DArray, Vector2DArray ],
  async update( { 
  bounds
 },[ positions, velocities, phys, kdTree, deflections, corrections ] ){ 
  
    return Promise.all(threads.map(((thread, i) => {
    	thread.args = { 
      collisionGroupId:i,
      bounds
     };
    thread.data = [ positions, velocities, phys, kdTree, deflections, corrections ];
    return thread.update();
    })));
  
 }
 });
ElasticDeflectionSystem.start();