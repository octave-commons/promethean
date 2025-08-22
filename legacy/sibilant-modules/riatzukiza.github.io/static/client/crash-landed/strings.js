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
var displayDecimal = (function displayDecimal$(d = this.d, n = 6) {
  /* display-decimal inc/core/function-expressions.sibilant:28:8 */

  return (Math.round((Math.pow(10, n) * d)) / Math.pow(10, n));
});
export { 
  displayDecimal
 };