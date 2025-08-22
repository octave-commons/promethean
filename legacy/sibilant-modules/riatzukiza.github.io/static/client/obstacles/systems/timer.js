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
  BinarySearchTree
 } from "/shared/data-structures/trees/binary-search-tree.js";
import { 
  RedBlackTree
 } from "/shared/data-structures/trees/red-black-tree.js";
import { 
  config
 } from "/client/obstacles/config.js";
var TimeLimit = Component.define("TimeLimit", { 
  docString:"Obstacles.systems.Time-limit",
  addToTree(  ){ 
    
      return (function() {
        if (this.system.tree) {
          return this.system.tree.set(this.triggerTime, this);
        }
      }).call(this);
    
   },
  removeFromTree(  ){ 
    
      return (function() {
        if (this.system.tree) {
          return this.system.tree.remove(this.triggerTime, this);
        }
      }).call(this);
    
   },
  register(  ){ 
    
      ((this.system.started)++);
      this.createdAt = Date.now();
      this.triggered = false;
      return this.addToTree();
    
   },
  get duration(  ){ 
    
      throw (new Error("no duration was given to time limit component"))
    
   },
  get callback(  ){ 
    
      throw (new Error("No callback was given to time limit component"))
    
   },
  get triggerTime(  ){ 
    
      const r=(this.createdAt + this.duration);
      return (function() {
        if (isNaN(r)) {
          throw (new Error("Non number trigger time"))
        } else {
          return r;
        }
      }).call(this);
    
   },
  get elapsed(  ){ 
    
      return (Date.now() - this.createdAt);
    
   },
  get remainingTime(  ){ 
    
      return (this.duration - this.elapsed);
    
   },
  get expired(  ){ 
    
      return this.elapsed > this.duration;
    
   },
  reset( duration = this.duration ){ 
    
      ((this.system.started)++);
      this.removeFromTree();
      this.createdAt = Date.now();
      this.triggered = false;
      this.duration = duration;
      return this.addToTree();
    
   },
  _clear(  ){ 
    
      this.removeFromTree();
      return this.triggered = true;
    
   }
 });
export { 
  TimeLimit
 };
var Timer = System.define("Timer", { 
  docString:"Obstacles.systems.Timer",
  get defaultDuration(  ){ 
    
      return 5000;
    
   },
  register(  ){ 
    
      this.started = 0;
      this.firstTick = this.lastTickAt = Date.now();
      return this.tree = RedBlackTree.spawn();
    
   },
  _updateAll(  ){ 
    
      this.tree = this.tree.root;
      const now=Date.now();
      this.tree.forEachInRange(this.firstTick, now, ((c) => {
      	return this._updateComponent(c);
      }));
      return this.lastTickAt = now;
    
   },
  _updateComponent( c ){ 
    
      return (function() {
        if ((c.expired && !(c.triggered))) {
          c.triggered = true;
          return c.callback(c.entity, c);
        }
      }).call(this);
    
   }
 });
export { 
  Timer
 };