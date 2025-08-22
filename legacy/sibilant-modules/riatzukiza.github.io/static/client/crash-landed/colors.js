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
  Trie
 } from "/shared/data-structures/trees/trie.js";
Trie.get = (function Trie$get$(...args) {
  /* Trie.get eval.sibilant:4:0 */

  return this.find(...args).value;
});
var memoize = (function memoize$(f) {
  /* memoize eval.sibilant:7:0 */

  var cache = create(Trie)();
  return ((...args) => {
  	return (function() {
    if (cache.has(args)) {
      return cache.get(args);
    } else {
      var r = (function() {
        /* inc/misc.sibilant:1:1399 */
      
        return f(...args);
      }).call(this);
      cache.set(args, r);
      return r;
    }
  }).call(this);
  });
});
var rgba = memoize(((r, g, b, a) => {
	return { 
  r,
  g,
  b,
  a
 };
}));
export { 
  rgba
 };