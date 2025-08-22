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
  RedBlackTree
 } from "/shared/data-structures/trees/red-black-tree.js";
import { 
  config
 } from "../../config.js";
import { 
  Timer,
  TimeLimit
 } from "../timer.js";
import { 
  placeEntity
 } from "/shared/systems/collision.js";
import { 
  trailSegments
 } from "../../entities/trail-segments.js";
const views=(new Map());
var AntLife = TimeLimit.define("AntLife", { 
  duration:config.antLife,
  updateView__QUERY:true,
  defView:view,
  _clear(  ){ 
    
      TimeLimit._clear.call(this);
      this.views.delete(this.entity);
      this.winCount = 0;
      return this.looseCount = 0;
    
   },
  register(  ){ 
    
      TimeLimit.register.call(this);
      this.winCount = 0;
      return this.looseCount = 0;
    
   },
  get homePos(  ){ 
    
      return config.homeLocation;
    
   },
  get segGroup(  ){ 
    
      return getTrailSegments();
    
   },
  callback( e,c ){ 
    
      e.positionInterface.x = this.homePos.x;
      e.positionInterface.y = this.homePos.y;
      placeEntity(e, c.system.process, config);
      for (var seg of e.antTrail.segments)
      {
      seg.trailSegment.applyInverse()
      }
      ;
      ((c.looseCount)++);
      e.antTrail.segments.clear();
      return c.reset(config.antLifeDuration);
    
   }
 });
export { 
  AntLife
 };
var AntLifeTimer = Timer.define("AntLifeTimer", { 
  get defaultDuration(  ){ 
    
      return config.antLife;
    
   },
  interface:AntLife
 });
export { 
  AntLifeTimer
 };