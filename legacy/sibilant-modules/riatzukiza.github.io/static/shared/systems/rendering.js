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
  DotInterface,
  Dot
 } from "./rendering/dot.js";
import { 
  Layer
 } from "./rendering/layer.js";
import { 
  Renderable
 } from "./rendering/renderable.js";
import { 
  ScalingVertex
 } from "./rendering/scaling-vertex.js";
import { 
  SpriteInterface,
  Sprite
 } from "./rendering/sprite.js";
import { 
  Vertex
 } from "./rendering/vertex.js";
export { 
  DotInterface,
  Dot
 };
export { 
  Layer
 };
export { 
  Renderable
 };
export { 
  ScalingVertex
 };
export { 
  SpriteInterface,
  Sprite
 };
export { 
  Vertex
 };