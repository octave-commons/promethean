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
  simplex3
 } from "/shared/noise.js";
import { 
  Vector
 } from "/shared/vectors.js";
import { 
  Vector2DPhaseSpace
 } from "../typed-arrays/vector-2d.js";
var setMoveNoise = (function setMoveNoise$(v = this.v, x = this.x, y = this.y, t = 0, force = 0.01, angleZoom = 1000, noiseZ = 100) {
  /* set-move-noise inc/core/function-expressions.sibilant:28:8 */

  const v_=Vector.spawn();
  const z=(noiseZ / 10000);
  const angle=(simplex3((angleZoom / x / 5), (angleZoom / y / 5), (t * z)) * Math.PI * 2);
  const length=((simplex3(((x / 50) + 40000), ((y / 50) + 40000), (t * z)) * force) / 20);
  v_.setLength(length);
  v_.setAngle(angle);
  v.addTo(v_);
  return v_.despawn();
});
var i = 0;
self.onmessage = (function self$onmessage$(e) {
  /* self.onmessage eval.sibilant:27:0 */

  const [ [ vb1, vb2 ], [ pb1, pb2 ] ]=e.data.buffers;
  const velocities=Vector2DPhaseSpace.fromBuffers(vb1, vb2);
  const positions=Vector2DPhaseSpace.fromBuffers(pb1, pb2);
  for (var v_ of velocities.data)
  {
  const p=positions.data[v_.id];;
  setMoveNoise(v_, p.x, p.y, i)
  }
  ;
  ((i)++);
  self.postMessage([ [ vb1, pb1 ], [ vb2, pb2 ] ]);
  return null;
});