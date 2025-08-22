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
  Vector
 } from "/shared/vectors.js";
import { 
  config
 } from "./config.js";
import { 
  simplex3
 } from "/shared/noise.js";
var getTileNoise = (function getTileNoise$(x = this.x, y = this.y, z = config.noiseZ, angleZoom = config.angleZoom, force = 16, v = Vector.spawn(1, 1)) {
  /* get-tile-noise inc/core/function-expressions.sibilant:28:8 */

  v.setAngle((simplex3((x / angleZoom / 5), (y / angleZoom / 5), (z / 10000)) * Math.PI * 2));
  const length=simplex3(((x / 50) + 40000), ((x / 50) + 40000), (z / 10000));
  v.setLength((length * force));
  return v;
});
export { 
  getTileNoise
 };
var getMoveNoise = (function getMoveNoise$(x = this.x, y = this.y, t = this.t, force = 16, v = Vector.spawn(1, 1)) {
  /* get-move-noise inc/core/function-expressions.sibilant:28:8 */

  v.setAngle((simplex3((x / config.angleZoom / 5), (y / config.angleZoom / 5), (t * (config.noiseZ / 10000))) * Math.PI * 2));
  const length=simplex3(((x / 50) + 40000), ((x / 50) + 40000), (t * (config.noiseZ / 10000)));
  v.setLength((length * force));
  return v;
});
export { 
  getMoveNoise
 };