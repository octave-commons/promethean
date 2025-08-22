

(function(a, b, c) {
  /* inc/core/defs.sibilant:53:9 */

  return foo(this);
}).bind(this);





;

;
var Descriptions = {  };
var R = require("ramda");
var is = { 
  def:string
 };
is.empty__QUERY = (function is$empty__QUERY$(value) {
  /* is.empty? inc/core/fp.sibilant:11:0 */

  return 0 === value.length;
});
var athrow = (function athrow$(errType, message) {
  /* athrow inc/core/fp.sibilant:14:0 */

  return (() => {
  	
    return (new errType(message));
  
  });
});
var getValueOf = (function getValueOf$(o) {
  /* get-value-of inc/core/fp.sibilant:17:0 */

  return o.getValue();
});
var { 
  Interface
 } = require("kit-interface");
var { 
  create,
  extend,
  mixin,
  conditional,
  cond,
  partiallyApplyAfter
 } = require("kit/js/util");