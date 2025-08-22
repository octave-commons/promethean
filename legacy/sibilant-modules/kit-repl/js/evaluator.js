

(function(a, b, c) {
  /* node_modules/kit/inc/core/defs.sibilant:53:9 */

  return foo(this);
}).bind(this);





;
var R = require("ramda");
var { 
  create,
  extend,
  mixin,
  conditional,
  cond,
  partiallyApplyAfter
 } = require("kit/js/util");
var { 
  Interface
 } = require("kit-interface");
var { 
  Actor,
  sendTo
 } = require("kit-actor");
var { 
  EventEmitter,
  emit,
  bubble
 } = require("kit-events");
var { 
  inspect
 } = require("util"),
    vm = require("vm");
var id = 0;
var runIn = R.curry(((string) => {
	
  return vm.runInThisContext(string, { 
    filename:("kit" + ((id)++))
   });

}));
var Evaluator = Actor.define("Evaluator", { 
  init(  ){ 
    
      
      Actor.init.call(this);
      return this;
    
   },
  spawn(  ){ 
    
      return create(this)();
    
   },
  _send( js = this.js,context = this.context ){ 
    
      return Promise.resolve(js).then(runIn).then(((result) => {
      	
        return this.emit("message", [ "result", result ]);
      
      })).catch(((err) => {
      	
        return this.emit("message", [ "error", err ]);
      
      }));
    
   }
 });
exports.Evaluator = Evaluator;