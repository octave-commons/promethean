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
  Interface
 } from "../interface/index.js";
import { 
  Actor
 } from "../actor/index.js";
import { 
  emit
 } from "../events/index.js";
var { 
  inspect
 } = require("util"),
    vm = require("vm");
var id = 0;
var runIn = R.curry((function(string) {
  /* eval.sibilant:11:34 */

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
  _send( js = (typeof js !== "undefined") ? js : this.js;,context = (typeof context !== "undefined") ? context : this.context; ){ 
    
      return Promise.resolve(js).then(runIn).then(((result) => {
      	return this.emit("message", [ "result", result ]);
      }), result).catch(((err) => {
      	this.emit("message", [ "error", err ]);
      throw err
      }));
    
   }
 });
exports.Evaluator = Evaluator;