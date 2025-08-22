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
var events = require("events");
var emit = R.curry(((event, emitter, data) => {
	
  return emitter.emit(event, data);

}));
var bubble = (function bubble$(src, target, event) {
  /* bubble src/event-emitter.sibilant:12:0 */

  "cause an `event` on `src` to be emitted on another `target` emitter";
  return src.on(event, emit(event, target));
});
var EventEmitter = Interface.define("EventEmitter", { 
  init(  ){ 
    
      
      events.EventEmitter.call(this);
      return this;
    
   },
  doc:("a simple wrapper around the " + "event" + " modules  type" + "EventEmitter"),
  extend:events.EventEmitter.prototype
 });
exports.EventEmitter = EventEmitter;
exports.emit = emit;
exports.bubble = bubble;