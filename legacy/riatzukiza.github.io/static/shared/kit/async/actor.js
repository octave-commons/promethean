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
  emit,
  bubble,
  EventEmitter
 } from "./event-emitter.js";
import { 
  Interface
 } from "../interface/index.js";
var resolve = (function resolve$(v) {
  /* resolve eval.sibilant:37:0 */

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
export { 
  Actor
 };
export { 
  sendTo
 };