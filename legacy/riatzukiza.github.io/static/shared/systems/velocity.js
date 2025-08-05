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
import { 
  Vector
 } from "../vectors.js";
import { 
  Position
 } from "./position.js";
var VelocityInterface = Component.define("VelocityInterface", { 
  get parentView(  ){ 
    
      return this.entity.propertyView.view;
    
   },
  get updateView__QUERY(  ){ 
    
      return this.moved;
    
   },
  get xd(  ){ 
    
      return this.vector.x;
    
   },
  get yd(  ){ 
    
      return this.vector.y;
    
   },
  set xd( x ){ 
    
      (function() {
        if (isNaN(x)) {
          throw (new Error("assigning non number to velocity"))
        }
      }).call(this);
      return this.vector.x = x;
    
   },
  set yd( y ){ 
    
      (function() {
        if (isNaN(y)) {
          throw (new Error("assigning non number to velocity"))
        }
      }).call(this);
      return this.vector.y = y;
    
   },
  register(  ){ 
    
      return (function() {
        if (!(this.vector)) {
          return this.vector = Vector.spawn(0, 0);
        }
      }).call(this);
    
   },
  get pos(  ){ 
    
      return this.entity.positionInterface;
    
   },
  _clear(  ){ 
    
      this.xd = null;
      this.yd = null;
      this.priorX = null;
      return this.priorY = null;
    
   },
  accelerate( [ v1, v2 ] ){ 
    
      this.xd += v1;
      this.yd += v2;
      return this;
    
   }
 });
export { 
  VelocityInterface
 };
var Velocity = System.define("Velocity", { 
  Component:VelocityInterface,
  realTime__QUERY:true,
  _updateComponent( m ){ 
    
      var p = m.pos,
          { 
        xd,
        yd
       } = m;
      m.moved = false;
      return (function() {
        if (!((xd === 0 && yd === 0))) {
          m.priorX = p.x;
          m.priorY = p.y;
          m.moved = true;
          this.game.events.emit("move", m);
          return (function() {
            if (this.realTime__QUERY) {
              p.x = (p.x + (xd * (this.game.ticker.elapsed / 1000)));
              return p.y = (p.y + (yd * (this.game.ticker.elapsed / 1000)));
            } else {
              p.x = (p.x + xd);
              return p.y = (p.y + yd);
            }
          }).call(this);
        }
      }).call(this);
    
   }
 });
export { 
  Velocity
 };