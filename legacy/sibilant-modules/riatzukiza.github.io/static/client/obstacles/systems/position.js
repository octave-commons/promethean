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
  displayDecimal
 } from "/client/obstacles/strings.js";
import { 
  Position,
  PositionInterface
 } from "/shared/systems/position.js";
import { 
  renderChildren,
  createDocumentNode,
  DocumentNode,
  DocumentBody,
  DocumentHead,
  DocumentRoot
 } from "/shared/dom.js";
defView(PositionInterface.view, null, className.div("panel", style, { 
  width:"48%"
 }, "position".div(), (() => {
	return displayDecimal(this.x, 2);
}).div(", ", (() => {
	return displayDecimal(this.y, 2);
}))));
export { 
  Position
 };
export { 
  PositionInterface
 };