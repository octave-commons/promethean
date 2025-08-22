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
var config = require("@crash-landed/config.js");
import { 
  config
 } from "./config.js";
var randomLocation = (function randomLocation$() {
  /* random-location eval.sibilant:4:0 */

  return [ (function() {
    /* eval.sibilant:2:458 */
  
    var rand = ((Math.random() * (config.dimensions[0] - 0)) + 0);
    return (config.dimensions[0] - (rand / 2));
  }).call(this), (function() {
    /* eval.sibilant:2:458 */
  
    var rand = ((Math.random() * (config.dimensions[1] - 0)) + 0);
    return (config.dimensions[1] - (rand / 2));
  }).call(this) ];
});
export { 
  randomLocation
 };