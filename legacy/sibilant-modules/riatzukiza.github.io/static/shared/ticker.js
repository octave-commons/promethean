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
  EventEmitter
 } from "./kit/events/index.js";
import { 
  List
 } from "./data-structures/list.js";
import { 
  Interface
 } from "/shared/kit/interface/index.js";
import { 
  Spawnable
 } from "/shared/data-structures/spawnable.js";
var Ticker = Spawnable.define("Ticker", { 
  state:false,
  ticks:0,
  events:create(EventEmitter)(),
  get rate(  ){ 
    
      return (1000 / this.fps);
    
   },
  get averageLatency(  ){ 
    
      return (this.latencyAccumulator.reduce(((sum, n) => {
      	return (sum + n);
      }), 0) / this.latencyAccumulator.length);
    
   },
  get averageFps(  ){ 
    
      return Math.round((1000 / this.averageLatency));
    
   },
  init( fps = this.fps,latencyAccumulator = create(List)() ){ 
    
      this.fps = fps;this.latencyAccumulator = latencyAccumulator;
      return this;
    
   },
  update( previous = this.previous,rate = this.rate ){ 
    
      (function() {
        if (this.state) {
          var now = Date.now();
          this.elapsed = (now - previous);
          setTimeout((() => {
          	return this.update();
          }));
          return (function() {
            if (this.elapsed > rate) {
              this.latencyAccumulator.push(this.elapsed);
              (function() {
                if (20 < this.latencyAccumulator.length) {
                  return this.latencyAccumulator.shift();
                }
              }).call(this);
              ++(this.ticks);
              this.previous = now;
              return this.events.emit("tick", this.ticks);
            }
          }).call(this);
        }
      }).call(this);
      return this;
    
   },
  start(  ){ 
    
      this.state = true;
      this.previous = Date.now();
      return this.update();
    
   },
  stop(  ){ 
    
      this.state = false;
      return this;
    
   }
 });
export { 
  Ticker
 };