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
  Vector2DPhaseSpace
 } from "../typed-arrays/vector-2d.js";
const bounds=[ 10000001000000 ];
self.onmessage = (function self$onmessage$(e) {
  /* self.onmessage eval.sibilant:8:0 */

  const [ [ vb1, vb2 ], [ pb1, pb2 ], [ ab1, ab2 ] ]=e.data.buffers;
  const velocities=Vector2DPhaseSpace.fromBuffers(vb1, vb2);
  const positions=Vector2DPhaseSpace.fromBuffers(pb1, pb2);
  const attractors=Vector2DPhaseSpace.fromBuffers(ab1, ab2);
  for (var pos of positions.data)
  {
  const v=velocities.data[pos.id];;
  const a=attractors.data[pos.id];;
  const p_=Vector.spawn(v.x, v.y);;
  p_.addTo(a);
  pos.addTo(p_);
  p_.despawn()
  }
  ;
  self.postMessage([ [ vb1, pb1 ], [ vb2, pb2 ] ]);
  velocities.despawn();
  return positions.despawn();
});