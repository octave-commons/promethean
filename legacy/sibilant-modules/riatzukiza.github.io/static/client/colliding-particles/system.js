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
 } from "/shared/data-structures/spawnable.js";
import { 
  Thread
 } from "/shared/worker.js";
var ThreadedSystem = Spawnable.define("ThreadedSystem", { 
  data:[],
  args:{  },
  init( url = this.url,data = this.data,args = this.args ){ 
    
      this.url = url;this.data = data;this.args = args;
      return this;
    
   },
  get buffers(  ){ 
    
      return this.data.map((({ 
        currentState,
        nextState
       }) => {
      	return [ currentState.buffer, nextState.buffer ];
      }));
    
   },
  start(  ){ 
    
      this.thread = Thread.spawn(this.url);
      return this.thread.start();
    
   },
  update(  ){ 
    
      return this.thread.send({ 
        args:this.args,
        buffers:this.buffers
       });
    
   }
 });
export { 
  ThreadedSystem
 };
var ParentSystem = Spawnable.define("ParentSystem", { 
  dataTypes:[],
  init(  ){ 
    
      
      this.start();
      return this;
    
   },
  _update( args = this.args,buffers = this.buffers,data = this.data ){ 
    
      (function() {
        if (!(data)) {
          return this.data = buffers.map((([ b1, b2 ], i) => {
          	return this.dataTypes[i].fromBuffers(b1, b2);
          }));
        } else {
          for (var data of this.data)
          {
          data.step()
          }
          ;
          return null;
        }
      }).call(this);
      return this.update(args, this.data).then(((data) => {
      	return this.send(data);
      }));
    
   },
  start(  ){ 
    
      const handleMessage=((args, buffers) => {
      	return this._update(args, buffers);
      });
      self.onmessage = (function self$onmessage$(e) {
        /* self.onmessage eval.sibilant:36:4 */
      
        const buffers=e.data.buffers;
        const args=e.data.args;
        return handleMessage(args, buffers);
      });
      return self.onmessage;
    
   },
  send( data ){ 
    
      return self.postMessage(data);
    
   }
 });
export { 
  ParentSystem
 };
var SystemsManager = Spawnable.define("SystemsManager", { 
  systems:[],
  data:[],
  init( systems = this.systems,data = this.data ){ 
    
      this.systems = systems;this.data = data;
      systems.each(((system) => {
      	return system.init();
      }));
      return this;
    
   },
  start( systems = this.systems ){ 
    
      return systems.each(((system) => {
      	return system.start();
      }));
    
   },
  step(  ){ 
    
      return this.data.each(((data) => {
      	return data.step();
      }));
    
   },
  update(  ){ 
    
      return Promise.all(this.systems.map(((system) => {
      	return system.update();
      })));
    
   }
 });
export { 
  SystemsManager
 };