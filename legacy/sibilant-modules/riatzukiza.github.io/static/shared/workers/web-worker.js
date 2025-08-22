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
  Spawnable
 } from "./data-structures/spawnable.js";
import { 
  EventEmitter
 } from "./kit/events/index.js";
var WebWorker = Spawnable.define("WebWorker", { 
  get url(  ){ 
    
      throw (new TypeError((this.name + " expects a definition of " + "url")))
    
   },
  init( worker = (new Worker(this.url, { 
    type:"module"
   })),events = create(EventEmitter)() ){ 
    
      this.worker = worker;this.events = events;
      return this;
    
   },
  clear(  ){ 
    
      (function() {
        if (this._blob) {
          (function() {
            if (this._blob.spawn) {
              return this._blob.despawn();
            } else if ((this._blob[0] && this._blob[0].spawn)) {
              return this._blob.each(((el) => {
              	return el.despawn();
              }));
            }
          }).call(this);
          return this._blob = null;
        }
      }).call(this);
      (function() {
        if (this._worker) {
          (function() {
            if (this._worker.spawn) {
              return this._worker.despawn();
            } else if ((this._worker[0] && this._worker[0].spawn)) {
              return this._worker.each(((el) => {
              	return el.despawn();
              }));
            }
          }).call(this);
          return this._worker = null;
        }
      }).call(this);
      return this.code = null;
    
   },
  start(  ){ 
    
      const self=this;
      this.worker.onmessage = (function this$worker$onmessage$(m) {
        /* this.worker.onmessage eval.sibilant:18:4 */
      
        return self.events.emit("message", m.data);
      });
      this.worker.onerror = (function this$worker$onerror$(e) {
        /* this.worker.onerror eval.sibilant:21:4 */
      
        console.log("error:", e);
        return self.events.emit("error", e.message);
      });
      return self.events.emit("start");
    
   },
  _send( data ){ 
    
      return this.worker.postMessage(data);
    
   },
  get send(  ){ 
    
      throw (new TypeError((this.name + " expects a definition of " + "send")))
    
   }
 });
export { 
  WebWorker
 };