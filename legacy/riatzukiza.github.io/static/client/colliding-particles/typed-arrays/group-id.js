Array.prototype.each = (function Array$prototype$each$(f) {
  /* Array.prototype.each inc/misc.sibilant:1:1692 */

  this.forEach(f);
  return this;
});
Object.prototype.each = (function Object$prototype$each$(f) {
  /* Object.prototype.each inc/misc.sibilant:1:1754 */

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
  DoubleBufferedArray
 } from "./double-buffered.js";
import { 
  GroupId
 } from "../data-types/physics-object.js";
var GroupIdArray = DoubleBufferedArray.define("GroupIdArray", { 
  dataType:GroupId
 });
export { 
  GroupIdArray
 };