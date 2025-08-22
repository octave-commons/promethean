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
 } from "/shared/systems/rendering/dot.js";
import { 
  rgba
 } from "/client/obstacles/colors.js";
const views=(new Map());
var AntDot = DotInterface.define("AntDot", { 
  docString:`
  Obstacles/systems/Ant-dot.md

  # Obstacles.systems.Ant-dot

  ## arguments

  entity system

  ## description

  A component for rendering ants as red dots.
  Inhereits from Dot-interface (/shared/systems/rendering/dot.js)`

  ,
  color:rgba(255, 255, 255, 255)
 });
export { 
  AntDot
 };
var AntDots = Dot.define("AntDots", { 
  interface:AntDot,
  docString:`
  Obstacles/systems/Ant-dots.md

  # Obstacles.systems.Ant-dots

  ## arguments

  entity system

  ## description

  A component for rendering ants as red dots`

  
 });
export { 
  AntDots
 };