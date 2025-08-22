

(function(a, b, c) {
  /* ../../node_modules/kit/inc/core/defs.sibilant:53:9 */

  return foo(this);
}).bind(this);


;

;
var Descriptions = {  };
var R = require("ramda");
var fmap = R.curry((f, a) => {
	
  return a.map(f);

});
var is = { 
  string( v ){ 
    
      return typeof v === "string";
    
   }
 };
is.empty__QUERY = (function is$empty__QUERY$(value) {
  /* is.empty? ../../node_modules/kit/inc/core/fp.sibilant:12:0 */

  return 0 === value.length;
});
var athrow = (function athrow$(errType, message) {
  /* athrow ../../node_modules/kit/inc/core/fp.sibilant:14:0 */

  return () => {
  	
    return (new errType(message));
  
  };
});
var getValueOf = (function getValueOf$(o) {
  /* get-value-of ../../node_modules/kit/inc/core/fp.sibilant:17:0 */

  return o.getValue();
});
var { 
  create,
  extend,
  mixin,
  conditional,
  cond,
  partiallyApplyAfter
 } = require("kit/js/util");
Map.prototype.each = (function Map$prototype$each$(f) {
  /* Map.prototype.each index.sibilant:3:0 */

  this.forEach(f);
  return this;
});
var { 
  create,
  extend,
  mixin,
  cond
 } = require("kit/js/util"),
    { 
  Interface
 } = require("./lib/interface");
mixin({ 
  create,
  extend,
  mixin,
  cond,
  Interface
 }, global);
var { 
  Model,
  Storage
 } = require("./lib/model"),
    { 
  ProbabilityTree
 } = require("./lib/probability-tree");
exports.Storage = Storage;
exports.Model = Model;
exports.ProbabilityTree = ProbabilityTree;


// var models = {
//     emotion,
//     topics,
//     user,
//     channel
// }
// var Duckling = {
//     models,
//     train() {},
//     talk() {},
//     save() {},
//     load() {},
//     listen(){},
//     close(){},


// }
