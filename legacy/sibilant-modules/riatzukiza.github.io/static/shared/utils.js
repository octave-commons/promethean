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
var m = require("mathjs"),
    events = require("events");
import { 
  EventEmitter
 } from "./kit/events/index.js";
EventEmitter.removeAllListeners = (function EventEmitter$removeAllListeners$(...args) {
  /* Event-emitter.remove-all-listeners eval.sibilant:2:225 */

  return events.EventEmitter.prototype.removeAllListeners.call(this, ...args);
});
var rgb = (function rgb$(r, g, b) {
  /* rgb eval.sibilant:2:394 */

  return { 
    r,
    g,
    b
   };
});
export { 
  rgb
 };
var memoize = (function memoize$(f) {
  /* memoize eval.sibilant:2:444 */

  "create a memoized version of any function. A memoized function will return\n"+"previously calculated results from a cache if the arguments given to it are the same";
  var m = {  };
  return cond(R.has, R.prop, ((...args) => {
  	return f.apply(this, args);
  }));
});
export { 
  memoize
 };
var setValue = R.curry(((value, entity) => {
	return entity.value = value;
}));
export { 
  setValue
 };
var { 
  not:fnot,
  pipe:fpipe,
  equals
 } = R;
export { 
  fnot
 };
export { 
  fpipe
 };
export { 
  equals
 };
Object.prototype.each = (function Object$prototype$each$(f) {
  /* Object.prototype.each eval.sibilant:3:389 */

  return Object.keys(this).each(((k) => {
  	return f(this[k], k);
  }));
});
var curry = R.curry;
export { 
  curry
 };
var fmap = R.curry(((f, a) => {
	return a.map(f);
}));
export { 
  fmap
 };
var fset = R.curry(((o, k, v) => {
	return o[k] = v;
}));
export { 
  fset
 };
window.size = (function window$size$() {
  /* window.size eval.sibilant:3:647 */

  return [ window.innerWidth, window.innerHeight ];
});
var search = R.curry(((value, array) => {
	return array.find(((v) => {
	return v === value;
}));
}));
export { 
  search
 };
var identity = (function identity$(a) {
  /* identity eval.sibilant:3:803 */

  return a;
});
export { 
  identity
 };
var searchIfGiven = (function searchIfGiven$(array, value) {
  /* search-if-given eval.sibilant:3:846 */

  return conditional(array, (() => {
  	return typeof value !== "undefined";
  }), search(value), identity);
});
export { 
  searchIfGiven
 };
var fprint = (function fprint$($value, ...args) {
  /* fprint eval.sibilant:3:1026 */

  console.log($value, ...args);
  return $value;
});
export { 
  fprint
 };
var feach = R.curry(((f, a) => {
	return a.each(f);
}));
export { 
  feach
 };