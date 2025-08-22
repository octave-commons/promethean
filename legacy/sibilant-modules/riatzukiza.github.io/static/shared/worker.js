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
  init( events = create(EventEmitter)() ){ 
    
      this.events = events;
      return this;
    
   },
  get worker(  ){ 
    
      return (function() {
        if (this._worker) {
          return this._worker;
        } else {
          return this._worker = (function() {
            /* inc/misc.sibilant:1:4125 */
          
            return (new Worker(this.url, { 
              type:"module"
             }));
          }).call(this);
        }
      }).call(this);
    
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
        /* this.worker.onmessage eval.sibilant:15:4 */
      
        return self.events.emit("message", m.data);
      });
      this.worker.onerror = (function this$worker$onerror$(e) {
        /* this.worker.onerror eval.sibilant:17:4 */
      
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
var InlineWorker = WebWorker.define("InlineWorker", { 
  get code(  ){ 
    
      throw (new TypeError((this.name + " expects a definition of " + "code")))
    
   },
  get url(  ){ 
    
      return (function() {
        if (this._url) {
          return this._url;
        } else {
          return this._url = (function() {
            /* inc/misc.sibilant:1:4125 */
          
            return window.URL.createObjectURL(this.blob);
          }).call(this);
        }
      }).call(this);
    
   },
  get blob(  ){ 
    
      return (function() {
        if (this._blob) {
          return this._blob;
        } else {
          return this._blob = (function() {
            /* inc/misc.sibilant:1:4125 */
          
            return (new Blob([ this.code ], { 
              type:"text/javascript"
             }));
          }).call(this);
        }
      }).call(this);
    
   }
 });
export { 
  InlineWorker
 };
var sendThread = (function sendThread$(data) {
  /* send-thread eval.sibilant:35:0 */

  return this.promise = this.promise.then(((resolved) => {
  	this.busy = true;
  this._send(data);
  const handleError=((message) => {
  	return reject(message);
  });
  return (new Promise(((success, fail) => {
  	var resolve = success,
      reject = fail;
  this.events.once("message", ((data) => {
  	this.busy = false;
  this.events.removeListener("error", handleError);
  return resolve(data);
  }));
  return this.events.once("error", handleError);
  })));
  }));
});
var InlineThread = InlineWorker.define("InlineThread", { 
  init( code = this.code,promise = Promise.resolve() ){ 
    
      this.code = code;this.promise = promise;
      WebWorker.init.call(this);
      return this;
    
   },
  send:sendThread
 });
export { 
  InlineThread
 };
var Thread = WebWorker.define("Thread", { 
  init( url = this.url,promise = Promise.resolve() ){ 
    
      this.url = url;this.promise = promise;
      WebWorker.init.call(this);
      return this;
    
   },
  send:sendThread
 });
export { 
  Thread
 };