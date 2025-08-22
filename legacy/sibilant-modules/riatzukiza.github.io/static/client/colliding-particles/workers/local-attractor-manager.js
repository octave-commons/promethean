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
  config
 } from "../config.js";
const { 
  gravitationalConstant
 }=config;
var AttractorGroupSystem = ThreadedSystem.define("AttractorGroupSystem", { 
  url:"/client/colliding-particles/workers/local-attractor-system.js",
  data:[]
 });
console.log(config);
const threads=[];
for (var i = 0;config.attractorThreadCount > i;((i)++))
{
const thread=AttractorGroupSystem.spawn();;
thread.url = ("/client/colliding-particles/workers/local-attractor-system.js?gid=" + i);;
thread.args = { 
  threadId:i
 };;
thread.start();
threads.push(thread)
}
;
self.onmessage = (function self$onmessage$(e) {
  /* self.onmessage eval.sibilant:31:0 */

  const [ [ pb1, pb2 ], [ mb1, mb2 ], [ gb1, gb2 ], [ nb1, nb2 ] ]=e.data.buffers;
  const positions=Vector2DArray.fromBuffers(pb1, pb2);
  const phys=PhysicsArray.fromBuffers(mb1, mb2);
  const groupIds=GroupIdArray.fromBuffers(gb1, gb2);
  const nearGravity=Vector2DArray.fromBuffers(nb1, nb2);
  const data=[ positions, phys, groupIds, nearGravity ];
  return Promise.all(threads.map(((thread) => {
  	thread.data = data;
  return thread.update();
  }))).then(((nil) => {
  	self.postMessage([]);
  positions.despawn();
  nearGravity.despawn();
  phys.despawn();
  return groupIds.despawn();
  }));
});