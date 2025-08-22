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
  Component,
  System
 } from "/shared/ecs.js";
import { 
  Timer,
  TimeLimit
 } from "/client/obstacles/systems/timer.js";
import { 
  config
 } from "/client/obstacles/config.js";
import { 
  spawnAntTrailSegment
 } from "/client/obstacles/entities/trail-segments.js";
var AntTrail = Component.define("AntTrail", { 
  _clear(  ){ 
    
      return this.segments.each(((s) => {
      	return this.segments.delete(s);
      }));
    
   },
  register(  ){ 
    
      return (function() {
        if (!(this.segments)) {
          return this.segments = (new Set());
        }
      }).call(this);
    
   }
 });
export { 
  AntTrail
 };
var AntTrails = System.define("AntTrails", { 
  interface:AntTrail,
  get spawnAntTrailSegment(  ){ 
    
   },
  _updateComponent( c ){ 
    
      return (function() {
        if (((c.entity.id + c.system.process.ticker.ticks) % config.trailResolution) === 0) {
          return c.segments.add(this.spawnAntTrailSegment(c.entity));
        }
      }).call(this);
    
   }
 });
export { 
  AntTrails
 };