var R = require("ramda");
var { 
  create,
  extend,
  mixin,
  conditional,
  cond,
  partiallyApplyAfter
 } = require("@kit-js/core/js/util");
var { 
  Interface
 } = require("@kit-js/interface");
var { 
  emit,
  bubble,
  EventEmitter
 } = require("./event-emitter");
var resolve = (function resolve$(v) {
  /* resolve src/actor.sibilant:36:0 */

  return Promise.resolve(v);
});
var sendTo = R.curry(((actor, msg) => {
	
  return actor.send(msg);

}));
var Actor = EventEmitter.define("Actor", { 
  init( promise = resolve() ){ 
    
      this.promise = promise;
      EventEmitter.init.call(this);
      this.on("error", ((e) => {
      	
        return this.promise = resolve();
      
      }));
      return this;
    
   },
  _send( msg ){ 
    
      return this.emit("message", msg);
    
   },
  send( msg ){ 
    
      return this.promise = this.promise.then(((nil) => {
      	
        return this._send(msg);
      
      })).catch(((e) => {
      	
        this.emit("error", e);
        throw e
      
      }));
    
   }
 });
exports.Actor = Actor;
exports.sendTo = sendTo;