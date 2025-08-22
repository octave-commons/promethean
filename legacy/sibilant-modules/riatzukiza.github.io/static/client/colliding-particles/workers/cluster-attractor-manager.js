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
  ThreadedSystem
 } from "../system.js";
import { 
  BarycenterArray
 } from "../typed-arrays/barycenter-array.js";
import { 
  ParentSystem
 } from "../system.js";
import { 
  config
 } from "../config.js";
const { 
  gravitationalConstant
 }=config;
var AttractorGroupSystem = ThreadedSystem.define("AttractorGroupSystem", { 
  url:"/client/colliding-particles/workers/cluster-attractor-system.js",
  data:[]
 });
console.log(config);
const threads=[];
for (var i = 0;config.attractorThreadCount > i;((i)++))
{
const thread=AttractorGroupSystem.spawn();;
thread.url = ("/client/colliding-particles/workers/cluster-attractor-system.js?gid=" + i);;
thread.args = { 
  threadId:i
 };;
thread.start();
threads.push(thread)
}
;
var ClusterAttractorManager = ParentSystem.define("ClusterAttractorManager", { 
  dataTypes:[ Vector2DArray, PhysicsArray, GroupIdArray, BarycenterArray, Vector2DArray ],
  async update( args,data ){ 
  
    return Promise.all(threads.map(((thread) => {
    	thread.data = data;
    return thread.update();
    })));
  
 }
 });
ClusterAttractorManager.start();