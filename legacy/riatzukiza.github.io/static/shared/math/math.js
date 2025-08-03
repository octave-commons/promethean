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
var tau = (Math.PI * 2);
export { 
  tau
 };
var euclidianDistance = (function euclidianDistance$(x, y, a, b) {
  /* euclidian-distance eval.sibilant:2:841 */

  return Math.sqrt((Math.pow((x - a), 2) + Math.pow((y - b), 2)));
});
export { 
  euclidianDistance
 };
var productOf = (function productOf$(a) {
  /* product-of eval.sibilant:2:974 */

  return a.reduce(((value, e) => {
  	return (value * e);
  }), 1);
});
export { 
  productOf
 };
var randomUbyte = (function randomUbyte$() {
  /* random-ubyte eval.sibilant:2:1060 */

  return (Math.floor((Math.random() * (255 - 0))) + 0);
});
export { 
  randomUbyte
 };
var square = (function square$(dim, f) {
  /* square eval.sibilant:2:1127 */

  var lim = Math.round((dim / 2));
  (function() {
    /* inc/loops.sibilant:26:8 */
  
    var $for = null;
    for (var i = (0 - lim);i <= lim;++(i))
    {
    $for = (function() {
      /* inc/loops.sibilant:28:35 */
    
      return (function() {
        /* inc/loops.sibilant:26:8 */
      
        var $for = null;
        for (var j = (0 - lim);j <= lim;++(j))
        {
        $for = (function() {
          /* inc/loops.sibilant:28:35 */
        
          return f(i, j);
        }).call(this);
        }
        ;
        return $for;
      }).call(this);
    }).call(this);
    }
    ;
    return $for;
  }).call(this);
  return null;
});
export { 
  square
 };
var inverseSquare = (function inverseSquare$(rate, c, pos, { 
  x,
  y
 }) {
  /* inverse-square eval.sibilant:2:1335 */

  return (rate / (c + Math.pow(euclidianDistance(x, y, pos.x, pos.y), 2)));
});
export { 
  inverseSquare
 };
var add = (function add$(a, b) {
  /* add eval.sibilant:2:1479 */

  return (a + b);
});
export { 
  add
 };
var summate = (function summate$(a) {
  /* summate eval.sibilant:2:1520 */

  return a.reduce(add, 0);
});
export { 
  summate
 };