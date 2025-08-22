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
 } from "../ecs.js";
var PositionInterface = Component.define("PositionInterface", { 
  _x:0,
  _y:0,
  z:0,
  get x(  ){ 
    
      return this._x;
    
   },
  get y(  ){ 
    
      return this._y;
    
   },
  get parentView(  ){ 
    
      return this.entity.propertyView.view;
    
   },
  get updateView__QUERY(  ){ 
    
      return (function() {
        if (this.entity.velocityInterface) {
          return this.entity.velocityInterface.updateView__QUERY;
        }
      }).call(this);
    
   },
  set y( y ){ 
    
      if( !(this.moved) ){ 
        this.system.queue.push(this)
       };
      this._y = y;
      return this.moved = true;
    
   },
  set x( x ){ 
    
      if( !(this.moved) ){ 
        this.system.queue.push(this)
       };
      this._x = x;
      return this.moved = true;
    
   },
  _clear(  ){ 
    
      this.x = null;
      this.y = null;
      this.z = null;
      return this.moved = false;
    
   }
 });
export { 
  PositionInterface
 };
var Position = System.define("Position", { 
  Component:PositionInterface,
  queue:[],
  shift( c,[ xshift, yshift ] ){ 
    
      c.x = (c._x + xshift);
      return c.y = (c._y + yshift);
    
   },
  move( entity,{ 
    x,
    y
   } ){ 
    
      var c = this.components.get(entity);
      c.x = x;
      return c.y = y;
    
   },
  _updateAll(  ){ 
    
      while( this.queue.length > 0 ){ 
        this._updateComponent(this.queue.pop())
       };
      return null;
    
   },
  wraps__QUERY:true,
  _updateComponent( c ){ 
    
      (function() {
        if (this.wraps__QUERY) {
          (function() {
            if (c._x < 0) {
              return c._x = (c._x + this.process.rendering.dimensions[0]);
            }
          }).call(this);
          (function() {
            if (c._y < 0) {
              return c._y = (c._y + this.process.rendering.dimensions[1]);
            }
          }).call(this);
          c._x = (c._x % this.process.rendering.dimensions[0]);
          return c._y = (c._y % this.process.rendering.dimensions[1]);
        }
      }).call(this);
      return c.moved = false;
    
   }
 });
export { 
  Position
 };