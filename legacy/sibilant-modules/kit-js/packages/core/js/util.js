

(function(a, b, c) {
  /* inc/core/defs.sibilant:53:9 */

  return foo(this);
}).bind(this);


;

;
var R = require("ramda"),
    util = require("../js/andy-util.js");
var mixin = util.mixin;
mixin(util, exports);
var either = (function either$(left, right, value) {
  /* either sib/util.sibilant:11:0 */

  return (function() {
    if (value) {
      return left(value);
    } else {
      return right(value);
    }
  }).call(this);
});
exports.either = either;
var conditional = (function conditional$(value, pred, action, ...rest) {
  /* conditional sib/util.sibilant:16:0 */

  "A functional conditional operator. Immediately evaluates its arguements.";
  return (function() {
    if (action) {
      return (function() {
        if (pred(value)) {
          return action(value);
        } else {
          return conditional(value, ...rest);
        }
      }).call(this);
    } else if (pred) {
      return pred(value);
    } else {
      return value;
    }
  }).call(this);
});
exports.conditional = conditional;
var cond = (function cond$(pred, action, ...rest) {
  /* cond sib/util.sibilant:29:0 */

  "A lazy application of a functional conditional operator. Waits for a value to be given to it before applying its functional arguements";
  return ((value) => {
  	
    return conditional(value, pred, action, ...rest);
  
  });
});
exports.cond = cond;
var partiallyApplyAfter = (function partiallyApplyAfter$(f, ...args) {
  /* partially-apply-after sib/util.sibilant:34:0 */

  "partially apply a function with the rest of the arguements to this function being appended to the end of the arguements of the given function";
  return (function(...restArgs) {
    /* sib/util.sibilant:36:2 */
  
    return f(...restArgs, ...args);
  });
});
exports.partiallyApplyAfter = partiallyApplyAfter;
// Object.prototype.keys = (function Object$prototype$keys$(object = this) {
//   /* Object.prototype.keys inc/core/function-expressions.sibilant:30:8 */

//   return Object.keys(object);
// });
// Object.prototype.each = (function Object$prototype$each$(f = this.f, object = this) {
//   /* Object.prototype.each inc/core/function-expressions.sibilant:30:8 */

//   object.keys().each(((k, i) => {
  	
//     return f(object[k], k, object);
  
//   }));
//   return object;
// });
Array.prototype.each = (function Array$prototype$each$(f = this.f, array = this) {
  /* Array.prototype.each inc/core/function-expressions.sibilant:30:8 */

  array.forEach(f);
  return this;
});
Map.prototype.each = (function Map$prototype$each$(f) {
  /* Map.prototype.each sib/util.sibilant:57:0 */

  this.forEach(f);
  return this;
});
